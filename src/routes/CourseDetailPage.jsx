import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../AppContext'
import {
  getCourseById,
  getSessionTypes,
  getTimeSlots,
  getWeeklySchedules,
} from '../api/courses.api'
import { completeEnrollment, createEnrollment } from '../api/enrollments.api'
import { rateCourse } from '../api/reviews.api'

function getAverageRating(reviews = []) {
  if (!reviews.length) {
    return null
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return (total / reviews.length).toFixed(1)
}

function getCourseImage(course) {
  return course?.image || ''
}

function getSessionPriceModifier(sessionType) {
  return Number(sessionType?.priceModifier ?? 0)
}

function formatPrice(value) {
  const numericValue = Number(value ?? 0)
  return `$${Math.round(numericValue)}`
}

function getSessionTypeLabel(name) {
  if (name === 'in_person') return 'In-person'
  if (name === 'online') return 'Online'
  if (name === 'hybrid') return 'Hybrid'
  return 'Session'
}

function getEnrollmentSessionInfo(enrollment) {
  const schedule = enrollment?.schedule ?? {}

  return {
    weeklyLabel: schedule?.weeklySchedule?.label ?? 'Not selected',
    timeLabel: schedule?.timeSlot?.label ?? 'Not selected',
    sessionLabel: getSessionTypeLabel(schedule?.sessionType?.name),
    location: schedule?.location || schedule?.sessionType?.location || '',
  }
}

function CourseDetailPage() {
  const { courseId } = useParams()
  const { authUser, isAuthenticated, openLogin, openProfile } = useAppContext()
  const [course, setCourse] = useState(null)
  const [weeklySchedules, setWeeklySchedules] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [sessionTypes, setSessionTypes] = useState([])
  const [selectedWeeklyScheduleId, setSelectedWeeklyScheduleId] = useState('')
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState('')
  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState('')
  const [isLoadingCourse, setIsLoadingCourse] = useState(true)
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [conflictData, setConflictData] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadCourse() {
      try {
        setIsLoadingCourse(true)
        setErrorMessage('')
        const response = await getCourseById(courseId)

        if (!isMounted) return

        const nextCourse = response?.data ?? null
        setCourse(nextCourse)

        if (nextCourse?.enrollment) {
          setWeeklySchedules([])
          setTimeSlots([])
          setSessionTypes([])
          return
        }

        const weeklyResponse = await getWeeklySchedules(courseId)
        if (!isMounted) return
        setWeeklySchedules(weeklyResponse?.data ?? [])
      } catch {
        if (isMounted) setErrorMessage('Could not load course details.')
      } finally {
        if (isMounted) setIsLoadingCourse(false)
      }
    }

    loadCourse()

    return () => {
      isMounted = false
    }
  }, [courseId])

  useEffect(() => {
    let isMounted = true

    async function loadTimeSlots() {
      if (!selectedWeeklyScheduleId) {
        setTimeSlots([])
        setSelectedTimeSlotId('')
        setSessionTypes([])
        setSelectedSessionTypeId('')
        return
      }

      try {
        setIsLoadingOptions(true)
        const response = await getTimeSlots(courseId, selectedWeeklyScheduleId)
        if (!isMounted) return
        setTimeSlots(response?.data ?? [])
        setSelectedTimeSlotId('')
        setSessionTypes([])
        setSelectedSessionTypeId('')
      } catch {
        if (isMounted) setErrorMessage('Could not load time slots.')
      } finally {
        if (isMounted) setIsLoadingOptions(false)
      }
    }

    loadTimeSlots()

    return () => {
      isMounted = false
    }
  }, [courseId, selectedWeeklyScheduleId])

  useEffect(() => {
    let isMounted = true

    async function loadSessionTypes() {
      if (!selectedWeeklyScheduleId || !selectedTimeSlotId) {
        setSessionTypes([])
        setSelectedSessionTypeId('')
        return
      }

      try {
        setIsLoadingOptions(true)
        const response = await getSessionTypes(
          courseId,
          selectedWeeklyScheduleId,
          selectedTimeSlotId,
        )
        if (!isMounted) return
        setSessionTypes(response?.data ?? [])
        setSelectedSessionTypeId('')
      } catch {
        if (isMounted) setErrorMessage('Could not load session types.')
      } finally {
        if (isMounted) setIsLoadingOptions(false)
      }
    }

    loadSessionTypes()

    return () => {
      isMounted = false
    }
  }, [courseId, selectedTimeSlotId, selectedWeeklyScheduleId])

  const selectedSessionType = useMemo(
    () =>
      sessionTypes.find((sessionType) => String(sessionType.id) === selectedSessionTypeId) ??
      null,
    [selectedSessionTypeId, sessionTypes],
  )

  const totalPrice = Number(course?.basePrice ?? 0) + getSessionPriceModifier(selectedSessionType)
  const averageRating = getAverageRating(course?.reviews ?? [])
  const reviewCount = course?.reviews?.length ?? 0
  const enrollment = course?.enrollment ?? null
  const enrollmentInfo = getEnrollmentSessionInfo(enrollment)
  const progressValue = Number(enrollment?.progress ?? 0)

  async function refreshCourse() {
    const response = await getCourseById(courseId)
    setCourse(response?.data ?? null)
  }

  async function handleEnroll(force = false) {
    setErrorMessage('')
    setSuccessMessage('')

    if (!isAuthenticated) {
      openLogin()
      return
    }

    if (!authUser?.profileComplete) {
      setErrorMessage('Complete your profile before enrolling.')
      openProfile()
      return
    }

    if (!selectedWeeklyScheduleId || !selectedTimeSlotId || !selectedSessionTypeId) {
      setErrorMessage('Select weekly schedule, time slot, and session type first.')
      return
    }

    if ((selectedSessionType?.availableSeats ?? 0) <= 0) {
      setErrorMessage('This session type is fully booked.')
      return
    }

    setIsSubmitting(true)

    try {
      await createEnrollment({
        courseId: Number(courseId),
        courseScheduleId: Number(selectedSessionType.courseScheduleId),
        force,
      })

      setConflictData(null)
      setSuccessMessage('You have successfully enrolled in this course.')
      await refreshCourse()
    } catch (error) {
      if (error?.status === 409 && error?.data?.conflicts?.length) {
        setConflictData(error.data)
      } else {
        setErrorMessage(error?.data?.message || error?.message || 'Could not enroll.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCompleteCourse() {
    if (!enrollment?.id) return

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await completeEnrollment(enrollment.id)
      await refreshCourse()
      setSuccessMessage(`Congratulations! You've completed ${course.title}!`)
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Could not complete course.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRateCourse() {
    if (!ratingValue) {
      setErrorMessage('Choose a rating first.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await rateCourse(courseId, { rating: ratingValue })
      await refreshCourse()
      setSuccessMessage('Thanks for rating this course.')
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Could not save rating.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="course-detail-page">
      {isLoadingCourse ? (
        <section className="course-detail__loading">Loading course details...</section>
      ) : course ? (
        <>
          <section className="course-detail__hero">
            <div className="course-detail__hero-copy">
              <p className="course-detail__eyebrow">
                {course?.category?.name ?? 'Course'} / {course?.topic?.name ?? 'Topic'}
              </p>
              <h1 className="course-detail__title">{course.title}</h1>
              <p className="course-detail__description">{course.description}</p>
              <div className="course-detail__meta">
                <span>Instructor {course?.instructor?.name ?? 'Unknown Instructor'}</span>
                <span>{course?.durationWeeks ?? 0} Weeks</span>
                <span>{averageRating ?? 'New'} {reviewCount ? `(${reviewCount} reviews)` : ''}</span>
              </div>
            </div>

            <div
              className="course-detail__image"
              style={
                getCourseImage(course)
                  ? { backgroundImage: `url(${getCourseImage(course)})` }
                  : undefined
              }
            />
          </section>

          {errorMessage ? <p className="course-detail__message">{errorMessage}</p> : null}
          {successMessage ? (
            <p className="course-detail__message course-detail__message--success">
              {successMessage}
            </p>
          ) : null}

          {conflictData ? (
            <div className="course-detail__conflict">
              <h2 className="course-detail__panel-title">Schedule conflict detected</h2>
              {conflictData.conflicts.map((conflict) => (
                <p className="course-detail__conflict-text" key={conflict.conflictingEnrollmentId}>
                  You are already enrolled in {conflict.conflictingCourseName} with the same schedule: {conflict.schedule}
                </p>
              ))}
              <div className="course-detail__conflict-actions">
                <button className="course-detail__ghost-button" onClick={() => setConflictData(null)} type="button">
                  Cancel
                </button>
                <button className="course-detail__primary-button" onClick={() => handleEnroll(true)} type="button">
                  Continue Anyway
                </button>
              </div>
            </div>
          ) : null}

          <div className="course-detail__content">
            <section className="course-detail__main">
              <article className="course-detail__about-card">
                <h2 className="course-detail__panel-title">About This Course</h2>
                <p className="course-detail__about-text">{course.description}</p>
              </article>
            </section>

            <aside className="course-detail__sidebar">
              {!enrollment ? (
                <article className="course-detail__panel">
                  <div className="course-detail__price-summary">
                    <div>
                      <p className="course-detail__price-label">Base Price</p>
                      <p className="course-detail__price-value">{formatPrice(course.basePrice)}</p>
                    </div>
                    <div>
                      <p className="course-detail__price-label">Session Modifier</p>
                      <p className="course-detail__price-value">
                        {selectedSessionType
                          ? getSessionPriceModifier(selectedSessionType) > 0
                            ? `+${formatPrice(getSessionPriceModifier(selectedSessionType))}`
                            : 'Included'
                          : 'Select session'}
                      </p>
                    </div>
                    <div>
                      <p className="course-detail__price-label">Total Price</p>
                      <p className="course-detail__price-total">{formatPrice(totalPrice)}</p>
                    </div>
                  </div>

                  <div className="course-detail__selector-group">
                    <label className="course-detail__selector-label" htmlFor="weekly-schedule">
                      Weekly Schedule
                    </label>
                    <select
                      className="course-detail__select"
                      id="weekly-schedule"
                      onChange={(event) => setSelectedWeeklyScheduleId(event.target.value)}
                      value={selectedWeeklyScheduleId}
                    >
                      <option value="">Choose schedule</option>
                      {weeklySchedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="course-detail__selector-group">
                    <label className="course-detail__selector-label" htmlFor="time-slot">
                      Time Slot
                    </label>
                    <select
                      className="course-detail__select"
                      disabled={!selectedWeeklyScheduleId}
                      id="time-slot"
                      onChange={(event) => setSelectedTimeSlotId(event.target.value)}
                      value={selectedTimeSlotId}
                    >
                      <option value="">Choose time slot</option>
                      {timeSlots.map((timeSlot) => (
                        <option key={timeSlot.id} value={timeSlot.id}>
                          {timeSlot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="course-detail__session-grid">
                    {sessionTypes.map((sessionType) => {
                      const isSelected = String(sessionType.id) === selectedSessionTypeId
                      const isBookedOut = Number(sessionType.availableSeats ?? 0) <= 0

                      return (
                        <button
                          className={`course-detail__session-card ${
                            isSelected ? 'course-detail__session-card--active' : ''
                          }`}
                          disabled={isBookedOut}
                          key={sessionType.id}
                          onClick={() => setSelectedSessionTypeId(String(sessionType.id))}
                          type="button"
                        >
                          <div className="course-detail__session-head">
                            <span>{getSessionTypeLabel(sessionType.name)}</span>
                            <span>
                              {getSessionPriceModifier(sessionType) > 0
                                ? `+${formatPrice(getSessionPriceModifier(sessionType))}`
                                : 'Included'}
                            </span>
                          </div>
                          <p className="course-detail__session-meta">
                            {isBookedOut
                              ? 'Fully Booked'
                              : `${sessionType.availableSeats} seats available`}
                          </p>
                          {Number(sessionType.availableSeats ?? 0) < 5 &&
                          Number(sessionType.availableSeats ?? 0) > 0 ? (
                            <p className="course-detail__session-warning">
                              Only {sessionType.availableSeats} seats left!
                            </p>
                          ) : null}
                          {sessionType.location ? (
                            <p className="course-detail__session-location">
                              {sessionType.location}
                            </p>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>

                  {isLoadingOptions ? (
                    <p className="course-detail__panel-note">Loading available options...</p>
                  ) : null}

                  <button
                    className="course-detail__primary-button"
                    disabled={isSubmitting}
                    onClick={() => handleEnroll(false)}
                    type="button"
                  >
                    {isSubmitting ? 'Processing...' : 'Enroll Now'}
                  </button>
                </article>
              ) : (
                <article className="course-detail__panel">
                  <h2 className="course-detail__panel-title">Course Progress</h2>
                  <p className="course-detail__progress-text">Course Progress: {progressValue}%</p>
                  <div className="course-detail__progress-track">
                    <span className="course-detail__progress-fill" style={{ width: `${progressValue}%` }} />
                  </div>
                  <div className="course-detail__schedule-summary">
                    <p>{enrollmentInfo.weeklyLabel}</p>
                    <p>{enrollmentInfo.timeLabel}</p>
                    <p>{enrollmentInfo.sessionLabel}</p>
                    {enrollmentInfo.location ? <p>{enrollmentInfo.location}</p> : null}
                  </div>
                  {progressValue < 100 ? (
                    <button
                      className="course-detail__primary-button"
                      disabled={isSubmitting}
                      onClick={handleCompleteCourse}
                      type="button"
                    >
                      {isSubmitting ? 'Updating...' : 'Complete Course'}
                    </button>
                  ) : (
                    <div className="course-detail__completed-box">
                      <p className="course-detail__completed-badge">Completed ✓</p>
                      <p className="course-detail__panel-note">Course Completed! 🎉</p>
                    </div>
                  )}

                  {progressValue >= 100 ? (
                    <div className="course-detail__rating-box">
                      <h3 className="course-detail__panel-subtitle">Rate this course</h3>
                      {course?.isRated ? (
                        <p className="course-detail__panel-note">
                          You've already rated this course.
                        </p>
                      ) : (
                        <>
                          <div className="course-detail__rating-actions">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                className={`course-detail__star ${
                                  ratingValue >= value ? 'course-detail__star--active' : ''
                                }`}
                                key={value}
                                onClick={() => setRatingValue(value)}
                                type="button"
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <button
                            className="course-detail__ghost-button"
                            disabled={isSubmitting}
                            onClick={handleRateCourse}
                            type="button"
                          >
                            Submit Rating
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </article>
              )}
            </aside>
          </div>
        </>
      ) : (
        <section className="course-detail__loading">Course not found.</section>
      )}
    </div>
  )
}

export default CourseDetailPage
