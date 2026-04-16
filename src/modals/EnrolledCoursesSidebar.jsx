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
            x
          </button>
        </div>

        <div className="sidebar-shell__list">
          <article className="sidebar-shell__item">
            <div className="sidebar-shell__thumb" />
            <div className="sidebar-shell__item-body">
              <h3 className="sidebar-shell__item-title">Advanced React & TypeScript</h3>
              <p className="sidebar-shell__item-text">Final price: $299</p>
              <p className="sidebar-shell__item-text">Monday-Wednesday • Evening</p>
              <p className="sidebar-shell__item-text">Online</p>
              <div className="sidebar-shell__progress">
                <span className="sidebar-shell__progress-bar" />
              </div>
            </div>
          </article>

          <article className="sidebar-shell__item sidebar-shell__item--summary">
            <div className="sidebar-shell__summary">
              <p className="sidebar-shell__summary-label">Total enrolled courses</p>
              <p className="sidebar-shell__summary-value">2</p>
            </div>
            <div className="sidebar-shell__summary">
              <p className="sidebar-shell__summary-label">Total price</p>
              <p className="sidebar-shell__summary-value">$598</p>
            </div>
          </article>
        </div>
      </aside>
    </div>
  )
}

export default EnrolledCoursesSidebar
