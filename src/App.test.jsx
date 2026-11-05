import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  test('moves the request draft to a separate neighbor page and preserves details', async () => {
    const user = userEvent.setup()
    localStorage.setItem(storageKeys.SESSION_KEY, JSON.stringify({
      email: 'person@example.com',
      isAuthenticated: true,
      loginAt: 'now',
    }))
    renderAt('/requests/new')

    await user.selectOptions(screen.getByLabelText('Improvement Type 1*'), 'Painting')
    await user.type(screen.getByLabelText('Description 1*'), 'Paint the exterior')
    await user.click(screen.getByRole('button', { name: /next: add neighbors/i }))

    expect(screen.getByRole('heading', { name: /neighbor acknowledgments/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Description 1*')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: /request progress/i })).toHaveTextContent('1Request details2Neighbors3Review')
    expect(screen.getByText('Neighbors', { selector: '[aria-current="step"]' })).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: /no neighboring property can view/i }))
    await user.click(screen.getByRole('button', { name: /next: review request/i }))
    expect(screen.getByRole('heading', { name: /review request/i })).toBeInTheDocument()
    expect(screen.getByText('Review', { selector: '[aria-current="step"]' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^back$/i }))
    await user.click(screen.getByRole('button', { name: /^back$/i }))
    expect(screen.getByRole('heading', { name: /create new request/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Description 1*')).toHaveValue('Paint the exterior')
  })

  test('protects the neighbor and review request routes', async () => {
    const { unmount } = renderAt('/requests/new/neighbors')
    expect(await screen.findByRole('button', { name: /log in/i })).toBeInTheDocument()
    unmount()

    renderAt('/requests/new/review')
    expect(await screen.findByRole('button', { name: /log in/i })).toBeInTheDocument()
  })
})
