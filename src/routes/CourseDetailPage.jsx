import { useParams } from 'react-router-dom'

function CourseDetailPage() {
  const { courseId } = useParams()

  return (
    <section className="page-card">
      <p className="page-card__eyebrow">Route: /courses/:courseId</p>
      <h1 className="page-card__title">Course detail page</h1>
      <p className="page-card__text">
        This route is dynamic. React Router reads the course id from the URL so we
        can load the right course later.
      </p>
      <p className="page-card__meta">Current course id from URL: {courseId}</p>
    </section>
  )
}

export default CourseDetailPage
