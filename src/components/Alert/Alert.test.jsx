import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Alert from './Alert'

describe('Alert', () => {
  test('renders title and message with dismiss button', async () => {
    const user = userEvent.setup()
    const onDismiss = jest.fn()

    render(
      <Alert title="Custom title" onDismiss={onDismiss}>
        Details message
      </Alert>,
    )

    expect(screen.getByText('Custom title')).toBeInTheDocument()
    expect(screen.getByText('Details message')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /dismiss alert/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  test('renders without message and without dismiss button', () => {
    render(<Alert />)
    expect(screen.getByText('Please check the form')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /dismiss alert/i })).not.toBeInTheDocument()
  })
})
