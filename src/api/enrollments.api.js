import { apiRequest } from './client'

export function getEnrollments() {
  return apiRequest('/enrollments')
}

export function createEnrollment(payload) {
  return apiRequest('/enrollments', {
    method: 'POST',
    body: payload,
  })
}

export function completeEnrollment(enrollmentId) {
  return apiRequest(`/enrollments/${enrollmentId}/complete`, {
    method: 'PATCH',
  })
}

export function deleteEnrollment(enrollmentId) {
  return apiRequest(`/enrollments/${enrollmentId}`, {
    method: 'DELETE',
  })
}
