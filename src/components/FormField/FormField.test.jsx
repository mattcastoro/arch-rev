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

  test('renders a select field', () => {
    render(
      <FormField
        as="select"
        label="Improvement Type"
        id="improvementType"
        required
        options={[
          { label: 'Paint', value: 'Paint' },
          { label: 'Fence', value: 'Fence' },
        ]}
      />,
    )

    const select = screen.getByLabelText('Improvement Type*')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Paint' })).toBeInTheDocument()
  })

  test('renders a textarea field', () => {
    render(
      <FormField
        as="textarea"
        label="Description"
        id="description"
        rows={6}
      />,
    )

    const textarea = screen.getByLabelText('Description')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('rows', '6')
  })
})
