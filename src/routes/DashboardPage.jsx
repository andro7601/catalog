function DashboardPage() {
  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Route: /</p>
      <h1 className="page-card__title">Dashboard page</h1>
      <p className="page-card__text">
        This is the homepage route. Later it will hold the hero banner, featured
        courses, and the continue learning section.
      </p>
      <p className="page-card__meta">
        React Router is currently rendering this component because the URL is
        exactly `/`.
      </p>
    </section>
  )
}

export default DashboardPage
