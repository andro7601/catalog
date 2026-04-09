import { apiRequest } from './client'

export function getCategories() {
  return apiRequest('/categories')
}

export function getTopics(queryString = '') {
  return apiRequest(`/topics${queryString ? `?${queryString}` : ''}`)
}

export function getInstructors() {
  return apiRequest('/instructors')
}
