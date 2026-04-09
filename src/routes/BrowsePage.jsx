function BrowsePage() {
  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Route: /browse</p>
      <h1 className="page-card__title">Browse courses page</h1>
      <p className="page-card__text">
        This route will become the catalog screen with filters on the left and the
        course grid on the right.
      </p>
      <p className="page-card__meta">
        The shared header and footer stay visible, and only the middle page content
        changes.
      </p>
    </section>
  )
}

export default BrowsePage
