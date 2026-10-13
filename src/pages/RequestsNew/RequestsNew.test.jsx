import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RequestsNew from './RequestsNew'
import { storageKeys } from '../../lib/localData'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('RequestsNew', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
    localStorage.setItem(storageKeys.SESSION_KEY, JSON.stringify({
      email: 'resident@example.com',
      isAuthenticated: true,
      loginAt: 'now',
    }))
  })

  test('renders request form fields', () => {
    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /create new request/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Improvement Type 1*')).toBeInTheDocument()
    expect(screen.getByLabelText('Description 1*')).toHaveAttribute('placeholder', 'Describe Improvement *')
    expect(screen.getByLabelText('Supporting Documentation 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add improvement/i })).toBeInTheDocument()
  })

  test('cancel button navigates to home', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  test('confirms cancellation when the request contains entered data', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Description 1*'), 'Work in progress')
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))

    const dialog = screen.getByRole('dialog', { name: /cancel new request/i })
    expect(within(dialog).getByText(/entered information will not be saved/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: /continue editing/i }))
    expect(screen.queryByRole('dialog', { name: /cancel new request/i })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Description 1*')).toHaveValue('Work in progress')

    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /discard request/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  test('validates required fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /submit request/i }))
    expect(screen.getByText('Please complete the highlighted fields.')).toBeInTheDocument()
    expect(screen.getByLabelText('Improvement Type 1*')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Description 1*')).toHaveAttribute('aria-invalid', 'true')
  })

  test('submits request and stores metadata', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Test improvement request')

    const file = new File(['test'], 'quote.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Supporting Documentation 1'), file)

    await user.click(screen.getByRole('button', { name: /submit request/i }))

    const requests = JSON.parse(localStorage.getItem(storageKeys.REQUESTS_KEY))
    expect(requests).toHaveLength(1)
    expect(requests[0].ownerEmail).toBe('resident@example.com')
    expect(requests[0].improvements).toHaveLength(1)
    expect(requests[0].improvements[0].improvementType).toBe('Painting')
    expect(requests[0].files[0].name).toBe('quote.pdf')
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  test('appends files selected in subsequent uploads', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')

    const fileInput = screen.getByLabelText('Supporting Documentation 1')
    await user.upload(fileInput, new File(['first'], 'first.pdf', { type: 'application/pdf' }))
    await user.upload(fileInput, new File(['second'], 'second.png', { type: 'image/png' }))

    const selectedFiles = within(screen.getByRole('list', { name: 'Selected files 1' }))
      .getAllByRole('listitem')
    expect(selectedFiles.map((item) => item.textContent)).toEqual(['first.pdf', 'second.png'])

    await user.click(screen.getByRole('button', { name: /submit request/i }))

    const [request] = JSON.parse(localStorage.getItem(storageKeys.REQUESTS_KEY))
    expect(request.improvements[0].files).toEqual([
      expect.objectContaining({ name: 'first.pdf' }),
      expect.objectContaining({ name: 'second.png' }),
    ])
  })

  test('adds and submits multiple improvements with separate files', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')
    await user.upload(
      screen.getByLabelText('Supporting Documentation 1'),
      new File(['paint'], 'paint.pdf', { type: 'application/pdf' }),
    )
    await user.click(screen.getByRole('button', { name: /add improvement/i }))

    expect(screen.getAllByRole('region', { name: /improvement \d/i })).toHaveLength(2)
    await user.selectOptions(screen.getByLabelText('Improvement Type 2*'), 'Fencing')
    await user.type(screen.getByLabelText('Description 2*'), 'Replace the fence')
    await user.upload(
      screen.getByLabelText('Supporting Documentation 2'),
      new File(['fence'], 'fence.pdf', { type: 'application/pdf' }),
    )

    await user.click(screen.getByRole('button', { name: /submit request/i }))

    const [request] = JSON.parse(localStorage.getItem(storageKeys.REQUESTS_KEY))
    expect(request.improvements).toEqual([
      expect.objectContaining({
        improvementType: 'Painting',
        description: 'Paint the exterior',
        files: [expect.objectContaining({ name: 'paint.pdf' })],
      }),
      expect.objectContaining({
        improvementType: 'Fencing',
        description: 'Replace the fence',
        files: [expect.objectContaining({ name: 'fence.pdf' })],
      }),
    ])
  })

  test('validates required fields in added improvements', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')
    await user.click(screen.getByRole('button', { name: /add improvement/i }))
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    expect(screen.getByLabelText('Improvement Type 2*')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Description 2*')).toHaveAttribute('aria-invalid', 'true')
    expect(localStorage.getItem(storageKeys.REQUESTS_KEY)).toBeNull()
  })

  test('does not add an improvement until required fields are complete', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /add improvement/i }))

    expect(screen.getAllByRole('region', { name: /improvement \d/i })).toHaveLength(1)
    expect(screen.getByText('Please complete the highlighted fields.')).toBeInTheDocument()
    expect(screen.getByLabelText('Improvement Type 1*')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Description 1*')).toHaveAttribute('aria-invalid', 'true')
  })

  test('removes an empty added improvement without confirmation', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')
    await user.click(screen.getByRole('button', { name: /add improvement/i }))
    await user.click(screen.getByRole('button', { name: /remove improvement 2/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getAllByRole('region', { name: /improvement \d/i })).toHaveLength(1)
  })

  test('confirms before removing an improvement containing data', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')
    await user.click(screen.getByRole('button', { name: /add improvement/i }))
    await user.type(screen.getByLabelText('Description 2*'), 'Some entered information')
    await user.click(screen.getByRole('button', { name: /remove improvement 2/i }))

    const dialog = screen.getByRole('dialog', { name: /delete improvement/i })
    expect(dialog).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))
    expect(screen.getAllByRole('region', { name: /improvement \d/i })).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: /remove improvement 2/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /delete improvement/i }))
    expect(screen.getAllByRole('region', { name: /improvement \d/i })).toHaveLength(1)
  })

  test('redirects to login if session is missing', async () => {
    const user = userEvent.setup()
    localStorage.removeItem(storageKeys.SESSION_KEY)

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'No session request')
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    expect(screen.getByText('Please log in before creating a request.')).toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('dismisses form alert', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /submit request/i }))
    await user.click(screen.getByRole('button', { name: /dismiss alert/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
