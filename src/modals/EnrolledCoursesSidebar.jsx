import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getInProgressCourses } from '../api/courses.api'
import Backdrop from './Backdrop'

function getCourseImage(course) {
  return course?.image || course?.thumbnail || course?.coverImage || ''
}

function getInstructorName(course) {
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

function EnrolledCoursesSidebar({ isOpen, onClose }) {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadCourses() {
      if (!isOpen) {
        return
      }

      try {
        const response = await getInProgressCourses()

        if (!isMounted) {
          return
        }

        const items = response?.data ?? []
        setCourses(
          items.length > 0
            ? items
            : Array.from({ length: 4 }, (_, index) => ({
                id: `fallback-${index}`,
                title: 'Advanced React & TypeScript Development',
                completionPercentage: 65,
              })),
        )
      } catch {
        if (isMounted) {
          setCourses(
            Array.from({ length: 4 }, (_, index) => ({
              id: `fallback-${index}`,
              title: 'Advanced React & TypeScript Development',
              completionPercentage: 65,
            })),
          )
        }
      }
    }

    loadCourses()

    return () => {
      isMounted = false
    }
  }, [isOpen])

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
            x
          </button>
        </div>

        <div className="sidebar-shell__list">
          {courses.map((course) => {
            const progressValue = getProgressValue(course)

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
                      <h3 className="sidebar-shell__item-title">{course.title}</h3>
                    </div>
                    <span className="sidebar-shell__course-rating">
                      {course?.avgRating ?? '4.9'}
                    </span>
                  </div>

                  <div className="sidebar-shell__course-meta">
                    <p className="sidebar-shell__item-text">Monday-Wednesday</p>
                    <p className="sidebar-shell__item-text">Evening 6:00 PM - 8:00 PM</p>
                    <p className="sidebar-shell__item-text">In Person</p>
                    <p className="sidebar-shell__item-text">Tbilisi, Chavchavadze St.30</p>
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

                    <Link className="sidebar-shell__view" to={`/courses/${course.id || 1}`}>
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
