import {
  clearSession,
  createPasswordResetCode,
  createRequest,
  createUser,
  findUserByEmail,
  getCurrentUserEmail,
  getRequests,
  getRequestsByOwner,
  getScheduledReviewDate,
  getSession,
  getUsers,
  isAuthenticated,
  resetPasswordWithCode,
  setSession,
  storageKeys,
  updateUserPassword,
  validateLogin,
  createRequestTitle,
} from './localData'

describe('localData', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('getUsers handles invalid json fallback', () => {
    localStorage.setItem(storageKeys.USERS_KEY, '{invalid json')
    expect(getUsers()).toEqual([])
  })

  test('createUser and findUserByEmail lifecycle', () => {
    const createResult = createUser({
      email: 'Person@Example.com',
      password: 'secret',
      streetAddress: '123 Main St',
      residents: [{ firstName: 'Tony' }],
    })

    expect(createResult.ok).toBe(true)
    expect(findUserByEmail('person@example.com').email).toBe('person@example.com')

    const duplicateResult = createUser({
      email: 'person@example.com',
      password: 'new-secret',
      streetAddress: '123 Main St',
      residents: [],
    })

    expect(duplicateResult.ok).toBe(false)
  })

  test('updateUserPassword and validateLogin branches', () => {
    createUser({
      email: 'person@example.com',
      password: 'secret',
      streetAddress: '123 Main St',
      residents: [],
    })
    createUser({
      email: 'other@example.com',
      password: 'other-secret',
      streetAddress: '456 Main St',
      residents: [],
    })

    expect(validateLogin('missing@example.com', 'secret').ok).toBe(false)
    expect(validateLogin('person@example.com', 'wrong').ok).toBe(false)
    expect(validateLogin('person@example.com', 'secret').ok).toBe(true)

    updateUserPassword('person@example.com', 'updated')
    expect(validateLogin('person@example.com', 'updated').ok).toBe(true)
    expect(validateLogin('other@example.com', 'other-secret').ok).toBe(true)
  })

  test('session helpers lifecycle', () => {
    expect(getSession()).toBeNull()
    expect(isAuthenticated()).toBe(false)

    setSession('person@example.com')
    expect(getCurrentUserEmail()).toBe('person@example.com')
    expect(isAuthenticated()).toBe(true)

    clearSession()
    expect(isAuthenticated()).toBe(false)
  })

  test('getCurrentUserEmail returns null when email is missing in session object', () => {
    localStorage.setItem(storageKeys.SESSION_KEY, JSON.stringify({ isAuthenticated: true }))
    expect(getCurrentUserEmail()).toBeNull()
  })

  test('request helpers save and filter by owner', () => {
    createRequest({
      ownerEmail: 'person@example.com',
      improvementType: 'Paint',
      description: 'Paint house',
      files: [{ name: 'a.pdf', size: 10, type: 'application/pdf' }],
    })

    createRequest({
      ownerEmail: 'other@example.com',
      improvementType: 'Fence',
      description: 'Fence work',
      files: [],
    })

    const ownerRequests = getRequestsByOwner('PERSON@example.com')
    expect(ownerRequests).toHaveLength(1)
    expect(ownerRequests[0].status).toBe('In progress')
    expect(ownerRequests[0].improvements).toEqual([
      expect.objectContaining({ improvementType: 'Paint', description: 'Paint house' }),
    ])
    expect(getRequests()).toHaveLength(2)
  })

  test('request helpers save multiple improvements and expose the first for compatibility', () => {
    const request = createRequest({
      ownerEmail: 'person@example.com',
      improvements: [
        { improvementType: 'Painting', description: 'Paint house', files: [] },
        { improvementType: 'Fencing', description: 'Replace fence', files: [] },
      ],
    })

    expect(request.improvements).toHaveLength(2)
    expect(request.improvementType).toBe('Painting')
    expect(request.description).toBe('Paint house')
    expect(request.files).toEqual([])
    expect(request.revision).toBe(1)
    expect(request.committeeStatus).toBe('Not reviewed')
    expect(request.neighborAcknowledgmentStatus).toBe('Pending')
    expect(request.title).toMatch(/^[A-Z][a-z]+ \d{4} — Painting, Fencing$/)
    expect(request.scheduledReviewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('assigns requests to the next second-Monday meeting', () => {
    expect(getScheduledReviewDate(new Date(2026, 9, 4, 12))).toEqual(new Date(2026, 9, 12))
    expect(getScheduledReviewDate(new Date(2026, 9, 12, 0))).toEqual(new Date(2026, 10, 9))
    expect(getScheduledReviewDate(new Date(2026, 9, 15, 12))).toEqual(new Date(2026, 10, 9))
  })

  test('summarizes four or more improvements with an ellipsis', () => {
    const title = createRequestTitle([
      { improvementType: 'Painting' },
      { improvementType: 'Fencing' },
      { improvementType: 'Windows' },
      { improvementType: 'Roofing' },
    ], new Date(2026, 10, 9))

    expect(title).toBe('November 2026 — Painting, Fencing, Windows, …')
  })

  test('request helpers initialize optional neighbor acknowledgments', () => {
    const request = createRequest({
      ownerEmail: 'person@example.com',
      improvements: [{ improvementType: 'Painting', description: 'Paint house', files: [] }],
      noVisibleNeighbors: true,
    })

    expect(request.neighbors).toEqual([])
    expect(request.noVisibleNeighbors).toBe(true)
    expect(request.neighborAcknowledgmentStatus).toBe('Not required')
  })

  test('request helpers initialize pending neighbors with normalized emails', () => {
    const request = createRequest({
      ownerEmail: 'person@example.com',
      improvements: [{ improvementType: 'Painting', description: 'Paint house', files: [] }],
      neighbors: [{
        id: 'neighbor-1',
        fullName: 'Jordan Smith',
        streetAddress: '12 Oak St',
        email: 'JORDAN@example.com',
      }],
    })

    expect(request.neighbors).toEqual([
      expect.objectContaining({
        id: 'neighbor-1',
        email: 'jordan@example.com',
        status: 'pending',
        acknowledgedAt: null,
        removalReason: null,
      }),
    ])
  })

  test('password reset code flow validates and updates password', () => {
    createUser({
      email: 'person@example.com',
      password: 'secret',
      streetAddress: '123 Main St',
      residents: [],
    })

    expect(createPasswordResetCode('missing@example.com').ok).toBe(false)

    const codeResult = createPasswordResetCode('person@example.com')
    expect(codeResult.ok).toBe(true)

    const invalidResult = resetPasswordWithCode('999999', 'new-password')
    expect(invalidResult.ok).toBe(false)

    const validResult = resetPasswordWithCode(codeResult.code, 'new-password')
    expect(validResult.ok).toBe(true)
    expect(validateLogin('person@example.com', 'new-password').ok).toBe(true)

    const reusedCodeResult = resetPasswordWithCode(codeResult.code, 'another-password')
    expect(reusedCodeResult.ok).toBe(false)
  })

  test('createPasswordResetCode replaces prior code for same user', () => {
    createUser({
      email: 'person@example.com',
      password: 'secret',
      streetAddress: '123 Main St',
      residents: [],
    })

    const firstCode = createPasswordResetCode('person@example.com')
    const secondCode = createPasswordResetCode('person@example.com')

    expect(firstCode.ok).toBe(true)
    expect(secondCode.ok).toBe(true)

    const resetRecords = JSON.parse(localStorage.getItem(storageKeys.RESET_KEY))
    expect(resetRecords).toHaveLength(1)
    expect(resetRecords[0].code).toBe(secondCode.code)
  })

  test('expired reset code is cleared and rejected', () => {
    createUser({
      email: 'person@example.com',
      password: 'secret',
      streetAddress: '123 Main St',
      residents: [],
    })

    localStorage.setItem(storageKeys.RESET_KEY, JSON.stringify([
      { email: 'person@example.com', code: '111111', expiresAt: Date.now() - 1000 },
    ]))

    const resetResult = resetPasswordWithCode('111111', 'new-password')
    expect(resetResult.ok).toBe(false)
    expect(JSON.parse(localStorage.getItem(storageKeys.RESET_KEY))).toEqual([])
  })
})
