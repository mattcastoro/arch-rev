import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginForm from './LoginForm'
import { storageKeys } from '../../lib/localData'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
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

  test('shows error for unknown email account', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email*'), 'unknown@example.com')
    await user.type(screen.getByLabelText('Password*'), 'abc123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getByText('No account found for this email.')).toBeInTheDocument()
  })

  test('shows error for incorrect password', async () => {
    const user = userEvent.setup()
    localStorage.setItem(storageKeys.USERS_KEY, JSON.stringify([
      { email: 'valid@example.com', password: 'right-password', streetAddress: '1 test', residents: [], createdAt: 'now' },
    ]))

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email*'), 'valid@example.com')
    await user.type(screen.getByLabelText('Password*'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getByText('Incorrect password.')).toBeInTheDocument()
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
    localStorage.setItem(storageKeys.USERS_KEY, JSON.stringify([
      { email: 'valid@example.com', password: 'abc123', streetAddress: '1 test', residents: [], createdAt: 'now' },
    ]))

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
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })
})
