import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourses } from '../api/courses.api'
import { getCategories, getInstructors, getTopics } from '../api/filters.api'

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Title: A-Z', value: 'title_asc' },
]

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function buildQueryString({ page, sort, categories, topics, instructors }) {
  const params = new URLSearchParams()

  params.set('page', String(page))
  params.set('sort', sort)

  categories.forEach((categoryId) => params.append('categories[]', String(categoryId)))
  topics.forEach((topicId) => params.append('topics[]', String(topicId)))
  instructors.forEach((instructorId) =>
    params.append('instructors[]', String(instructorId)),
  )

  return params.toString()
}

function BrowsePage() {
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [instructors, setInstructors] = useState([])
  const [courses, setCourses] = useState([])
  const [meta, setMeta] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedInstructors, setSelectedInstructors] = useState([])
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const activeFilterCount =
    selectedCategories.length + selectedTopics.length + selectedInstructors.length

  const breadcrumbCategoryName =
    selectedCategories.length === 1
      ? categories.find((category) => String(category.id) === String(selectedCategories[0]))?.name
      : null

  useEffect(() => {
    let isMounted = true

    async function loadInitialFilters() {
      try {
        setIsLoadingFilters(true)

        const [categoriesResponse, topicsResponse, instructorsResponse] = await Promise.all([
          getCategories(),
          getTopics(),
          getInstructors(),
        ])

        if (!isMounted) {
          return
        }

        setCategories(categoriesResponse?.data ?? [])
        setTopics(topicsResponse?.data ?? [])
        setInstructors(instructorsResponse?.data ?? [])
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load browse filters.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingFilters(false)
        }
      }
    }

    loadInitialFilters()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadTopicsByCategory() {
      try {
        const query = selectedCategories
          .map((categoryId) => `categories[]=${categoryId}`)
          .join('&')
        const response = await getTopics(query)

        if (!isMounted) {
          return
        }

        const nextTopics = response?.data ?? []
        setTopics(nextTopics)
        setSelectedTopics((currentTopics) =>
          currentTopics.filter((topicId) =>
            nextTopics.some((topic) => topic.id === topicId),
          ),
        )
      } catch {
        if (isMounted) {
          setErrorMessage('Could not update topics.')
        }
      }
    }

    loadTopicsByCategory()

    return () => {
      isMounted = false
    }
  }, [selectedCategories])

  const courseQuery = useMemo(
    () =>
      buildQueryString({
        page,
        sort,
        categories: selectedCategories,
        topics: selectedTopics,
        instructors: selectedInstructors,
      }),
    [page, selectedCategories, selectedInstructors, selectedTopics, sort],
  )

  useEffect(() => {
    let isMounted = true

    async function loadCourses() {
      try {
        setIsLoadingCourses(true)
        setErrorMessage('')

        const response = await getCourses(courseQuery)

        if (!isMounted) {
          return
        }

        setCourses(response?.data ?? [])
        setMeta(response?.meta ?? null)
      } catch {
        if (isMounted) {
          setErrorMessage('Could not load courses.')
          setCourses([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false)
        }
      }
    }

    loadCourses()

    return () => {
      isMounted = false
    }
  }, [courseQuery])

  const totalPages = meta?.lastPage ?? 1
  const currentPage = meta?.currentPage ?? page
  const totalCourses = meta?.total ?? 0

  function clearAllFilters() {
    setSelectedCategories([])
    setSelectedTopics([])
    setSelectedInstructors([])
    setPage(1)
  }

  function handleCategoryToggle(categoryId) {
    setSelectedCategories((currentCategories) => toggleValue(currentCategories, categoryId))
    setPage(1)
  }

  function handleTopicToggle(topicId) {
    setSelectedTopics((currentTopics) => toggleValue(currentTopics, topicId))
    setPage(1)
  }

  function handleInstructorToggle(instructorId) {
    setSelectedInstructors((currentInstructors) =>
      toggleValue(currentInstructors, instructorId),
    )
    setPage(1)
  }

  function handleSortChange(event) {
    setSort(event.target.value)
    setPage(1)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <section className="browse-page">
      <div className="browse-breadcrumb" aria-label="Breadcrumb">
        <span>Home</span>
        <span className="browse-breadcrumb__sep" aria-hidden="true">
          ›
        </span>
        <span>Browse</span>
        {breadcrumbCategoryName ? (
          <>
            <span className="browse-breadcrumb__sep" aria-hidden="true">
              ›
            </span>
            <span className="browse-breadcrumb__current">{breadcrumbCategoryName}</span>
          </>
        ) : null}
      </div>

      <aside className="browse-filters">
        <div className="browse-filters__top">
          <h1 className="browse-filters__title">Filters</h1>
          <button className="browse-filters__clear" onClick={clearAllFilters} type="button">
            Clear All Filters <span className="browse-filters__clear-x" aria-hidden="true">×</span>
          </button>
        </div>

        <div className="browse-filter-group">
          <h2 className="browse-filter-group__title">Categories</h2>
          <div className="browse-filter-group__chips">
            {categories.map((category) => (
              <label
                className={`browse-chip ${
                  selectedCategories.includes(category.id) ? 'browse-chip--active' : ''
                }`}
                key={category.id}
              >
                <input
                  checked={selectedCategories.includes(category.id)}
                  className="browse-chip__input"
                  onChange={() => handleCategoryToggle(category.id)}
                  type="checkbox"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="browse-filter-group">
          <h2 className="browse-filter-group__title">Topics</h2>
          <div className="browse-filter-group__chips">
            {topics.map((topic) => (
              <label
                className={`browse-chip ${
                  selectedTopics.includes(topic.id) ? 'browse-chip--active' : ''
                }`}
                key={topic.id}
              >
                <input
                  checked={selectedTopics.includes(topic.id)}
                  className="browse-chip__input"
                  onChange={() => handleTopicToggle(topic.id)}
                  type="checkbox"
                />
                <span>{topic.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="browse-filter-group">
          <h2 className="browse-filter-group__title">Instructor</h2>
          <div className="browse-filter-group__instructors">
            {instructors.map((instructor) => (
              <label className="browse-instructor" key={instructor.id}>
                <input
                  checked={selectedInstructors.includes(instructor.id)}
                  className="browse-instructor__input"
                  onChange={() => handleInstructorToggle(instructor.id)}
                  type="checkbox"
                />
                <span className="browse-instructor__avatar">
                  {instructor.avatar ? (
                    <img
                      alt=""
                      className="browse-instructor__avatar-image"
                      src={instructor.avatar}
                    />
                  ) : (
                    instructor.name.charAt(0)
                  )}
                </span>
                <span className="browse-instructor__name">{instructor.name}</span>
                {selectedInstructors.includes(instructor.id) ? (
                  <span className="browse-instructor__check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        </div>

        <div className="browse-filters__footer">
          {isLoadingFilters ? 'Loading filters...' : `${activeFilterCount} filters active`}
        </div>
      </aside>

      <div className="browse-results">
        <div className="browse-results__top">
          <p className="browse-results__count">
            {isLoadingCourses
              ? 'Loading courses...'
              : totalCourses > 0
                ? `Showing ${courses.length} out of ${totalCourses}`
                : 'No courses found'}
          </p>

          <label className="browse-sort-wrap">
            <span className="browse-sort-wrap__label">Sort By:</span>
            <select className="browse-sort" onChange={handleSortChange} value={sort}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errorMessage ? <p className="browse-results__message">{errorMessage}</p> : null}

        <div className="browse-grid">
          {isLoadingCourses
            ? Array.from({ length: 10 }, (_, index) => (
                <article className="browse-card browse-card--loading" key={`loading-${index}`}>
                  <div className="browse-card__image" />
                  <div className="browse-card__skeleton browse-card__skeleton--meta" />
                  <div className="browse-card__skeleton browse-card__skeleton--title" />
                  <div className="browse-card__skeleton browse-card__skeleton--tag" />
                  <div className="browse-card__skeleton browse-card__skeleton--bottom" />
                </article>
              ))
            : courses.map((course) => (
                <Link className="browse-card" key={course.id} to={`/courses/${course.id}`}>
                  <div
                    className="browse-card__image"
                    style={course.image ? { backgroundImage: `url(${course.image})` } : undefined}
                  />

                  <div className="browse-card__meta">
                    <span>{course.instructor?.name ?? 'Unknown Instructor'}</span>
                    <span>{course.durationWeeks} Weeks</span>
                    <span className="browse-card__rating">{course.avgRating ?? '4.9'}</span>
                  </div>

                  <h3 className="browse-card__title">{course.title}</h3>

                  <div className="browse-card__tag">{course.category?.name ?? 'Course'}</div>

                  <div className="browse-card__bottom">
                    <div>
                      <p className="browse-card__price-label">Starting from</p>
                      <p className="browse-card__price">${Math.round(course.basePrice)}</p>
                    </div>

                    <span className="browse-card__button">Details</span>
                  </div>
                </Link>
              ))}
        </div>

        {!isLoadingCourses && courses.length === 0 ? (
          <p className="browse-results__message">No courses found.</p>
        ) : null}

        <div className="browse-pagination">
          <button
            className="browse-pagination__button"
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            ‹
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              className={`browse-pagination__button ${
                pageNumber === currentPage ? 'browse-pagination__button--active' : ''
              }`}
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          ))}

          <button
            className="browse-pagination__button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default BrowsePage
