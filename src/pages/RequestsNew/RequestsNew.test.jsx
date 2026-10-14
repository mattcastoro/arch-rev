import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
    URL.createObjectURL = jest.fn(() => 'blob:test-preview')
    URL.revokeObjectURL = jest.fn()
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
    await user.upload(
      fileInput,
      new File([new Uint8Array(500_000)], 'first.pdf', { type: 'application/pdf' }),
    )
    await user.upload(
      fileInput,
      new File([new Uint8Array(2_000_000)], 'second.png', { type: 'image/png' }),
    )

    const selectedFiles = within(screen.getByRole('list', { name: 'Selected files 1' }))
      .getAllByRole('listitem')
    expect(selectedFiles[0]).toHaveTextContent('first.pdf')
    expect(selectedFiles[1]).toHaveTextContent('second.png')
    expect(fileInput).toHaveClass('requests-new-file-input')
    expect(screen.getByRole('progressbar', { name: 'Uploading first.pdf' })).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Uploading second.png' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
    expect(selectedFiles[0]).toHaveTextContent('500 KB')
    expect(selectedFiles[1]).toHaveTextContent('2 MB')
    expect(selectedFiles[0].querySelector('.requests-new-file-details')).not.toBeEmptyDOMElement()

    await user.click(screen.getByRole('button', { name: /submit request/i }))

    const [request] = JSON.parse(localStorage.getItem(storageKeys.REQUESTS_KEY))
    expect(request.improvements[0].files).toEqual([
      expect.objectContaining({ name: 'first.pdf' }),
      expect.objectContaining({ name: 'second.png' }),
    ])
  })

  test('removes a previously selected file before submission', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')

    const fileInput = screen.getByLabelText('Supporting Documentation 1')
    await user.upload(fileInput, [
      new File(['first'], 'first.pdf', { type: 'application/pdf' }),
      new File(['second'], 'second.png', { type: 'image/png' }),
    ])
    await user.click(screen.getByRole('button', { name: 'Remove first.pdf' }))

    expect(screen.queryByText('first.pdf')).not.toBeInTheDocument()
    expect(screen.getByText('second.png')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /submit request/i }))

    const [request] = JSON.parse(localStorage.getItem(storageKeys.REQUESTS_KEY))
    expect(request.improvements[0].files).toEqual([
      expect.objectContaining({ name: 'second.png' }),
    ])
  })

  test('previews uploaded images and PDFs', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    const fileInput = screen.getByLabelText('Supporting Documentation 1')
    await user.upload(fileInput, [
      new File(['image'], 'photo.png', { type: 'image/png' }),
      new File(['pdf'], 'plans.pdf', { type: 'application/pdf' }),
    ])

    await user.click(screen.getByRole('button', { name: 'photo.png' }))
    expect(screen.getByRole('dialog', { name: 'photo.png' })).toBeInTheDocument()
    expect(screen.getByAltText('Preview of photo.png')).toHaveAttribute('src', 'blob:test-preview')
    expect(screen.getByRole('link', { name: /open in new tab/i })).toHaveAttribute(
      'href',
      'blob:test-preview',
    )
    await user.click(screen.getByRole('button', { name: /close file preview/i }))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-preview')

    await user.click(screen.getByRole('button', { name: 'plans.pdf' }))
    expect(screen.getByTitle('Preview of plans.pdf')).toHaveAttribute('src', 'blob:test-preview')
  })

  test('rejects unsupported, empty, oversized, and excess files with inline errors', async () => {
    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    const input = screen.getByLabelText('Supporting Documentation 1')
    fireEvent.change(input, { target: { files: [new File(['text'], 'notes.txt', { type: 'text/plain' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Upload a PDF, JPG, or PNG')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Dismiss attachment error 1' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    fireEvent.change(input, { target: { files: [new File([], 'empty.pdf', { type: 'application/pdf' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('empty or unreadable')

    fireEvent.change(input, { target: { files: [new File([new Uint8Array(10_000_001)], 'large.pdf', { type: 'application/pdf' })] } })
    expect(screen.getByRole('alert')).toHaveTextContent('maximum file size is 10 MB')

    const files = Array.from({ length: 11 }, (_, index) => (
      new File(['pdf'], `plans-${index}.pdf`, { type: 'application/pdf' })
    ))
    fireEvent.change(input, { target: { files } })
    expect(screen.getByRole('alert')).toHaveTextContent('up to 10 files')
    expect(screen.getAllByRole('button', { name: /^plans-\d+\.pdf$/i })).toHaveLength(10)
  })

  test('asks before replacing a duplicate file', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    const input = screen.getByLabelText('Supporting Documentation 1')
    await user.upload(input, new File(['old'], 'plans.pdf', { type: 'application/pdf' }))
    await user.upload(input, new File(['new file'], 'plans.pdf', { type: 'application/pdf' }))

    const dialog = screen.getByRole('dialog', { name: /replace existing file/i })
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog', { name: /replace existing file/i })).not.toBeInTheDocument()

    await user.upload(input, new File(['new file'], 'plans.pdf', { type: 'application/pdf' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /replace file/i }))
    expect(screen.getAllByRole('button', { name: 'plans.pdf' })).toHaveLength(1)
  })

  test('offers device, website link, and camera attachment options', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /add attachment/i })
    await user.click(trigger)
    expect(screen.getByRole('menuitem', { name: /upload from device/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /add website link/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /take a photo/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Supporting Documentation 1')).toHaveAttribute(
      'accept',
      expect.stringContaining('application/pdf'),
    )
    expect(screen.getByLabelText('Take Photo 1')).toHaveAttribute('capture', 'environment')

    await user.click(screen.getByRole('heading', { name: /create new request/i }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await user.click(trigger)
    await user.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /upload from device/i }))
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /take a photo/i }))
  })

  test('adds, persists, and removes website links', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')
    const trigger = screen.getByRole('button', { name: /add attachment/i })
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /add website link/i }))

    const linkInput = screen.getByLabelText('Website Link 1')
    await user.type(linkInput, 'example.com')
    await user.click(screen.getByRole('button', { name: 'Add Link' }))
    expect(screen.getByText(/beginning with http/i)).toBeInTheDocument()

    await user.clear(linkInput)
    await user.type(linkInput, 'https://example.com/plans')
    await user.click(screen.getByRole('button', { name: 'Add Link' }))
    expect(screen.getByRole('link', { name: 'https://example.com/plans' })).toBeInTheDocument()
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /add website link/i }))
    await user.type(screen.getByLabelText('Website Link 1'), 'https://example.com/plans')
    await user.click(screen.getByRole('button', { name: 'Add Link' }))
    expect(screen.getByText('This website link has already been added.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove https://example.com/plans' }))
    expect(screen.queryByRole('link', { name: 'https://example.com/plans' })).not.toBeInTheDocument()

    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /add website link/i }))
    await user.clear(screen.getByLabelText('Website Link 1'))
    await user.type(screen.getByLabelText('Website Link 1'), 'https://example.com/final')
    await user.click(screen.getByRole('button', { name: 'Add Link' }))
    await user.click(screen.getByRole('button', { name: /submit request/i }))

    const [request] = JSON.parse(localStorage.getItem(storageKeys.REQUESTS_KEY))
    expect(request.improvements[0].links).toEqual([
      expect.objectContaining({ url: 'https://example.com/final' }),
    ])
    expect(request.links).toEqual(request.improvements[0].links)
  })

  test('cancels adding a website link and discards the draft', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    const trigger = screen.getByRole('button', { name: /add attachment/i })
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /add website link/i }))
    await user.type(screen.getByLabelText('Website Link 1'), 'unfinished-link')
    await user.click(screen.getByRole('button', { name: 'Add Link' }))
    expect(screen.getByText(/beginning with http/i)).toBeInTheDocument()

    await user.click(within(screen.getByLabelText('Website Link 1').closest('.requests-new-link-editor'))
      .getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText('Website Link 1')).not.toBeInTheDocument()
    expect(screen.queryByText(/beginning with http/i)).not.toBeInTheDocument()

    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: /add website link/i }))
    expect(screen.getByLabelText('Website Link 1')).toHaveValue('')
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
