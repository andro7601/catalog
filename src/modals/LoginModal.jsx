import { useEffect, useState } from 'react'
import { login } from '../api/auth.api'
import ModalShell from './ModalShell'

function LoginModal({ isOpen, onClose, onSuccess, onSwitchToSignup }) {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFormValues({
        email: '',
        password: '',
      })
      setErrorMessage('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await login(formValues)
      const authPayload = response?.data ?? {}

      onSuccess?.({
        token: authPayload.token,
        user: authPayload.user,
      })
    } catch (error) {
      setErrorMessage(error?.data?.message || error?.message || 'Could not log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} panelClassName="auth-modal">
      <button className="modal-shell__close" onClick={onClose} type="button">
        x
      </button>

      <div className="auth-modal__header">
        <h2 className="auth-modal__title">Welcome Back</h2>
        <p className="auth-modal__subtitle">Log in to continue your learning</p>
      </div>

      <form className="auth-modal__form" onSubmit={handleSubmit}>
        <label className="auth-modal__field" htmlFor="login-email">
          <span className="auth-modal__label">Email</span>
          <input
            className="auth-modal__input"
            id="login-email"
            name="email"
            onChange={handleInputChange}
            placeholder="you@example.com"
            type="email"
            value={formValues.email}
          />
        </label>

        <label className="auth-modal__field" htmlFor="login-password">
          <span className="auth-modal__label">Password</span>
          <span className="auth-modal__input-wrap">
            <input
              className="auth-modal__input auth-modal__input--with-icon"
              id="login-password"
              name="password"
              onChange={handleInputChange}
              placeholder="........"
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
        {errorMessage ? <p className="auth-modal__error">{errorMessage}</p> : null}

        <button className="auth-modal__submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <div className="auth-modal__divider">
        <span>or</span>
      </div>

      <p className="auth-modal__switch-text">
        Don&apos;t have an account?{' '}
        <button
          className="auth-modal__switch-link"
          onClick={onSwitchToSignup}
          type="button"
        >
          Sign Up
        </button>
      </p>
    </ModalShell>
  )
}

export default LoginModal
