import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../AppContext'
import { getEnrollments } from '../api/enrollments.api'
import courseCardReference from '../assets/course-card-reference.jpg'

function getCourseEntity(item) {
  return item?.course ?? item
}

function getCourseImage(item) {
  const course = getCourseEntity(item)
  return course?.image || course?.thumbnail || course?.coverImage || courseCardReference
}

function getInstructorName(item) {
  const course = getCourseEntity(item)
  return course?.instructor?.name || course?.mentor?.name || 'Sarah Johnson'
}

function getProgressValue(course) {
  const rawValue =
    course?.completionPercentage ??
    course?.progressPercentage ??
    course?.progress ??
    course?.completion ??
    65

  const numericValue = Number(rawValue)

  if (Number.isNaN(numericValue)) {
    return 65
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)))
}

function getCourseTitle(item) {
  return getCourseEntity(item)?.title ?? 'Advanced React & TypeScript Development'
}

function getCourseRating(item) {
  return getCourseEntity(item)?.avgRating ?? '4.9'
}

function getCourseId(item) {
  return getCourseEntity(item)?.id ?? item?.id ?? 1
}

function getEnrollmentPrice(item) {
  return Number(item?.totalPrice ?? getCourseEntity(item)?.basePrice ?? 299)
}

function getEnrollmentSchedule(item) {
  const schedule = item?.schedule ?? {}

  return {
    weeklyLabel: schedule?.weeklySchedule?.label ?? 'Monday-Wednesday',
    timeLabel: schedule?.timeSlot?.label ?? 'Evening 6:00 PM - 8:00 PM',
    sessionLabel: schedule?.sessionType?.name
      ? schedule.sessionType.name.replace('_', ' ')
      : 'In Person',
    location:
      schedule?.location || schedule?.sessionType?.location || 'Tbilisi, Chavchavadze St.30',
  }
}

function EnrolledCoursesPage() {
  const { isAuthenticated, openLogin } = useAppContext()
  const [courses, setCourses] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadCourses() {
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
  }, [])

  const totalPrice = useMemo(
    () => courses.reduce((sum, course) => sum + getEnrollmentPrice(course), 0),
    [courses],
  )

  if (!isAuthenticated) {
    return (
      <section className="enrolled-page">
        <div className="enrolled-page__header">
          <div>
            <p className="enrolled-page__eyebrow">Your Learning Journey</p>
            <h1 className="enrolled-page__title">Enrolled Courses</h1>
            <p className="enrolled-page__subtitle">
              Sign in to view your current enrollments, schedules, and progress.
            </p>
          </div>
        </div>

        <div className="enrolled-page__empty">
          <h2 className="enrolled-page__empty-title">Sign in to continue learning</h2>
          <p className="enrolled-page__empty-text">
            Your enrolled courses and progress will appear here once you log in.
          </p>
          <div className="enrolled-page__actions">
            <button className="enrolled-page__browse" onClick={openLogin} type="button">
              Log In
            </button>
            <Link className="enrolled-card__view" to="/browse">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="enrolled-page">
      <div className="enrolled-page__header">
        <div>
          <p className="enrolled-page__eyebrow">Your Learning Journey</p>
          <h1 className="enrolled-page__title">Enrolled Courses</h1>
          <p className="enrolled-page__subtitle">
            Keep track of all your active courses, schedules, and progress in one place.
          </p>
        </div>

        <div className="enrolled-page__summary">
          <div className="enrolled-page__summary-card">
            <span className="enrolled-page__summary-label">Total Enrollments</span>
            <strong className="enrolled-page__summary-value">{courses.length}</strong>
          </div>
          <div className="enrolled-page__summary-card">
            <span className="enrolled-page__summary-label">Total Value</span>
            <strong className="enrolled-page__summary-value">${Math.round(totalPrice)}</strong>
          </div>
        </div>
      </div>

      {errorMessage ? <p className="enrolled-page__message">{errorMessage}</p> : null}

      {isLoading ? (
        <div className="enrolled-page__list">
          {Array.from({ length: 3 }, (_, index) => (
            <article className="enrolled-card enrolled-card--loading" key={`loading-${index}`}>
              <div className="enrolled-card__thumb" />
              <div className="enrolled-card__body">
                <div className="enrolled-card__skeleton enrolled-card__skeleton--title" />
                <div className="enrolled-card__skeleton enrolled-card__skeleton--meta" />
                <div className="enrolled-card__skeleton enrolled-card__skeleton--meta" />
                <div className="enrolled-card__skeleton enrolled-card__skeleton--progress" />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !errorMessage && courses.length === 0 ? (
        <div className="enrolled-page__empty">
          <h2 className="enrolled-page__empty-title">No enrolled courses yet</h2>
          <p className="enrolled-page__empty-text">
            Browse courses and enroll to start building your learning plan.
          </p>
          <Link className="enrolled-page__browse" to="/browse">
            Browse Courses
          </Link>
        </div>
      ) : null}

      {!isLoading && courses.length > 0 ? (
        <div className="enrolled-page__list">
          {courses.map((course) => {
            const progressValue = getProgressValue(course)
            const schedule = getEnrollmentSchedule(course)

            return (
              <article className="enrolled-card" key={course.id}>
                <div
                  className="enrolled-card__thumb"
                  style={
                    getCourseImage(course)
                      ? { backgroundImage: `url(${getCourseImage(course)})` }
                      : undefined
                  }
                />

                <div className="enrolled-card__body">
                  <div className="enrolled-card__top">
                    <div>
                      <p className="enrolled-card__instructor">
                        Instructor {getInstructorName(course)}
                      </p>
                      <h2 className="enrolled-card__title">{getCourseTitle(course)}</h2>
                    </div>
                    <span className="enrolled-card__rating">{getCourseRating(course)}</span>
                  </div>

                  <div className="enrolled-card__meta">
                    <p>Final price ${Math.round(getEnrollmentPrice(course))}</p>
                    <p>{schedule.weeklyLabel}</p>
                    <p>{schedule.timeLabel}</p>
                    <p>{schedule.sessionLabel}</p>
                    {schedule.location ? <p>{schedule.location}</p> : null}
                  </div>

                  <div className="enrolled-card__bottom">
                    <div className="enrolled-card__progress-block">
                      <span className="enrolled-card__progress-label">
                        {progressValue}% Complete
                      </span>
                      <div className="enrolled-card__progress">
                        <span
                          className="enrolled-card__progress-bar"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                    </div>

                    <Link className="enrolled-card__view" to={`/courses/${getCourseId(course)}`}>
                      View
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export default EnrolledCoursesPage
