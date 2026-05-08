import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'
import { storageKeys } from '../../lib/localData'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('Home', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
    localStorage.setItem(storageKeys.SESSION_KEY, JSON.stringify({
      email: 'resident@example.com',
      isAuthenticated: true,
      loginAt: 'now',
    }))
  })

  test('shows Requests tab panel by default', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /^requests$/i })).toBeInTheDocument()
    expect(screen.getByRole('tabpanel', { name: /requests/i })).toBeInTheDocument()
    expect(screen.getByText(/signed in as resident@example.com/i)).toBeInTheDocument()
  })

  test('renders without signed-in text when no session email exists', () => {
    localStorage.clear()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.queryByText(/signed in as/i)).not.toBeInTheDocument()
  })

  test('switches tabs on desktop sidebar', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('tab', { name: /profile section/i }))
    expect(screen.getByRole('tabpanel', { name: /profile/i })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /support section/i }))
    expect(screen.getByRole('tabpanel', { name: /support/i })).toBeInTheDocument()
  })

  test('opens and closes create modal from desktop button', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const desktopCreateButton = container.querySelector('.home-desktop-create')
    expect(desktopCreateButton).not.toBeNull()

    await user.click(desktopCreateButton)
    expect(screen.getByRole('dialog', { name: /create request modal/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close create request modal/i }))
    expect(screen.queryByRole('dialog', { name: /create request modal/i })).not.toBeInTheDocument()
  })

  test('modal footer close button closes create modal', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const desktopCreateButton = container.querySelector('.home-desktop-create')
    expect(desktopCreateButton).not.toBeNull()

    await user.click(desktopCreateButton)
    expect(screen.getByRole('dialog', { name: /create request modal/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^close$/i }))
    expect(screen.queryByRole('dialog', { name: /create request modal/i })).not.toBeInTheDocument()
  })

  test('mobile menu opens and selecting a drawer tab closes it', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))

    const drawerHeading = screen.getByRole('heading', { name: /sections/i })
    const drawer = drawerHeading.closest('.home-mobile-drawer')
    expect(drawer).not.toBeNull()

    const supportDrawerTab = within(drawer).getByRole('tab', { name: /support section/i })
    await user.click(supportDrawerTab)

    expect(screen.queryByRole('heading', { name: /sections/i })).not.toBeInTheDocument()
    expect(screen.getByRole('tabpanel', { name: /support/i })).toBeInTheDocument()
  })

  test('mobile overlay closes drawer', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(screen.getByRole('heading', { name: /sections/i })).toBeInTheDocument()

    const overlay = document.querySelector('.home-mobile-overlay')
    expect(overlay).not.toBeNull()
    await user.click(overlay)

    expect(screen.queryByRole('heading', { name: /sections/i })).not.toBeInTheDocument()
  })

  test('mobile drawer close button closes drawer', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))
    expect(screen.getByRole('heading', { name: /sections/i })).toBeInTheDocument()

    const closeButtons = screen.getAllByRole('button', { name: /close navigation menu/i })
    await user.click(closeButtons[1])

    expect(screen.queryByRole('heading', { name: /sections/i })).not.toBeInTheDocument()
  })

  test('mobile create button navigates to new request page', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const mobileCreateButton = container.querySelector('.home-mobile-create button')
    expect(mobileCreateButton).not.toBeNull()
    await user.click(mobileCreateButton)

    expect(mockNavigate).toHaveBeenCalledWith('/requests/new')
  })

  test('requests panel shows persisted user requests', () => {
    localStorage.setItem(storageKeys.REQUESTS_KEY, JSON.stringify([
      {
        id: 'req_1',
        ownerEmail: 'resident@example.com',
        improvementType: 'Fence',
        description: 'Replace front fence',
        files: [{ name: 'fence.pdf', size: 100, type: 'application/pdf' }],
        status: 'Submitted',
        createdAt: 'now',
      },
      {
        id: 'req_2',
        ownerEmail: 'other@example.com',
        improvementType: 'Paint',
        description: 'Paint exterior',
        files: [],
        status: 'Submitted',
        createdAt: 'now',
      },
    ]))

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /fence/i })).toBeInTheDocument()
    expect(screen.queryByText(/paint exterior/i)).not.toBeInTheDocument()
  })

  test('logout clears session and navigates to login', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    const logoutButtons = screen.getAllByRole('button', { name: /log out/i })
    await user.click(logoutButtons[0])

    expect(localStorage.getItem(storageKeys.SESSION_KEY)).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
