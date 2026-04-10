import Backdrop from './Backdrop'

function EnrolledCoursesSidebar({ isOpen, onClose }) {
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
          <h2 className="sidebar-shell__title">Enrolled courses</h2>
          <button className="modal-shell__close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="sidebar-shell__list">
          <article className="sidebar-shell__item">
            <h3 className="sidebar-shell__item-title">Advanced React course</h3>
            <p className="sidebar-shell__item-text">
              Structure only for now. Later this sidebar will render real enrollment
              data from the API.
            </p>
          </article>

          <article className="sidebar-shell__item">
            <h3 className="sidebar-shell__item-title">Your summary block</h3>
            <p className="sidebar-shell__item-text">
              We will later add total price, progress, schedules, and empty state
              behavior here.
            </p>
          </article>
        </div>
      </aside>
    </div>
  )
}

export default EnrolledCoursesSidebar
