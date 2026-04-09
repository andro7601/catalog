import { apiRequest } from './client'

export function getFeaturedCourses() {
  return apiRequest('/courses/featured')
}

export function getInProgressCourses() {
  return apiRequest('/courses/in-progress')
}

export function getCourses(queryString = '') {
  return apiRequest(`/courses${queryString ? `?${queryString}` : ''}`)
}

export function getCourseById(courseId) {
  return apiRequest(`/courses/${courseId}`)
}

export function getWeeklySchedules(courseId) {
  return apiRequest(`/courses/${courseId}/weekly-schedules`)
}

export function getTimeSlots(courseId, weeklyScheduleId) {
  return apiRequest(
    `/courses/${courseId}/time-slots?weekly_schedule_id=${weeklyScheduleId}`,
  )
}

export function getSessionTypes(courseId, weeklyScheduleId, timeSlotId) {
  return apiRequest(
    `/courses/${courseId}/session-types?weekly_schedule_id=${weeklyScheduleId}&time_slot_id=${timeSlotId}`,
  )
}
