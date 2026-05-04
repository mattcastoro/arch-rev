import { render, screen } from '@testing-library/react'
import Subheader from './Subheader'

test('renders subheader text', () => {
  render(<Subheader text="Sub Heading" />)
  expect(screen.getByRole('heading', { name: /sub heading/i })).toBeInTheDocument()
})
