import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RequestsNew from './RequestsNew'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('RequestsNew', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  test('renders structured placeholder sections', () => {
    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /create new request/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /project details/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /documents/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /review & submit/i })).toBeInTheDocument()
  })

  test('back button navigates to home', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RequestsNew />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /back to home/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })
})
