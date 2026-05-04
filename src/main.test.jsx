const mockRender = jest.fn()
const mockCreateRoot = jest.fn(() => ({ render: mockRender }))

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}))

jest.mock('./App.jsx', () => () => <div>Mocked App</div>)

describe('main bootstrap', () => {
  test('mounts app to root element', async () => {
    document.body.innerHTML = '<div id="root"></div>'

    await import('./main.jsx')

    expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'))
    expect(mockRender).toHaveBeenCalledTimes(1)
  })
})
