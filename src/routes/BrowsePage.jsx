const categories = ['Development', 'Design', 'Business', 'Marketing', 'Data Science']
const topics = [
  'React',
  'TypeScript',
  'Python',
  'Figma',
  'JavaScript',
  'Node.js',
  'Machine Learning',
  'Analytics',
]
const instructors = ['Marilyn Mango', 'Ryan Dorwart', 'Roger Calzoni', 'Zain Phillips']

const courseCards = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  title: 'Advanced React & TypeScript Development',
  instructor: 'Marilyn Mango',
  category: 'Development',
  price: '$299',
}))

function BrowsePage() {
  return (
    <section className="browse-page">
      <aside className="browse-filters">
        <div className="browse-filters__top">
          <h1 className="browse-filters__title">Filters</h1>
          <button className="browse-filters__clear" type="button">
            Clear All Filters
          </button>
        </div>

        <div className="browse-filter-group">
          <h2 className="browse-filter-group__title">Categories</h2>
          <div className="browse-filter-group__chips">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`browse-chip ${index === 0 ? 'browse-chip--active' : ''}`}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="browse-filter-group">
          <h2 className="browse-filter-group__title">Topics</h2>
          <div className="browse-filter-group__chips">
            {topics.map((topic) => (
              <button key={topic} className="browse-chip" type="button">
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="browse-filter-group">
          <h2 className="browse-filter-group__title">Instructor</h2>
          <div className="browse-filter-group__instructors">
            {instructors.map((instructor, index) => (
              <button className="browse-instructor" key={instructor} type="button">
                <span className="browse-instructor__avatar">{instructor.charAt(0)}</span>
                <span className="browse-instructor__name">{instructor}</span>
                {index === 0 ? (
                  <span className="browse-instructor__check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="browse-filters__footer">9 Filters Active</div>
      </aside>

      <div className="browse-results">
        <div className="browse-results__top">
          <p className="browse-results__count">Showing 9 out of 90</p>

          <button className="browse-sort" type="button">
            Sort By: Newest First
          </button>
        </div>

        <div className="browse-grid">
          {courseCards.map((course) => (
            <article className="browse-card" key={course.id}>
              <div className="browse-card__image" />

              <div className="browse-card__meta">
                <span>{course.instructor}</span>
                <span>12 Weeks</span>
                <span className="browse-card__rating">4.9</span>
              </div>

              <h3 className="browse-card__title">{course.title}</h3>

              <div className="browse-card__tag">{course.category}</div>

              <div className="browse-card__bottom">
                <div>
                  <p className="browse-card__price-label">Starting from</p>
                  <p className="browse-card__price">{course.price}</p>
                </div>

                <button className="browse-card__button" type="button">
                  Details
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="browse-pagination">
          <button className="browse-pagination__button" type="button">
            ‹
          </button>
          <button className="browse-pagination__button browse-pagination__button--active" type="button">
            1
          </button>
          <button className="browse-pagination__button" type="button">
            2
          </button>
          <button className="browse-pagination__button" type="button">
            3
          </button>
          <button className="browse-pagination__button" type="button">
            10
          </button>
          <button className="browse-pagination__button" type="button">
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default BrowsePage
