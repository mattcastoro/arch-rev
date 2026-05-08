import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SignUpForm from './SignUpForm'
import { storageKeys } from '../../lib/localData'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    localStorage.clear()
  })

  test('adds and removes second person section', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /person 1/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /person 2/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add person/i }))
    expect(screen.getByRole('heading', { name: /person 2/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add person/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /remove second person/i }))
    expect(screen.queryByRole('heading', { name: /person 2/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add person/i })).toBeInTheDocument()
  })

  test('submits with two residents and stores secondary role', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /add person/i }))

    await user.type(screen.getByLabelText('Street Address*'), '123 Main St')
    await user.type(screen.getByLabelText('Create Password*'), 'abc123')
    await user.type(screen.getByLabelText('First Name*', { selector: '#firstName-1' }), 'Tony')
    await user.type(screen.getByLabelText('Last Name*', { selector: '#lastName-1' }), 'Stark')
    await user.type(screen.getByLabelText('Email*', { selector: '#email-1' }), 'tony@example.com')
    await user.type(screen.getByLabelText('Phone*', { selector: '#phone-1' }), '5551234567')

    await user.type(screen.getByLabelText('First Name*', { selector: '#firstName-2' }), 'Pepper')
    await user.type(screen.getByLabelText('Last Name*', { selector: '#lastName-2' }), 'Potts')
    await user.type(screen.getByLabelText('Email*', { selector: '#email-2' }), 'pepper@example.com')
    await user.type(screen.getByLabelText('Phone*', { selector: '#phone-2' }), '5550001111')

    await user.click(screen.getByRole('button', { name: /^create$/i }))

    const users = JSON.parse(localStorage.getItem(storageKeys.USERS_KEY))
    expect(users[0].residents).toHaveLength(2)
    expect(users[0].residents[1].role).toBe('Secondary')
  })

  test('shows validation for missing required fields', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(screen.getByText(/please complete:/i)).toBeInTheDocument()
  })

  test('shows validation for invalid email', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Street Address*'), '123 Main St')
    await user.type(screen.getByLabelText('Create Password*'), 'abc123')
    await user.type(screen.getByLabelText('First Name*'), 'Tony')
    await user.type(screen.getByLabelText('Last Name*'), 'Stark')
    await user.type(screen.getByLabelText('Email*'), 'not-an-email')
    await user.type(screen.getByLabelText('Phone*'), '5551234567')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
  })

  test('cancel navigates to login', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('dismisses alert and has no alert on valid submission', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /^create$/i }))
    await user.click(screen.getByRole('button', { name: /dismiss alert/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Street Address*'), '123 Main St')
    await user.type(screen.getByLabelText('Create Password*'), 'abc123')
    await user.type(screen.getByLabelText('First Name*'), 'Tony')
    await user.type(screen.getByLabelText('Last Name*'), 'Stark')
    await user.type(screen.getByLabelText('Email*'), 'tony@example.com')
    await user.type(screen.getByLabelText('Phone*'), '5551234567')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  test('shows duplicate email error when account already exists', async () => {
    const user = userEvent.setup()
    localStorage.setItem(storageKeys.USERS_KEY, JSON.stringify([
      { email: 'tony@example.com', password: 'existing', streetAddress: '1 test', residents: [], createdAt: 'now' },
    ]))

    render(
      <MemoryRouter>
        <SignUpForm />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Street Address*'), '123 Main St')
    await user.type(screen.getByLabelText('Create Password*'), 'abc123')
    await user.type(screen.getByLabelText('First Name*'), 'Tony')
    await user.type(screen.getByLabelText('Last Name*'), 'Stark')
    await user.type(screen.getByLabelText('Email*'), 'tony@example.com')
    await user.type(screen.getByLabelText('Phone*'), '5551234567')
    await user.click(screen.getByRole('button', { name: /^create$/i }))

    expect(screen.getByText('An account with this email already exists.')).toBeInTheDocument()
  })
})
