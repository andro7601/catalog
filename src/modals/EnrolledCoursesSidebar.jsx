import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../AppContext'
import { getEnrollments } from '../api/enrollments.api'
import courseCardReference from '../assets/course-card-reference.jpg'
import Backdrop from './Backdrop'

function getCourseEntity(item) {
  return item?.course ?? item
}

function getCourseImage(item) {
  const course = getCourseEntity(item)
  return course?.image || course?.thumbnail || course?.coverImage || courseCardReference
}

function getInstructorName(item) {
  const course = getCourseEntity(item)
  return course?.instructor?.name || course?.mentor?.name || 'Unknown Instructor'
}

function getProgressValue(course) {
  const rawValue =
    course?.completionPercentage ??
    course?.progressPercentage ??
    course?.progress ??
    course?.completion ??
    0

  const numericValue = Number(rawValue)

  if (Number.isNaN(numericValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)))
}

function getCourseTitle(item) {
  return getCourseEntity(item)?.title ?? 'Untitled Course'
}

function getCourseRating(item) {
  return getCourseEntity(item)?.avgRating ?? 'New'
}

function getCourseId(item) {
  return getCourseEntity(item)?.id ?? item?.id ?? 1
}

function getEnrollmentPrice(item) {
  return Number(item?.totalPrice ?? getCourseEntity(item)?.basePrice ?? 0)
}

function getEnrollmentSchedule(item) {
  const schedule = item?.schedule ?? {}

  return {
    weeklyLabel: schedule?.weeklySchedule?.label ?? 'Schedule unavailable',
    timeLabel: schedule?.timeSlot?.label ?? 'Time unavailable',
    sessionLabel: schedule?.sessionType?.name
      ? schedule.sessionType.name.replace('_', ' ')
      : 'Session unavailable',
    location: schedule?.location || schedule?.sessionType?.location || '',
  }
}

function formatPrice(value) {
  const numericValue = Number(value ?? 0)
  return `$${Math.round(numericValue)}`
}

function EnrolledCoursesSidebar({ isOpen, onClose }) {
  const { isAuthenticated } = useAppContext()
  const [courses, setCourses] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadCourses() {
      if (!isOpen || !isAuthenticated) {
        setCourses([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')
        const response = await getEnrollments()

        if (!isMounted) {
          return
        }

        setCourses(response?.data ?? [])
      } catch {
        if (isMounted) {
          setCourses([])
          setErrorMessage('Could not load enrolled courses.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCourses()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, isOpen])

  const totalPrice = useMemo(
    () => courses.reduce((sum, course) => sum + getEnrollmentPrice(course), 0),
    [courses],
  )

  if (!isOpen) {
    return null
  }

  return (
    <div className="sidebar-shell">
      <Backdrop onClose={onClose} />

      <aside
        aria-label="Enrolled courses"
        className="sidebar-shell__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sidebar-shell__header">
          <div className="sidebar-shell__heading-row">
            <h2 className="sidebar-shell__title">Enrolled Courses</h2>
            <p className="sidebar-shell__count">Total Enrollments {courses.length}</p>
          </div>
          <button className="modal-shell__close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {!isLoading && !errorMessage ? (
          <div className="sidebar-shell__summary">
            <div className="sidebar-shell__summary-card">
              <span className="sidebar-shell__summary-label">Total Enrollments</span>
              <strong className="sidebar-shell__summary-value">{courses.length}</strong>
            </div>
            <div className="sidebar-shell__summary-card">
              <span className="sidebar-shell__summary-label">Total Price</span>
              <strong className="sidebar-shell__summary-value">{formatPrice(totalPrice)}</strong>
            </div>
          </div>
        ) : null}

        <div className="sidebar-shell__list">
          {errorMessage ? <p className="sidebar-shell__empty-text">{errorMessage}</p> : null}

          {isLoading ? (
            <>
              {Array.from({ length: 3 }, (_, index) => (
                <article
                  className="sidebar-shell__course sidebar-shell__course--loading"
                  key={`sidebar-loading-${index}`}
                >
                  <div className="sidebar-shell__thumb" />

                  <div className="sidebar-shell__course-body">
                    <div className="sidebar-shell__course-top">
                      <div className="sidebar-shell__skeleton sidebar-shell__skeleton--title" />
                      <div className="sidebar-shell__skeleton sidebar-shell__skeleton--rating" />
                    </div>

                    <div className="sidebar-shell__course-meta">
                      <div className="sidebar-shell__skeleton sidebar-shell__skeleton--meta" />
                      <div className="sidebar-shell__skeleton sidebar-shell__skeleton--meta" />
                      <div className="sidebar-shell__skeleton sidebar-shell__skeleton--meta" />
                    </div>

                    <div className="sidebar-shell__course-bottom">
                      <div className="sidebar-shell__skeleton sidebar-shell__skeleton--progress" />
                      <div className="sidebar-shell__skeleton sidebar-shell__skeleton--button" />
                    </div>
                  </div>
                </article>
              ))}
            </>
          ) : null}

          {!isLoading && !errorMessage && courses.length === 0 ? (
            <div className="sidebar-shell__empty">
              <p className="sidebar-shell__empty-title">Your learning journey starts here!</p>
              <p className="sidebar-shell__empty-text">Browse courses to get started.</p>
              <Link className="sidebar-shell__browse" onClick={onClose} to="/browse">
                Browse Courses
              </Link>
            </div>
          ) : null}

          {!isLoading &&
            courses.map((course) => {
              const progressValue = getProgressValue(course)
              const schedule = getEnrollmentSchedule(course)

              return (
                <article className="sidebar-shell__course" key={course.id}>
                  <div
                    className="sidebar-shell__thumb"
                    style={
                      getCourseImage(course)
                        ? { backgroundImage: `url(${getCourseImage(course)})` }
                        : undefined
                    }
                  />

                  <div className="sidebar-shell__course-body">
                    <div className="sidebar-shell__course-top">
                      <div>
                        <p className="sidebar-shell__course-instructor">
                          Instructor {getInstructorName(course)}
                        </p>
                        <h3 className="sidebar-shell__item-title">{getCourseTitle(course)}</h3>
                      </div>
                      <span className="sidebar-shell__course-rating">
                        {getCourseRating(course)}
                      </span>
                    </div>

                    <div className="sidebar-shell__course-meta">
                      <p className="sidebar-shell__item-text">
                        Final price {formatPrice(getEnrollmentPrice(course))}
                      </p>
                      <p className="sidebar-shell__item-text">
                        {schedule.weeklyLabel} • {schedule.timeLabel}
                      </p>
                      <p className="sidebar-shell__item-text">{schedule.sessionLabel}</p>
                      {schedule.location ? (
                        <p className="sidebar-shell__item-text">{schedule.location}</p>
                      ) : null}
                    </div>

                    <div className="sidebar-shell__course-bottom">
                      <div className="sidebar-shell__progress-block">
                        <span className="sidebar-shell__progress-label">
                          {progressValue}% Complete
                        </span>
                        <div className="sidebar-shell__progress">
                          <span
                            className="sidebar-shell__progress-bar"
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        className="sidebar-shell__view"
                        onClick={onClose}
                        to={`/courses/${getCourseId(course)}`}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
        </div>
      </aside>
    </div>
  )
}

export default EnrolledCoursesSidebar
