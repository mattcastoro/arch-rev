import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ForgotPasswordForm from './ForgotPasswordForm'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  test('shows validation message when email is empty', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /send temporary code/i }))

    expect(
      screen.getByText('Email is required to send a temporary code.'),
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  test('navigates to reset password when email is valid', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email*'), 'person@example.com')
    await user.click(screen.getByRole('button', { name: /send temporary code/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/reset-password')
  })
})
