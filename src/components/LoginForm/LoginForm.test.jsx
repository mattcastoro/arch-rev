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
})
