import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../AppContext'
import { getFeaturedCourses, getInProgressCourses } from '../api/courses.api'
import courseCardReference from '../assets/course-card-reference.jpg'
import dashboardLock from '../assets/dashboard-lock.svg'
import heroSlideCommunity from '../assets/hero-slide-community.png'
import heroSlideDefault from '../assets/hero-slide-default.png'
import heroSlideProgress from '../assets/hero-slide-progress.png'

function formatPrice(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return 'Price unavailable'
  }

  return `$${Math.round(price)}`
}

function getCourseEntity(item) {
  return item?.course ?? item
}

function getCourseImage(item) {
  const course = getCourseEntity(item)
  return course?.image || course?.thumbnail || course?.coverImage || courseCardReference
}

function getCourseDescription(item) {
  const course = getCourseEntity(item)
  return (
    course?.description ||
    course?.shortDescription ||
    'Course description will appear here once it is available.'
  )
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

function getCourseId(item) {
  return getCourseEntity(item)?.id ?? item?.id
}

function getCourseTitle(item) {
  return getCourseEntity(item)?.title ?? 'Course'
}

function getCourseRating(item) {
  return getCourseEntity(item)?.avgRating ?? 'New'
}

function getCourseBasePrice(item) {
  return getCourseEntity(item)?.basePrice
}

function DashboardCourseCard({ course, isLoading }) {
  if (isLoading) {
    return (
      <article className="dashboard-course-card dashboard-course-card--loading">
        <div className="dashboard-course-card__image" />
        <div className="dashboard-course-card__body">
          <div className="dashboard-course-card__skeleton dashboard-course-card__skeleton--meta" />
          <div className="dashboard-course-card__skeleton dashboard-course-card__skeleton--title" />
          <div className="dashboard-course-card__skeleton dashboard-course-card__skeleton--desc" />
          <div className="dashboard-course-card__skeleton dashboard-course-card__skeleton--footer" />
        </div>
      </article>
    )
  }

  return (
    <article className="dashboard-course-card">
      <div
        className="dashboard-course-card__image"
        style={
          getCourseImage(course)
            ? { backgroundImage: `url(${getCourseImage(course)})` }
            : undefined
        }
      />

      <div className="dashboard-course-card__body">
        <div className="dashboard-course-card__meta">
          <span className="dashboard-course-card__lecturer">
            Lecturer {getInstructorName(course)}
          </span>
          <span className="dashboard-course-card__rating">{getCourseRating(course)}</span>
        </div>

        <h3 className="dashboard-course-card__title">{getCourseTitle(course)}</h3>
        <p className="dashboard-course-card__description">{getCourseDescription(course)}</p>

        <div className="dashboard-course-card__footer">
          <div className="dashboard-course-card__price-block">
            <span className="dashboard-course-card__price-label">Starting from</span>
            <span className="dashboard-course-card__price">
              {formatPrice(getCourseBasePrice(course))}
            </span>
          </div>

          <Link className="dashboard-course-card__button" to={`/courses/${getCourseId(course)}`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  )
}

function ContinueCourseCard({ course, isLoading }) {
  if (isLoading) {
    return (
      <article className="continue-card continue-card--loading">
        <div className="continue-card__image" />
        <div className="continue-card__body">
          <div className="continue-card__skeleton continue-card__skeleton--meta" />
          <div className="continue-card__skeleton continue-card__skeleton--title" />
          <div className="continue-card__skeleton continue-card__skeleton--progress" />
        </div>
      </article>
    )
  }

  const progressValue = getProgressValue(course)

  return (
    <article className="continue-card">
      <div
        className="continue-card__image"
        style={
          getCourseImage(course)
            ? { backgroundImage: `url(${getCourseImage(course)})` }
            : undefined
        }
      />

      <div className="continue-card__body">
        <div className="continue-card__meta">
          <span className="continue-card__lecturer">Lecturer {getInstructorName(course)}</span>
          <span className="continue-card__rating">{getCourseRating(course)}</span>
        </div>

        <h3 className="continue-card__title">{getCourseTitle(course)}</h3>

        <div className="continue-card__progress">
          <span className="continue-card__progress-label">{progressValue}% Complete</span>
          <div className="continue-card__progress-row">
            <div className="continue-card__progress-track">
              <span
                className="continue-card__progress-fill"
                style={{ width: `${progressValue}%` }}
              />
            </div>

            <Link className="continue-card__button" to={`/courses/${getCourseId(course)}`}>
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function DashboardPage() {
  const { isAuthenticated, openEnrolled, openLogin } = useAppContext()
  const heroSlides = [
    {
      title: 'Start learning something new today',
      description:
        'Explore a wide range of expert-led courses in design, development, business, and more. Find the skills you need to grow your career and learn at your own pace.',
      buttonLabel: 'Browse Courses',
      buttonHref: '/browse',
      variant: 'default',
      image: heroSlideDefault,
    },
    {
      title: 'Learn together, grow faster',
      description: '',
      buttonLabel: 'Learn More',
      buttonHref: '/browse',
      variant: 'community',
      image: heroSlideCommunity,
    },
    {
      title: 'Pick up where you left off',
      description:
        'Your learning journey is already in progress. Continue your enrolled courses, track your progress, and stay on track toward completing your goals.',
      buttonLabel: 'Start Learning',
      buttonHref: '/browse',
      variant: 'progress',
      image: heroSlideProgress,
    },
  ]
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [inProgressCourses, setInProgressCourses] = useState([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeHeroSlide, setActiveHeroSlide] = useState(0)

  useEffect(() => {
    heroSlides.forEach((slide) => {
      const image = new Image()
      image.src = slide.image
    })
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadFeaturedCourses() {
      try {
        setIsLoadingFeatured(true)
        const response = await getFeaturedCourses()

        if (!isMounted) {
          return
        }

        setFeaturedCourses((response?.data ?? []).slice(0, 3))
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load featured courses.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeatured(false)
        }
      }
    }

    loadFeaturedCourses()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInProgressCourses() {
      if (!isAuthenticated) {
        setInProgressCourses([])
        setIsLoadingProgress(false)
        return
      }

      try {
        setIsLoadingProgress(true)
        const response = await getInProgressCourses()

        if (!isMounted) {
          return
        }

        setInProgressCourses((response?.data ?? []).slice(0, 4))
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load in-progress courses.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingProgress(false)
        }
      }
    }

    loadInProgressCourses()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const featuredCourseItems = useMemo(() => {
    if (isLoadingFeatured) {
      return Array.from({ length: 3 }, (_, index) => ({
        id: `featured-loading-${index}`,
        isLoading: true,
      }))
    }

    return featuredCourses
  }, [featuredCourses, isLoadingFeatured])

  const progressCourseItems = useMemo(() => {
    if (!isAuthenticated) {
      return Array.from({ length: 3 }, (_, index) => ({
        id: `progress-guest-${index}`,
      }))
    }

    if (isLoadingProgress) {
      return Array.from({ length: 3 }, (_, index) => ({
        id: `progress-loading-${index}`,
        isLoading: true,
      }))
    }

    return inProgressCourses.slice(0, 3)
  }, [inProgressCourses, isAuthenticated, isLoadingProgress])

  const showContinueSection =
    !isAuthenticated || isLoadingProgress || inProgressCourses.length > 0

  const currentHeroSlide = heroSlides[activeHeroSlide]

  function goToPreviousHeroSlide() {
    setActiveHeroSlide((current) =>
      current === 0 ? heroSlides.length - 1 : current - 1,
    )
  }

  function goToNextHeroSlide() {
    setActiveHeroSlide((current) =>
      current === heroSlides.length - 1 ? 0 : current + 1,
    )
  }

  const continueSection = showContinueSection ? (
    <section className="dashboard-section dashboard-section--compact">
      <div className="dashboard-section__header dashboard-section__header--compact">
        <div>
          <h2 className="dashboard-section__title dashboard-section__title--compact">
            Continue Learning
          </h2>
          <p className="dashboard-section__subtitle">Pick up where you left</p>
        </div>

        <button
          className="dashboard-section__see-all"
          onClick={isAuthenticated ? openEnrolled : openLogin}
          type="button"
        >
          See All
        </button>
      </div>

      {!isAuthenticated ? (
        <div className="continue-lockup">
          <div className="continue-grid continue-grid--blurred">
            {progressCourseItems.map((course) => (
              <ContinueCourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="continue-lockup__overlay">
            <div className="continue-lockup__icon-wrap">
              <img alt="" className="continue-lockup__icon" src={dashboardLock} />
            </div>
            <p className="continue-lockup__text">Sign in to track your learning progress</p>
            <button
              className="site-button site-button--dashboard-primary continue-lockup__button"
              onClick={openLogin}
              type="button"
            >
              Log In
            </button>
          </div>
        </div>
      ) : (
        <div className="continue-grid">
          {progressCourseItems.map((course) => (
            <ContinueCourseCard
              key={course.id}
              course={course}
              isLoading={course.isLoading}
            />
          ))}
        </div>
      )}
    </section>
  ) : null

  const startLearningSection = (
    <section className="dashboard-section dashboard-section--compact">
      <div className="dashboard-section__header dashboard-section__header--compact">
        <div>
          <h2 className="dashboard-section__title dashboard-section__title--compact">
            Start Learning Today
          </h2>
          <p className="dashboard-section__subtitle">
            Choose from our most popular courses and begin your journey
          </p>
        </div>
      </div>

      <div className="dashboard-course-grid">
        {featuredCourseItems.map((course) => (
          <DashboardCourseCard
            key={course.id}
            course={course}
            isLoading={course.isLoading}
          />
        ))}
      </div>
    </section>
  )

  return (
    <div className="dashboard-page">
      <section className={`dashboard-hero dashboard-hero--${currentHeroSlide.variant}`}>
        <div className="dashboard-hero__media" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <span
              className={`dashboard-hero__slide ${
                activeHeroSlide === index ? 'dashboard-hero__slide--active' : ''
              }`}
              key={slide.title}
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(18, 18, 24, 0.08), rgba(18, 18, 24, 0.08)), url(${slide.image})`,
              }}
            />
          ))}
        </div>

        <div className="dashboard-hero__content">
          <h1 className="dashboard-hero__title">{currentHeroSlide.title}</h1>
          {currentHeroSlide.description ? (
            <p className="dashboard-hero__description">{currentHeroSlide.description}</p>
          ) : null}

          <Link className="dashboard-hero__button" to={currentHeroSlide.buttonHref}>
            {currentHeroSlide.buttonLabel}
          </Link>
        </div>

        <div className="dashboard-hero__controls">
          <div className="dashboard-hero__dots">
            {heroSlides.map((slide, index) => (
              <button
                aria-label={`Go to slide ${index + 1}`}
                className={`dashboard-hero__dot ${
                  activeHeroSlide === index ? 'dashboard-hero__dot--active' : ''
                }`}
                key={slide.title}
                onClick={() => setActiveHeroSlide(index)}
                type="button"
              />
            ))}
          </div>

          <div className="dashboard-hero__arrows">
            <button
              aria-label="Previous slide"
              className="dashboard-hero__arrow"
              onClick={goToPreviousHeroSlide}
              type="button"
            >
              &#8249;
            </button>
            <button
              aria-label="Next slide"
              className="dashboard-hero__arrow"
              onClick={goToNextHeroSlide}
              type="button"
            >
              &#8250;
            </button>
          </div>
        </div>
      </section>

      {errorMessage ? <p className="dashboard-section__message">{errorMessage}</p> : null}

      {isAuthenticated ? continueSection : null}
      {startLearningSection}
      {!isAuthenticated ? continueSection : null}
    </div>
  )
}

export default DashboardPage
