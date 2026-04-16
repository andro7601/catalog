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
import courseCardReference from '../assets/course-card-reference.jpg'

function getAverageRating(reviews = []) {
  if (!reviews.length) {
    return null
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return (total / reviews.length).toFixed(1)
}

function getCourseImage(course) {
  return course?.image || courseCardReference
}

function formatPrice(value) {
  const numericValue = Number(value ?? 0)
  return `$${Math.round(numericValue)}`
}

function getSessionPriceModifier(sessionType) {
  return Number(sessionType?.priceModifier ?? 0)
}

function getSessionTypeLabel(name) {
  if (name === 'in_person') return 'In-Person'
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

function hasScheduleConflict(error) {
  return error?.status === 409 && error?.data?.conflicts?.length
}

function getTimeSlotMeta(slot) {
  const label = slot?.label ?? ''
  const lowerLabel = label.toLowerCase()

  if (lowerLabel.includes('morning')) {
    return { title: 'Morning', icon: 'sunrise' }
  }

  if (lowerLabel.includes('afternoon')) {
    return { title: 'Afternoon', icon: 'sun' }
  }

  if (lowerLabel.includes('evening')) {
    return { title: 'Evening', icon: 'moon' }
  }

  return { title: label || 'Time Slot', icon: 'clock' }
}

function TimeSlotIcon({ kind }) {
  if (kind === 'sunrise') {
    return (
      <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 15a7 7 0 0 1 14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        <path d="M12 4v2.5M4.8 8.8l1.7 1.1M19.2 8.8l-1.7 1.1M4 18h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    )
  }

  if (kind === 'sun') {
    return (
      <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      </svg>
    )
  }

  if (kind === 'moon') {
    return (
      <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.8 3.8a7.8 7.8 0 1 0 5.4 13.7a8.8 8.8 0 1 1-5.4-13.7Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    )
  }

  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5v5l3 1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  )
}

function SessionTypeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8.5a3.2 3.2 0 1 0 0-6.4a3.2 3.2 0 0 0 0 6.4ZM16 10.2a2.7 2.7 0 1 0 0-5.4a2.7 2.7 0 0 0 0 5.4Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 18.8c0-2.8 2.5-5 5.6-5s5.6 2.2 5.6 5M13.6 18.8c.2-1.9 2-3.5 4.4-3.5c2.4 0 4.2 1.6 4.4 3.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  )
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
  const [ratingValue, setRatingValue] = useState(1)
  const [isRatingCardOpen, setIsRatingCardOpen] = useState(true)

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

        const nextWeeklySchedules = weeklyResponse?.data ?? []
        setWeeklySchedules(nextWeeklySchedules)
        if (nextWeeklySchedules[0]?.id != null) {
          setSelectedWeeklyScheduleId(String(nextWeeklySchedules[0].id))
        }
        setSelectedTimeSlotId('')
        setSelectedSessionTypeId('')
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load course details.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingCourse(false)
        }
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
        setTimeSlots([])
        setSelectedTimeSlotId('')
        setSessionTypes([])
        setSelectedSessionTypeId('')

        setIsLoadingOptions(true)
        const response = await getTimeSlots(courseId, selectedWeeklyScheduleId)

        if (!isMounted) return

        const nextTimeSlots = response?.data ?? []
        setTimeSlots(nextTimeSlots)
        if (nextTimeSlots[0]?.id != null) {
          setSelectedTimeSlotId(String(nextTimeSlots[0].id))
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load time slots.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
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
        setSessionTypes([])
        setSelectedSessionTypeId('')

        setIsLoadingOptions(true)
        const response = await getSessionTypes(
          courseId,
          selectedWeeklyScheduleId,
          selectedTimeSlotId,
        )

        if (!isMounted) return

        const nextSessionTypes = response?.data ?? []
        setSessionTypes(nextSessionTypes)
        if (nextSessionTypes[0]?.id != null) {
          setSelectedSessionTypeId(String(nextSessionTypes[0].id))
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load session types.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
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
      setErrorMessage('Please complete your profile to enroll in courses')
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
      if (hasScheduleConflict(error)) {
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

  async function handleRateCourse(value) {
    const nextRatingValue = value ?? ratingValue

    if (!nextRatingValue) {
      setErrorMessage('Choose a rating first.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await rateCourse(courseId, { rating: nextRatingValue })
      await refreshCourse()
      setSuccessMessage('Thanks for rating this course.')
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Could not save rating.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function closeConflictModal() {
    setConflictData(null)
  }

  function handleRetakeCourse() {
    setSuccessMessage('Ready for another round. You can revisit your completed course anytime.')
  }

  if (isLoadingCourse) {
    return (
      <div className="course-detail-page">
        <section className="course-detail__loading">Loading course details...</section>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="course-detail-page">
        <section className="course-detail__loading">Course not found.</section>
      </div>
    )
  }

  return (
    <div className="course-detail-page">
      <div className="course-detail__breadcrumb">
        <span>Home</span>
        <span className="course-detail__breadcrumb-sep" aria-hidden="true">
          ›
        </span>
        <span>Browse</span>
        {course?.category?.name ? (
          <>
            <span className="course-detail__breadcrumb-sep" aria-hidden="true">
              ›
            </span>
            <span className="course-detail__breadcrumb-current">{course.category.name}</span>
          </>
        ) : null}
      </div>

      <h1 className="course-detail__title">{course.title}</h1>

      {errorMessage ? <p className="course-detail__message">{errorMessage}</p> : null}
      {successMessage ? (
        <p className="course-detail__message course-detail__message--success">
          {successMessage}
        </p>
      ) : null}

      <div className="course-detail__content">
        <section className="course-detail__main">
          <div
            className="course-detail__image"
            style={
              getCourseImage(course)
                ? { backgroundImage: `url(${getCourseImage(course)})` }
                : undefined
            }
          />

          <div className="course-detail__stats-row">
            <div className="course-detail__stats-left">
              <span className="course-detail__stat">{course?.durationWeeks ?? 0} Weeks</span>
              <span className="course-detail__stat">
                {course?.durationHours ?? course?.duration_hours ?? 0} Hours
              </span>
            </div>

            <div className="course-detail__stats-right">
              <span className="course-detail__rating">
                <span className="course-detail__rating-star" aria-hidden="true">
                  ★
                </span>
                {averageRating ?? 'New'}
              </span>

              <span className="course-detail__tag">
                <span className="course-detail__tag-icon" aria-hidden="true">
                  {'</>'}
                </span>
                {course?.category?.name ?? course?.topic?.name ?? 'Course'}
              </span>
            </div>
          </div>

          <div className="course-detail__instructor-row">
            <span className="course-detail__instructor-avatar">
              {course?.instructor?.avatar ? <img alt="" src={course.instructor.avatar} /> : null}
            </span>
            <span className="course-detail__instructor-name">
              {course?.instructor?.name ?? 'Unknown'}
            </span>
          </div>

          <div className="course-detail__description-block">
            <h2 className="course-detail__section-title">Course Description</h2>
            <p className="course-detail__about-text">{course.description}</p>
          </div>
        </section>

        <aside className="course-detail__sidebar">
          {!enrollment ? (
            <article className="course-detail__panel">
              <div className="course-detail__picker-group">
                <div className="course-detail__picker-label">Weekly Schedule</div>
                <div className="course-detail__weeks-grid">
                  {weeklySchedules.map((schedule) => {
                    const isActive = String(schedule.id) === selectedWeeklyScheduleId
                    return (
                      <button
                        className={`course-detail__week-card ${
                          isActive ? 'course-detail__week-card--active' : ''
                        }`}
                        key={schedule.id}
                        onClick={() => setSelectedWeeklyScheduleId(String(schedule.id))}
                        type="button"
                      >
                        {schedule.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="course-detail__picker-group">
                <div className="course-detail__picker-label">Time Slots</div>
                <div className="course-detail__time-slots-grid">
                  {timeSlots.map((slot) => {
                    const isActive = String(slot.id) === selectedTimeSlotId
                    const slotMeta = getTimeSlotMeta(slot)

                    return (
                      <button
                        className={`course-detail__time-slot-card ${
                          isActive ? 'course-detail__time-slot-card--active' : ''
                        }`}
                        key={slot.id}
                        onClick={() => setSelectedTimeSlotId(String(slot.id))}
                        type="button"
                      >
                        <span className="course-detail__time-slot-icon" aria-hidden="true">
                          <TimeSlotIcon kind={slotMeta.icon} />
                        </span>
                        <span className="course-detail__time-slot-copy">
                          <span className="course-detail__time-slot-title">{slotMeta.title}</span>
                          <span className="course-detail__time-slot-range">{slot.label}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="course-detail__picker-group">
                <div className="course-detail__picker-label">Session Type</div>
                <div className="course-detail__session-grid course-detail__session-grid--cards">
                  {sessionTypes.map((sessionType) => {
                    const isActive = String(sessionType.id) === selectedSessionTypeId
                    const availableSeats = Number(sessionType.availableSeats ?? 0)
                    const isBookedOut = availableSeats <= 0
                    const modifier = getSessionPriceModifier(sessionType)

                    return (
                      <button
                        className={`course-detail__session-card ${
                          isActive ? 'course-detail__session-card--active' : ''
                        } ${isBookedOut ? 'course-detail__session-card--disabled' : ''}`}
                        disabled={isBookedOut}
                        key={sessionType.id}
                        onClick={() => setSelectedSessionTypeId(String(sessionType.id))}
                        type="button"
                      >
                        <span className="course-detail__session-card-icon" aria-hidden="true">
                          <SessionTypeIcon />
                        </span>
                        <div className="course-detail__session-card-body">
                          <div className="course-detail__session-card-title">
                            {getSessionTypeLabel(sessionType.name)}
                          </div>
                          {sessionType.location ? (
                            <div className="course-detail__session-location">
                              {sessionType.location}
                            </div>
                          ) : null}
                          <div className="course-detail__session-price">
                            {modifier > 0 ? `+${formatPrice(modifier)}` : 'Included'}
                          </div>
                          <div className="course-detail__session-availability">
                            {isBookedOut
                              ? 'No Seats Available'
                              : `${availableSeats} Seats Available`}
                          </div>
                          {availableSeats < 5 && availableSeats > 0 ? (
                            <div className="course-detail__session-warning">
                              Only {availableSeats} Seats Remaining
                            </div>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="course-detail__price-card">
                <div className="course-detail__price-card-header">
                  <span className="course-detail__price-card-title">Total Price</span>
                  <span className="course-detail__price-card-total">{formatPrice(totalPrice)}</span>
                </div>

                <div className="course-detail__price-breakdown">
                  <div className="course-detail__price-line">
                    <span>Base Price</span>
                    <span>{formatPrice(course.basePrice)}</span>
                  </div>
                  <div className="course-detail__price-line">
                    <span>Session Type</span>
                    <span>
                      {selectedSessionType
                        ? getSessionPriceModifier(selectedSessionType) > 0
                          ? `+${formatPrice(getSessionPriceModifier(selectedSessionType))}`
                          : 'Included'
                        : 'Included'}
                    </span>
                  </div>
                </div>
              </div>

              {isLoadingOptions ? (
                <p className="course-detail__panel-note">Loading available options...</p>
              ) : null}

              <button
                className="course-detail__enroll-button"
                disabled={
                  isSubmitting ||
                  !selectedWeeklyScheduleId ||
                  !selectedTimeSlotId ||
                  !selectedSessionTypeId ||
                  (selectedSessionType?.availableSeats ?? 0) <= 0
                }
                onClick={() => handleEnroll(false)}
                type="button"
              >
                {isSubmitting ? 'Processing...' : 'Enroll Now'}
              </button>

              {!isAuthenticated ? (
                <div className="course-detail__notice course-detail__notice--warning">
                  <div className="course-detail__notice-icon" aria-hidden="true">
                    !
                  </div>
                  <div className="course-detail__notice-body">
                    <div className="course-detail__notice-title">Authentication Required</div>
                    <div className="course-detail__notice-text">
                      You need to sign in to your profile before enrolling in this course.
                    </div>
                  </div>
                  <button className="course-detail__notice-action" onClick={openLogin} type="button">
                    Sign In →
                  </button>
                </div>
              ) : !authUser?.profileComplete ? (
                <div className="course-detail__notice course-detail__notice--warning">
                  <div className="course-detail__notice-icon" aria-hidden="true">
                    !
                  </div>
                  <div className="course-detail__notice-body">
                    <div className="course-detail__notice-title">Complete Your Profile</div>
                    <div className="course-detail__notice-text">
                      You need to fill in your profile details before enrolling in this course.
                    </div>
                  </div>
                  <button className="course-detail__notice-action" onClick={openProfile} type="button">
                    Complete →
                  </button>
                </div>
              ) : null}
            </article>
          ) : (
            <article className="course-detail__panel">
              <div
                className={`course-detail__status-badge ${
                  progressValue >= 100
                    ? 'course-detail__status-badge--completed'
                    : 'course-detail__status-badge--enrolled'
                }`}
              >
                {progressValue >= 100 ? 'Completed' : 'Enrolled'}
              </div>

              <div className="course-detail__selection-summary">
                <div className="course-detail__selection-item">
                  <span className="course-detail__selection-label">Weekly Schedule</span>
                  <span className="course-detail__selection-value">{enrollmentInfo.weeklyLabel}</span>
                </div>
                <div className="course-detail__selection-item">
                  <span className="course-detail__selection-label">Time Slot</span>
                  <span className="course-detail__selection-value">{enrollmentInfo.timeLabel}</span>
                </div>
                <div className="course-detail__selection-item">
                  <span className="course-detail__selection-label">Session Type</span>
                  <span className="course-detail__selection-value">{enrollmentInfo.sessionLabel}</span>
                </div>
                {enrollmentInfo.location ? (
                  <div className="course-detail__selection-item">
                    <span className="course-detail__selection-label">Location</span>
                    <span className="course-detail__selection-value">{enrollmentInfo.location}</span>
                  </div>
                ) : null}
              </div>

              <div className="course-detail__progress-block">
                <div className="course-detail__progress-label">Course Progress: {progressValue}%</div>
                <div className="course-detail__progress-track">
                  <span className="course-detail__progress-fill" style={{ width: `${progressValue}%` }} />
                </div>
              </div>

              {progressValue < 100 ? (
                <button
                  className="course-detail__complete-button"
                  disabled={isSubmitting}
                  onClick={handleCompleteCourse}
                  type="button"
                >
                  {isSubmitting ? 'Updating...' : 'Complete Course'}
                </button>
              ) : (
                <div className="course-detail__completed-box">
                  <p className="course-detail__completed-badge">Completed ✓</p>
                  <p className="course-detail__panel-note">Course Completed! Congrats!</p>
                  <button className="course-detail__ghost-button" onClick={handleRetakeCourse} type="button">
                    Retake Course
                  </button>
                </div>
              )}

              {progressValue >= 100 ? (
                <div className="course-detail__rating-box">
                  <h3 className="course-detail__panel-subtitle">Rate this course</h3>
                  {course?.isRated ? (
                    <p className="course-detail__panel-note">You've already rated this course.</p>
                  ) : isRatingCardOpen ? (
                    <div className="course-detail__rating-card">
                      <button
                        className="course-detail__rating-card-close"
                        onClick={() => setIsRatingCardOpen(false)}
                        type="button"
                      >
                        ×
                      </button>
                      <div className="course-detail__rating-card-title">Share your thoughts</div>
                      <div className="course-detail__rating-actions">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            className={`course-detail__star ${
                              ratingValue >= value ? 'course-detail__star--active' : ''
                            }`}
                            key={value}
                            onClick={() => {
                              setRatingValue(value)
                              handleRateCourse(value)
                            }}
                            type="button"
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      className="course-detail__ghost-button"
                      onClick={() => setIsRatingCardOpen(true)}
                      type="button"
                    >
                      Open Rating
                    </button>
                  )}
                </div>
              ) : null}
            </article>
          )}
        </aside>
      </div>

      {conflictData ? (
        <div className="course-detail__conflict-modal-shell">
          <button
            aria-label="Close conflict warning"
            className="course-detail__conflict-backdrop"
            onClick={closeConflictModal}
            type="button"
          />
          <div className="course-detail__conflict-modal">
            <h2 className="course-detail__panel-title">Schedule conflict detected</h2>
            {conflictData.conflicts.map((conflict) => (
              <p className="course-detail__conflict-text" key={conflict.conflictingEnrollmentId}>
                You are already enrolled in {conflict.conflictingCourseName} with the same
                schedule: {conflict.schedule}
              </p>
            ))}
            <p className="course-detail__panel-note">Are you sure you want to continue?</p>
            <div className="course-detail__conflict-actions">
              <button className="course-detail__ghost-button" onClick={closeConflictModal} type="button">
                Cancel
              </button>
              <button className="course-detail__primary-button" onClick={() => handleEnroll(true)} type="button">
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CourseDetailPage
