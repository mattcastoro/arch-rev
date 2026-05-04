import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  test('renders with defaults', () => {
    render(<Button>Click Me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('btn')
    expect(button).toHaveClass('primary')
    expect(button).toHaveClass('btn-md')
  })

  test('supports fullWidth and custom class', async () => {
    const onClick = jest.fn()
    const user = userEvent.setup()

    render(
      <Button
        type="submit"
        variant="secondary"
        size="btn-lg"
        fullWidth
        className="my-class"
        onClick={onClick}
      >
        Submit
      </Button>,
    )

    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toHaveClass('secondary')
    expect(button).toHaveClass('btn-lg')
    expect(button).toHaveClass('fullWidth')
    expect(button).toHaveClass('my-class')

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
