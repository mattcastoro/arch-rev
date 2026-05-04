import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from './LoginForm'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  test('shows validation when email and password are missing', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      screen.getByText('Email and password are required before logging in.'),
    ).toBeInTheDocument()
  })

  test('navigates to forgot password page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /forgot your password/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password')
  })

  test('shows validation when email format is invalid', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email*'), 'invalid-email')
    await user.type(screen.getByLabelText('Password*'), 'abc123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
  })

  test('navigates to sign up page', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/signup')
  })

  test('clears alert after valid submit and supports dismiss', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /log in/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /dismiss alert/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Email*'), 'valid@example.com')
    await user.type(screen.getByLabelText('Password*'), 'abc123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
