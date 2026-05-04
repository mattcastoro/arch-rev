import { render, screen } from '@testing-library/react'
import Header from './Header'

test('renders header text', () => {
  render(<Header text="Main Header" />)
  expect(screen.getByRole('heading', { name: /main header/i })).toBeInTheDocument()
})
