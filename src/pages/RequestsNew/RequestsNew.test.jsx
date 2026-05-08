import { render, screen } from '@testing-library/react'
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
    expect(screen.getByLabelText('Improvement Type*')).toBeInTheDocument()
    expect(screen.getByLabelText('Description*')).toBeInTheDocument()
    expect(screen.getByLabelText('Supporting Documentation')).toBeInTheDocument()
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

  test('validates required fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /submit request/i }))
    expect(screen.getByText('Improvement type and description are required.')).toBeInTheDocument()
  })

  test('submits request and stores metadata', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type*'), 'Paint')
    await user.type(screen.getByLabelText('Description*'), 'Test improvement request')

    const file = new File(['test'], 'quote.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Supporting Documentation'), file)

    await user.click(screen.getByRole('button', { name: /submit request/i }))

    const requests = JSON.parse(localStorage.getItem(storageKeys.REQUESTS_KEY))
    expect(requests).toHaveLength(1)
    expect(requests[0].ownerEmail).toBe('resident@example.com')
    expect(requests[0].files[0].name).toBe('quote.pdf')
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  test('redirects to login if session is missing', async () => {
    const user = userEvent.setup()
    localStorage.removeItem(storageKeys.SESSION_KEY)

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.selectOptions(screen.getByLabelText('Improvement Type*'), 'Paint')
    await user.type(screen.getByLabelText('Description*'), 'No session request')
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
