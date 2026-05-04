import { render, screen } from '@testing-library/react'
import Paragraph from './Paragraph'

test('renders paragraph text', () => {
  render(<Paragraph text="Support text" />)
  expect(screen.getByRole('heading', { name: /support text/i })).toBeInTheDocument()
})
