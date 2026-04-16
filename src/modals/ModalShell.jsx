import Backdrop from './Backdrop'

function ModalShell({ children, isOpen, onClose, panelClassName = '' }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-shell">
      <Backdrop onClose={onClose} />
      <div
        aria-modal="true"
        className={`modal-shell__panel ${panelClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        {children}
      </div>
    </div>
  )
}

export default ModalShell
