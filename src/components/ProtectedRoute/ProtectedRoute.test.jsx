import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { storageKeys } from '../../lib/localData'

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={(
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          )}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('redirects to login when unauthenticated', () => {
    renderProtectedRoute()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  test('renders protected content when authenticated', () => {
    localStorage.setItem(storageKeys.SESSION_KEY, JSON.stringify({
      email: 'person@example.com',
      isAuthenticated: true,
      loginAt: 'now',
    }))

    renderProtectedRoute()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
