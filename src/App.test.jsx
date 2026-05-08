import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { storageKeys } from './lib/localData'

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routes', () => {
  beforeEach(() => {
    localStorage.clear()
  })

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

  test('protected home redirects to login when unauthenticated', async () => {
    renderAt('/home')
    expect(await screen.findByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  test('renders home page when authenticated', () => {
    localStorage.setItem(storageKeys.SESSION_KEY, JSON.stringify({
      email: 'person@example.com',
      isAuthenticated: true,
      loginAt: 'now',
    }))
    renderAt('/home')
    expect(screen.getByRole('heading', { name: /architectural review dashboard/i })).toBeInTheDocument()
  })

  test('protected new request redirects to login when unauthenticated', async () => {
    renderAt('/requests/new')
    expect(await screen.findByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  test('renders new request page when authenticated', () => {
    localStorage.setItem(storageKeys.SESSION_KEY, JSON.stringify({
      email: 'person@example.com',
      isAuthenticated: true,
      loginAt: 'now',
    }))
    renderAt('/requests/new')
    expect(screen.getByRole('heading', { name: /create new request/i })).toBeInTheDocument()
  })
})
