import { apiRequest } from './client'

export function register(formData) {
  return apiRequest('/register', {
    method: 'POST',
    body: formData,
  })
}

export function login(credentials) {
  return apiRequest('/login', {
    method: 'POST',
    body: credentials,
  })
}

export function logout() {
  return apiRequest('/logout', {
    method: 'POST',
  })
}

export function getMe() {
  return apiRequest('/me')
}
