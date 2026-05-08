import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ResetPasswordForm from './ResetPasswordForm'
import { createPasswordResetCode, storageKeys } from '../../lib/localData'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
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

  test('does not show an alert on valid submission', async () => {
    const user = userEvent.setup()
    localStorage.setItem(storageKeys.USERS_KEY, JSON.stringify([
      { email: 'person@example.com', password: 'old-password', streetAddress: '1 test', residents: [], createdAt: 'now' },
    ]))
    const codeResult = createPasswordResetCode('person@example.com')

    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/temporary code/i), codeResult.code)
    await user.type(screen.getByLabelText(/new password/i, { selector: '#newPassword' }), 'Password1!')
    await user.type(screen.getByLabelText(/confirm new password/i, { selector: '#confirmNewPassword' }), 'Password1!')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('dismisses alert after validation error', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /reset password/i }))
    await user.click(screen.getByRole('button', { name: /dismiss alert/i }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  test('shows validation for invalid or expired temporary code', async () => {
    const user = userEvent.setup()
    localStorage.setItem(storageKeys.USERS_KEY, JSON.stringify([
      { email: 'person@example.com', password: 'old-password', streetAddress: '1 test', residents: [], createdAt: 'now' },
    ]))

    render(
      <MemoryRouter>
        <ResetPasswordForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/temporary code/i), '999999')
    await user.type(screen.getByLabelText(/new password/i, { selector: '#newPassword' }), 'Password1!')
    await user.type(screen.getByLabelText(/confirm new password/i, { selector: '#confirmNewPassword' }), 'Password1!')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(screen.getByText('Temporary code is invalid or expired.')).toBeInTheDocument()
  })
})
