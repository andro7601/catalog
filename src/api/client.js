const API_BASE_URL = 'https://api.redclass.redberryinternship.ge/api'
const TOKEN_KEY = 'authToken'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function buildHeaders(customHeaders = {}, hasBody = false) {
  const token = getToken()
  const headers = { ...customHeaders }

  if (hasBody && !(customHeaders instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export async function apiRequest(path, options = {}) {
  const { body, headers, ...restOptions } = options
  const isFormData = body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: isFormData ? buildHeaders(headers) : buildHeaders(headers, Boolean(body)),
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  return parseResponse(response)
}
