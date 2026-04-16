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

function hasScheduleConflict(error) {
  return error?.status === 409 && error?.data?.conflicts?.length
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
  const [activeStep, setActiveStep] = useState(1)
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

        if (!isMounted) {
          return
        }

        const nextCourse = response?.data ?? null
        setCourse(nextCourse)

        if (nextCourse?.enrollment) {
          setWeeklySchedules([])
          setTimeSlots([])
          setSessionTypes([])
          return
        }

        const weeklyResponse = await getWeeklySchedules(courseId)

        if (!isMounted) {
          return
        }

        const nextWeeklySchedules = weeklyResponse?.data ?? []
        setWeeklySchedules(nextWeeklySchedules)
        // Match reference UI: pre-select the first available option chain.
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
        // Clear dependent selections to avoid mismatched API calls/state.
        setTimeSlots([])
        setSelectedTimeSlotId('')
        setSessionTypes([])
        setSelectedSessionTypeId('')

        setIsLoadingOptions(true)
        const response = await getTimeSlots(courseId, selectedWeeklyScheduleId)

        if (!isMounted) {
          return
        }

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
        // Clear dependent selections to avoid stale pricing/state.
        setSessionTypes([])
        setSelectedSessionTypeId('')

        setIsLoadingOptions(true)
        const response = await getSessionTypes(
          courseId,
          selectedWeeklyScheduleId,
          selectedTimeSlotId,
        )

        if (!isMounted) {
          return
        }

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
    if (!enrollment?.id) {
      return
    }

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
              <span className="course-detail__stat">
                {course?.durationWeeks ?? 0} Weeks
              </span>
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
              {course?.instructor?.avatar ? (
                <img alt="" src={course.instructor.avatar} />
              ) : null}
            </span>
            <span className="course-detail__instructor-name">{course?.instructor?.name ?? 'Unknown'}</span>
          </div>

          <div className="course-detail__description-block">
            <h2 className="course-detail__section-title">Course Description</h2>
            <p className="course-detail__about-text">{course.description}</p>
          </div>
        </section>

        <aside className="course-detail__sidebar">
          {!enrollment ? (
            <article className="course-detail__panel">
              <div className="course-detail__steps">
                <div className="course-detail__step">
                  <button
                    className="course-detail__step-row"
                    onClick={() => setActiveStep(1)}
                    type="button"
                  >
                    <span className="course-detail__step-number">1</span>
                    <span className="course-detail__step-label">Weekly Schedule</span>
                    <span
                      className={`course-detail__step-chevron ${
                        activeStep === 1
                          ? 'course-detail__step-chevron--down'
                          : 'course-detail__step-chevron--up'
                      }`}
                      aria-hidden="true"
                    >
                      {activeStep === 1 ? '⌄' : '⌃'}
                    </span>
                  </button>

                  {activeStep === 1 ? (
                    <div className="course-detail__segmented">
                      {weeklySchedules.map((schedule) => {
                        const isActive = String(schedule.id) === selectedWeeklyScheduleId
                        return (
                          <button
                            className={`course-detail__segmented-button ${
                              isActive ? 'course-detail__segmented-button--active' : ''
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
                  ) : null}
                </div>

                <div className="course-detail__step">
                  <button
                    className="course-detail__step-row"
                    onClick={() => setActiveStep(2)}
                    type="button"
                  >
                    <span className="course-detail__step-number">2</span>
                    <span className="course-detail__step-label">Time Slot</span>
                    <span
                      className={`course-detail__step-chevron ${
                        activeStep === 2
                          ? 'course-detail__step-chevron--down'
                          : 'course-detail__step-chevron--up'
                      }`}
                      aria-hidden="true"
                    >
                      {activeStep === 2 ? '⌄' : '⌃'}
                    </span>
                  </button>

                  {activeStep === 2 ? (
                    <div className="course-detail__segmented">
                      {timeSlots.map((slot) => {
                        const isActive = String(slot.id) === selectedTimeSlotId
                        return (
                          <button
                            className={`course-detail__segmented-button ${
                              isActive ? 'course-detail__segmented-button--active' : ''
                            }`}
                            key={slot.id}
                            onClick={() => setSelectedTimeSlotId(String(slot.id))}
                            type="button"
                          >
                            {slot.label}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>

                <div className="course-detail__step">
                  <button
                    className="course-detail__step-row"
                    onClick={() => setActiveStep(3)}
                    type="button"
                  >
                    <span className="course-detail__step-number">3</span>
                    <span className="course-detail__step-label">Session Type</span>
                    <span
                      className={`course-detail__step-chevron ${
                        activeStep === 3
                          ? 'course-detail__step-chevron--down'
                          : 'course-detail__step-chevron--up'
                      }`}
                      aria-hidden="true"
                    >
                      {activeStep === 3 ? '⌄' : '⌃'}
                    </span>
                  </button>

                  {activeStep === 3 ? (
                    <div className="course-detail__segmented">
                      {sessionTypes.map((sessionType) => {
                        const isActive = String(sessionType.id) === selectedSessionTypeId
                        const availableSeats = Number(sessionType.availableSeats ?? 0)
                        const isBookedOut = availableSeats <= 0
                        return (
                          <button
                            className={`course-detail__segmented-button ${
                              isActive ? 'course-detail__segmented-button--active' : ''
                            }`}
                            disabled={isBookedOut}
                            key={sessionType.id}
                            onClick={() => setSelectedSessionTypeId(String(sessionType.id))}
                            type="button"
                          >
                            {getSessionTypeLabel(sessionType.name)}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
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
                        ? `+${formatPrice(getSessionPriceModifier(selectedSessionType))}`
                        : '+$0'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="course-detail__enroll-button"
                disabled={
                  isSubmitting ||
                  !isAuthenticated ||
                  !authUser?.profileComplete ||
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
                      You need sign in to your profile before enrolling in this course.
                    </div>
                  </div>
                  <button
                    className="course-detail__notice-action"
                    onClick={openLogin}
                    type="button"
                  >
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
                  <button
                    className="course-detail__notice-action"
                    onClick={openProfile}
                    type="button"
                  >
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

              <div className="course-detail__schedule-list">
                <div className="course-detail__schedule-item">
                  <span className="course-detail__schedule-icon" aria-hidden="true">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                  </span>
                  <span>{enrollmentInfo.weeklyLabel}</span>
                </div>
                <div className="course-detail__schedule-item">
                  <span className="course-detail__schedule-icon" aria-hidden="true">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <line x1="12" y1="6" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="12" y1="12" x2="16" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                  </span>
                  <span>{enrollmentInfo.timeLabel}</span>
                </div>
                <div className="course-detail__schedule-item">
                  <span className="course-detail__schedule-icon" aria-hidden="true">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                        <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                  </span>
                  <span>{enrollmentInfo.sessionLabel}</span>
                </div>
                {enrollmentInfo.location ? (
                  <div className="course-detail__schedule-item">
                    <span className="course-detail__schedule-icon" aria-hidden="true">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 21s-7-4.35-7-11a7 7 0 0 1 14 0c0 6.65-7 11-7 11z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </span>
                    <span>{enrollmentInfo.location}</span>
                  </div>
                ) : null}
              </div>

              <div className="course-detail__progress-block">
                <div className="course-detail__progress-label">{progressValue}% Complete</div>
                <div className="course-detail__progress-track">
                  <span
                    className="course-detail__progress-fill"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>

              {progressValue < 100 ? (
                <button
                  className="course-detail__complete-button"
                  disabled={isSubmitting}
                  onClick={handleCompleteCourse}
                  type="button"
                >
                  {isSubmitting ? 'Updating...' : 'Complete Course'}{' '}
                  <span className="course-detail__complete-check" aria-hidden="true">
                    ✓
                  </span>
                </button>
              ) : (
                <button
                  className="course-detail__complete-button"
                  onClick={handleRetakeCourse}
                  type="button"
                >
                  Retake Course{' '}
                  <span className="course-detail__retake-icon" aria-hidden="true">
                    ↻
                  </span>
                </button>
              )}

              {progressValue >= 100 && !course?.isRated && isRatingCardOpen ? (
                <div className="course-detail__rating-card">
                  <button
                    className="course-detail__rating-card-close"
                    onClick={() => setIsRatingCardOpen(false)}
                    type="button"
                    aria-label="Close rating"
                  >
                    ×
                  </button>
                  <div className="course-detail__rating-card-title">Rate your experience</div>
                  <div className="course-detail__rating-actions">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        className={`course-detail__star ${
                          ratingValue >= value ? 'course-detail__star--active' : ''
                        }`}
                        key={value}
                        onClick={() => handleRateCourse(value)}
                        type="button"
                        disabled={isSubmitting}
                      >
                        ★
                      </button>
                    ))}
                  </div>
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
              <p
                className="course-detail__conflict-text"
                key={conflict.conflictingEnrollmentId}
              >
                You are already enrolled in {conflict.conflictingCourseName} with the same
                schedule: {conflict.schedule}
              </p>
            ))}
            <p className="course-detail__panel-note">Are you sure you want to continue?</p>
            <div className="course-detail__conflict-actions">
              <button
                className="course-detail__ghost-button"
                onClick={closeConflictModal}
                type="button"
              >
                Cancel
              </button>
              <button
                className="course-detail__primary-button"
                onClick={() => handleEnroll(true)}
                type="button"
              >
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
