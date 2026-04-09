import { apiRequest } from './client'

export function rateCourse(courseId, payload) {
  return apiRequest(`/courses/${courseId}/reviews`, {
    method: 'POST',
    body: payload,
  })
}
