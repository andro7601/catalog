import { apiRequest } from './client'

export function updateProfile(formData) {
  return apiRequest('/profile', {
    method: 'PUT',
    body: formData,
  })
}
