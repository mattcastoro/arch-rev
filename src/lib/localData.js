const USERS_KEY = 'arch_rev_users'
const SESSION_KEY = 'arch_rev_session'
const REQUESTS_KEY = 'arch_rev_requests'
const RESET_KEY = 'arch_rev_password_reset'

const RESET_CODE_LIFETIME_MS = 15 * 60 * 1000

function readJson(key, fallback) {
  const value = localStorage.getItem(key)
  if (!value) return fallback

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getUsers() {
  return readJson(USERS_KEY, [])
}

export function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase()
  return getUsers().find((user) => user.email.toLowerCase() === normalizedEmail)
}

export function createUser(userInput) {
  const users = getUsers()
  const normalizedEmail = userInput.email.toLowerCase()

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, message: 'An account with this email already exists.' }
  }

  const user = {
    email: normalizedEmail,
    password: userInput.password,
    streetAddress: userInput.streetAddress,
    residents: userInput.residents,
    createdAt: new Date().toISOString(),
  }

  writeJson(USERS_KEY, [...users, user])
  return { ok: true, user }
}

export function updateUserPassword(email, newPassword) {
  const normalizedEmail = email.toLowerCase()
  const users = getUsers()
  const nextUsers = users.map((user) => (
    user.email.toLowerCase() === normalizedEmail
      ? { ...user, password: newPassword }
      : user
  ))

  writeJson(USERS_KEY, nextUsers)
}

export function validateLogin(email, password) {
  const user = findUserByEmail(email)
  if (!user) return { ok: false, message: 'No account found for this email.' }
  if (user.password !== password) return { ok: false, message: 'Incorrect password.' }
  return { ok: true, user }
}

export function setSession(email) {
  writeJson(SESSION_KEY, {
    email: email.toLowerCase(),
    isAuthenticated: true,
    loginAt: new Date().toISOString(),
  })
}

export function getSession() {
  return readJson(SESSION_KEY, null)
}

export function isAuthenticated() {
  const session = getSession()
  return Boolean(session?.isAuthenticated && session?.email)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUserEmail() {
  const session = getSession()
  return session?.email ?? null
}

export function getRequests() {
  return readJson(REQUESTS_KEY, [])
}

export function getRequestsByOwner(email) {
  const normalizedEmail = email.toLowerCase()
  return getRequests().filter((request) => request.ownerEmail.toLowerCase() === normalizedEmail)
}

export function createRequest(requestInput) {
  const requests = getRequests()
  const request = {
    id: `req_${Date.now()}`,
    ownerEmail: requestInput.ownerEmail.toLowerCase(),
    improvementType: requestInput.improvementType,
    description: requestInput.description,
    files: requestInput.files,
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  }

  writeJson(REQUESTS_KEY, [...requests, request])
  return request
}

export function createPasswordResetCode(email) {
  const user = findUserByEmail(email)
  if (!user) return { ok: false, message: 'No account found for this email.' }

  const resetRecords = readJson(RESET_KEY, [])
  const code = `${Math.floor(100000 + Math.random() * 900000)}`
  const nextRecord = {
    email: user.email,
    code,
    expiresAt: Date.now() + RESET_CODE_LIFETIME_MS,
  }

  const filtered = resetRecords.filter((record) => record.email !== user.email)
  writeJson(RESET_KEY, [...filtered, nextRecord])

  return { ok: true, email: user.email, code }
}

function getValidResetRecordByCode(code) {
  const resetRecords = readJson(RESET_KEY, [])
  const now = Date.now()

  const nextRecords = resetRecords.filter((record) => record.expiresAt > now)
  if (nextRecords.length !== resetRecords.length) {
    writeJson(RESET_KEY, nextRecords)
  }

  return nextRecords.find((record) => record.code === code)
}

export function resetPasswordWithCode(code, newPassword) {
  const record = getValidResetRecordByCode(code)
  if (!record) {
    return { ok: false, message: 'Temporary code is invalid or expired.' }
  }

  updateUserPassword(record.email, newPassword)

  const resetRecords = readJson(RESET_KEY, [])
  const nextRecords = resetRecords.filter((item) => item.email !== record.email)
  writeJson(RESET_KEY, nextRecords)

  return { ok: true, email: record.email }
}

export const storageKeys = {
  USERS_KEY,
  SESSION_KEY,
  REQUESTS_KEY,
  RESET_KEY,
}
