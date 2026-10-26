import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

describe('Login', () => {
  test('shows and dismisses the local-storage development notice', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    const dialog = screen.getByRole('dialog', {
      name: /this application is still in development/i,
    })

    expect(dialog).toHaveTextContent(/create an account and test the application/i)
    expect(dialog).toHaveTextContent(/stored only in this browser’s local storage on this device/i)
    expect(dialog).toHaveTextContent(/may be lost if you clear your browser data/i)

    const acknowledgeButton = screen.getByRole('button', { name: /i understand/i })
    expect(acknowledgeButton).toHaveFocus()

    await user.click(acknowledgeButton)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
