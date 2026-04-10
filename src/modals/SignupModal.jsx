import ModalShell from './ModalShell'

function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="modal-shell__close" onClick={onClose} type="button">
        ×
      </button>
      <p className="modal-shell__eyebrow">Modal Structure</p>
      <h2 className="modal-shell__title">Create account</h2>
      <p className="modal-shell__text">
        This is the signup modal shell. We will plug in validation, avatar upload,
        and the register API next.
      </p>

      <div className="modal-shell__stack">
        <div className="modal-shell__field">
          <label className="modal-shell__label" htmlFor="signup-username">
            Username
          </label>
          <input
            className="modal-shell__input"
            id="signup-username"
            placeholder="Choose a username"
            type="text"
          />
        </div>

        <div className="modal-shell__field">
          <label className="modal-shell__label" htmlFor="signup-email">
            Email
          </label>
          <input
            className="modal-shell__input"
            id="signup-email"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <div className="modal-shell__field">
          <label className="modal-shell__label" htmlFor="signup-password">
            Password
          </label>
          <input
            className="modal-shell__input"
            id="signup-password"
            placeholder="Choose a password"
            type="password"
          />
        </div>
      </div>

      <div className="modal-shell__footer">
        <button className="site-button site-button--primary" type="button">
          Sign Up
        </button>
        <button
          className="modal-shell__switch"
          onClick={onSwitchToLogin}
          type="button"
        >
          Already have an account?
        </button>
      </div>
    </ModalShell>
  )
}

export default SignupModal
