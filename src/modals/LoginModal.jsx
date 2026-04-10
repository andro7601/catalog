import ModalShell from './ModalShell'

function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <button className="modal-shell__close" onClick={onClose} type="button">
        ×
      </button>
      <p className="modal-shell__eyebrow">Modal Structure</p>
      <h2 className="modal-shell__title">Welcome back</h2>
      <p className="modal-shell__text">
        This is the login modal shell. Later we will connect the real form state
        and API call here.
      </p>

      <div className="modal-shell__stack">
        <div className="modal-shell__field">
          <label className="modal-shell__label" htmlFor="login-email">
            Email
          </label>
          <input
            className="modal-shell__input"
            id="login-email"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <div className="modal-shell__field">
          <label className="modal-shell__label" htmlFor="login-password">
            Password
          </label>
          <input
            className="modal-shell__input"
            id="login-password"
            placeholder="Enter password"
            type="password"
          />
        </div>
      </div>

      <div className="modal-shell__footer">
        <button className="site-button site-button--primary" type="button">
          Log In
        </button>
        <button
          className="modal-shell__switch"
          onClick={onSwitchToSignup}
          type="button"
        >
          Need an account?
        </button>
      </div>
    </ModalShell>
  )
}

export default LoginModal