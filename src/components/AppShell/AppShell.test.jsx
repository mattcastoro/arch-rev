import { render, screen } from '@testing-library/react'
import AppShell from './AppShell'

describe('AppShell', () => {
  test('uses default header text and renders children', () => {
    render(
      <AppShell subheaderText="Subheader text">
        <div>Child content</div>
      </AppShell>,
    )

    expect(screen.getByRole('heading', { name: /architectural review for marvel hoa/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /subheader text/i })).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  test('supports custom header and no subheader', () => {
    render(
      <AppShell headerText="Custom Header">
        <div>Only child</div>
      </AppShell>,
    )

    expect(screen.getByRole('heading', { name: /custom header/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})
