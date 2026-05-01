import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ResetPasswordForm from './ResetPasswordForm'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  test('shows validation when required fields are missing', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(
      screen.getByText('Temporary code and both password fields are required.'),
    ).toBeInTheDocument()
  })

  test('shows validation when passwords do not match', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/temporary code/i), 'ABC123')
    await user.type(screen.getByLabelText(/new password/i, { selector: '#newPassword' }), 'Password1!')
    await user.type(screen.getByLabelText(/confirm new password/i, { selector: '#confirmNewPassword' }), 'Password2!')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(
      screen.getByText('New password and confirmation password must match.'),
    ).toBeInTheDocument()
  })

  test('cancel button returns to login', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
