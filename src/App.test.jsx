import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routes', () => {
  test('redirects / to login page', async () => {
    renderAt('/')
    expect(await screen.findByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  test('renders signup page', () => {
    renderAt('/signup')
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  test('renders forgot password page', () => {
    renderAt('/forgot-password')
    expect(screen.getByRole('button', { name: /send temporary code/i })).toBeInTheDocument()
  })

  test('renders reset password page', () => {
    renderAt('/reset-password')
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  test('renders home page', () => {
    renderAt('/home')
    expect(screen.getByRole('heading', { name: /welcome to the home page/i })).toBeInTheDocument()
  })
})
