import { useEffect, useState } from 'react'
import ModalShell from './ModalShell'

function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (!isOpen) {
      setStep(1)
    }
  }, [isOpen])

  const isLastStep = step === 3

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} panelClassName="auth-modal auth-modal--signup">
      <button className="modal-shell__close" onClick={onClose} type="button">
        x
      </button>

      {step > 1 ? (
        <button
          className="auth-modal__back"
          onClick={() => setStep((currentStep) => Math.max(1, currentStep - 1))}
          type="button"
        >
          <svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.5 4.5L6 8L9.5 11.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.3"
            />
          </svg>
        </button>
      ) : null}

      <div className="auth-modal__header">
        <h2 className="auth-modal__title">Create Account</h2>
        <p className="auth-modal__subtitle">Join and start learning today</p>
      </div>

      <div className="signup-steps" aria-hidden="true">
        <span className={`signup-steps__bar ${step >= 1 ? 'signup-steps__bar--active' : ''}`} />
        <span className={`signup-steps__bar ${step >= 2 ? 'signup-steps__bar--active' : ''}`} />
        <span className={`signup-steps__bar ${step >= 3 ? 'signup-steps__bar--active' : ''}`} />
      </div>

      {step === 1 ? (
        <div className="auth-modal__form">
          <label className="auth-modal__field" htmlFor="signup-email">
            <span className="auth-modal__label">Email*</span>
            <input
              className="auth-modal__input"
              id="signup-email"
              placeholder="you@example.com"
              type="email"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="auth-modal__form">
          <label className="auth-modal__field" htmlFor="signup-password">
            <span className="auth-modal__label">Password*</span>
            <span className="auth-modal__input-wrap">
              <input
                className="auth-modal__input auth-modal__input--with-icon"
                id="signup-password"
                placeholder="Password"
                type="password"
              />
              <span aria-hidden="true" className="auth-modal__input-icon">
                <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.25 9C3.57 6.26 6.05 4.5 9 4.5C11.95 4.5 14.43 6.26 15.75 9C14.43 11.74 11.95 13.5 9 13.5C6.05 13.5 3.57 11.74 2.25 9Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                  />
                  <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </span>
          </label>

          <label className="auth-modal__field" htmlFor="signup-confirm-password">
            <span className="auth-modal__label">Confirm Password*</span>
            <span className="auth-modal__input-wrap">
              <input
                className="auth-modal__input auth-modal__input--with-icon"
                id="signup-confirm-password"
                placeholder="........"
                type="password"
              />
              <span aria-hidden="true" className="auth-modal__input-icon">
                <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.8 9.5C3.9 7.08 6.15 5.5 8.9 5.5C11.66 5.5 13.9 7.08 15.01 9.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M6.5 11.6C7.15 12.01 7.99 12.25 8.9 12.25C9.81 12.25 10.65 12.01 11.3 11.6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                  />
                </svg>
              </span>
            </span>
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="auth-modal__form">
          <label className="auth-modal__field" htmlFor="signup-username">
            <span className="auth-modal__label">Username*</span>
            <input
              className="auth-modal__input"
              id="signup-username"
              placeholder="Username"
              type="text"
            />
          </label>

          <div className="upload-box">
            <span className="auth-modal__label">Upload Avatar</span>
            <div className="upload-box__panel">
              <span aria-hidden="true" className="upload-box__icon">
                <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 15V7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8.5 10.5L12 7L15.5 10.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5 17.5H19"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <p className="upload-box__text">
                Drag and drop or{' '}
                <button className="auth-modal__switch-link" type="button">
                  Upload file
                </button>
              </p>
              <p className="upload-box__hint">JPG, PNG or WebP</p>
            </div>
          </div>
        </div>
      ) : null}

      <button
        className="auth-modal__submit"
        onClick={() => {
          if (!isLastStep) {
            setStep((currentStep) => Math.min(3, currentStep + 1))
          }
        }}
        type="button"
      >
        {isLastStep ? 'Sign Up' : 'Next'}
      </button>

      <div className="auth-modal__divider">
        <span>or</span>
      </div>

      <p className="auth-modal__switch-text">
        Already have an account?{' '}
        <button className="auth-modal__switch-link" onClick={onSwitchToLogin} type="button">
          Log In
        </button>
      </p>
    </ModalShell>
  )
}

export default SignupModal
