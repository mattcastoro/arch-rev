import { render, screen } from '@testing-library/react'
import FormField from './FormField'

describe('FormField', () => {
  test('renders with defaults and required marker', () => {
    render(<FormField label="Email" id="email" required />)

    const input = screen.getByLabelText('Email*')
    expect(input).toHaveAttribute('id', 'email')
    expect(input).toHaveAttribute('name', 'email')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toBeRequired()
  })

  test('supports custom props', () => {
    render(
      <FormField
        label="Phone"
        id="phone"
        name="phoneNumber"
        type="tel"
        placeholder="555-555-5555"
        labelPosition="top"
      />,
    )

    const input = screen.getByLabelText('Phone')
    expect(input).toHaveAttribute('name', 'phoneNumber')
    expect(input).toHaveAttribute('type', 'tel')
    expect(input).toHaveAttribute('placeholder', '555-555-5555')
    expect(input).not.toBeRequired()
  })
})
