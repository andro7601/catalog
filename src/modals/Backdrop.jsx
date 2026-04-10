function Backdrop({ onClose }) {
  return (
    <div
      aria-hidden="true"
      className="overlay-backdrop"
      onClick={onClose}
      role="presentation"
    />
  )
}

export default Backdrop
