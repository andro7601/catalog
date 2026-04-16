import { useEffect, useState } from 'react'
import { register } from '../api/auth.api'
import ModalShell from './ModalShell'

function SignupModal({ isOpen, onClose, onSuccess, onSwitchToLogin }) {
  const [step, setStep] = useState(1)
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    username: '',
    avatar: null,
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setFormValues({
        email: '',
        password: '',
        password_confirmation: '',
        username: '',
        avatar: null,
      })
      setErrorMessage('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  const isLastStep = step === 3

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null

    setFormValues((currentValues) => ({
      ...currentValues,
      avatar: file,
    }))
  }

  async function handleSubmit() {
    if (!isLastStep) {
      setStep((currentStep) => Math.min(3, currentStep + 1))
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      formData.append('username', formValues.username)
      formData.append('email', formValues.email)
      formData.append('password', formValues.password)
      formData.append('password_confirmation', formValues.password_confirmation)

      if (formValues.avatar) {
        formData.append('avatar', formValues.avatar)
      }

      const response = await register(formData)
      const authPayload = response?.data ?? {}

      onSuccess?.({
        token: authPayload.token,
        user: authPayload.user,
      })
    } catch (error) {
      const firstValidationError = error?.data?.errors
        ? Object.values(error.data.errors)[0]?.[0]
        : null

      setErrorMessage(
        firstValidationError || error?.data?.message || error?.message || 'Could not sign up.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
              name="email"
              onChange={handleInputChange}
              placeholder="you@example.com"
              type="email"
              value={formValues.email}
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
                name="password"
                onChange={handleInputChange}
                placeholder="Password"
                type="password"
                value={formValues.password}
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
                name="password_confirmation"
                onChange={handleInputChange}
                placeholder="........"
                type="password"
                value={formValues.password_confirmation}
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
              name="username"
              onChange={handleInputChange}
              placeholder="Username"
              type="text"
              value={formValues.username}
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
                Drag and drop or <span className="auth-modal__switch-link">Upload file</span>
              </p>
              <p className="upload-box__hint">
                {formValues.avatar ? formValues.avatar.name : 'JPG, PNG or WebP'}
              </p>
              <input
                accept=".jpg,.jpeg,.png,.webp"
                className="upload-box__input"
                onChange={handleFileChange}
                type="file"
              />
            </div>
          </div>
        </div>
      ) : null}

      {errorMessage ? <p className="auth-modal__error">{errorMessage}</p> : null}

      <button
        className="auth-modal__submit"
        disabled={isSubmitting}
        onClick={handleSubmit}
        type="button"
      >
        {isLastStep ? (isSubmitting ? 'Creating Account...' : 'Sign Up') : 'Next'}
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
