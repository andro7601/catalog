import { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '../AppContext'
import { updateProfile } from '../api/profile.api'
import ModalShell from './ModalShell'

function getInitialValues(user) {
  return {
    fullName: user?.fullName ?? user?.full_name ?? '',
    mobileNumber: formatMobileNumber(user?.mobileNumber ?? user?.mobile_number ?? ''),
    age: user?.age ? String(user.age) : '',
    avatar: null,
  }
}

function normalizeMobileNumber(value) {
  return value.replace(/\D/g, '')
}

function formatMobileNumber(value) {
  const digits = normalizeMobileNumber(value).slice(0, 9)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

function validateFullName(value) {
  const trimmed = value.trim()

  if (!trimmed) return 'Name is required'
  if (trimmed.length < 3) return 'Name must be at least 3 characters'
  if (trimmed.length > 50) return 'Name must not exceed 50 characters'
  return ''
}

function validateMobileNumber(value) {
  const digits = normalizeMobileNumber(value)

  if (!digits) return 'Mobile number is required'
  if (!/^\d+$/.test(digits)) {
    return 'Please enter a valid Georgian mobile number (9 digits starting with 5)'
  }
  if (!digits.startsWith('5')) return 'Georgian mobile numbers must start with 5'
  if (digits.length !== 9) return 'Mobile number must be exactly 9 digits'
  return ''
}

function validateAge(value) {
  if (value === '') return 'Age is required'
  if (!/^\d+$/.test(value)) return 'Age must be a number'

  const numericAge = Number(value)

  if (numericAge < 16) return 'You must be at least 16 years old to enroll'
  if (numericAge > 120) return 'Please enter a valid age'
  return ''
}

function getFieldError(name, value) {
  if (name === 'fullName') return validateFullName(value)
  if (name === 'mobileNumber') return validateMobileNumber(value)
  if (name === 'age') return validateAge(value)
  return ''
}

function ProfileModal({ isOpen, onClose, onSuccess }) {
  const { authUser, onLogout } = useAppContext()
  const [formValues, setFormValues] = useState(getInitialValues(authUser))
  const [touchedFields, setTouchedFields] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const initialValues = useMemo(() => getInitialValues(authUser), [authUser])

  const fieldErrors = useMemo(
    () => ({
      fullName: getFieldError('fullName', formValues.fullName),
      mobileNumber: getFieldError('mobileNumber', formValues.mobileNumber),
      age: getFieldError('age', formValues.age),
    }),
    [formValues],
  )

  const isFormValid = useMemo(
    () => Object.values(fieldErrors).every((error) => !error),
    [fieldErrors],
  )

  const isProfileComplete = useMemo(
    () =>
      Boolean(formValues.fullName.trim()) &&
      Boolean(normalizeMobileNumber(formValues.mobileNumber)) &&
      Boolean(formValues.age) &&
      isFormValid,
    [formValues, isFormValid],
  )

  const isDirty = useMemo(
    () =>
      formValues.fullName !== initialValues.fullName ||
      normalizeMobileNumber(formValues.mobileNumber) !==
        normalizeMobileNumber(initialValues.mobileNumber) ||
      formValues.age !== initialValues.age ||
      Boolean(formValues.avatar),
    [formValues, initialValues],
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormValues(initialValues)
    setTouchedFields({})
    setErrorMessage('')
    setIsSubmitting(false)
    setShowCloseConfirm(false)
  }, [initialValues, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDirty, isProfileComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  function requestClose() {
    if (!isProfileComplete || isDirty) {
      setShowCloseConfirm(true)
      return
    }

    setShowCloseConfirm(false)
    onClose?.()
  }

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: name === 'mobileNumber' ? formatMobileNumber(value) : value,
    }))

    if (showCloseConfirm) {
      setShowCloseConfirm(false)
    }
  }

  function handleBlur(event) {
    const { name } = event.target

    setTouchedFields((currentFields) => ({
      ...currentFields,
      [name]: true,
    }))
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null

    setFormValues((currentValues) => ({
      ...currentValues,
      avatar: file,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setTouchedFields({
      fullName: true,
      mobileNumber: true,
      age: true,
    })
    setErrorMessage('')
    setShowCloseConfirm(false)

    if (!isFormValid) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()

      formData.append('full_name', formValues.fullName.trim())
      formData.append('mobile_number', normalizeMobileNumber(formValues.mobileNumber))
      formData.append('age', formValues.age)

      if (formValues.avatar) {
        formData.append('avatar', formValues.avatar)
      }

      const response = await updateProfile(formData)
      const nextUser = response?.data ?? null

      onSuccess?.(nextUser)
      onClose?.()
    } catch (error) {
      const firstValidationError = error?.data?.errors
        ? Object.values(error.data.errors)[0]?.[0]
        : null

      setErrorMessage(
        firstValidationError ||
          error?.data?.message ||
          error?.message ||
          'Could not update profile.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function getInputStateClass(name) {
    if (!touchedFields[name]) return ''
    if (fieldErrors[name]) return 'auth-modal__input--invalid'
    return 'auth-modal__input--valid'
  }

  function getFieldMessage(name) {
    if (!touchedFields[name]) return ''
    return fieldErrors[name]
  }

  return (
    <ModalShell isOpen={isOpen} onClose={requestClose} panelClassName="profile-modal">
      <button className="modal-shell__close" onClick={requestClose} type="button">
        ×
      </button>

      <div className="profile-modal__header">
        <h2 className="profile-modal__title">Profile</h2>
      </div>

      <div className="profile-modal__identity">
        {authUser?.avatar ? (
          <img alt="" className="profile-modal__avatar-image" src={authUser.avatar} />
        ) : (
          <div className="profile-modal__avatar" />
        )}
        <div>
          <p className="profile-modal__name">{authUser?.username ?? 'Username'}</p>
          <p
            className={`profile-modal__status ${
              isProfileComplete ? 'profile-modal__status--complete' : 'profile-modal__status--incomplete'
            }`}
          >
            {isProfileComplete ? 'Profile Complete ✓' : 'Incomplete Profile'}
          </p>
        </div>
      </div>

      <form className="profile-modal__form" onSubmit={handleSubmit}>
        <label className="auth-modal__field" htmlFor="profile-name">
          <span className="auth-modal__label">Full Name</span>
          <span className="auth-modal__input-wrap">
            <input
              className={`auth-modal__input auth-modal__input--with-icon ${getInputStateClass('fullName')}`.trim()}
              id="profile-name"
              name="fullName"
              onBlur={handleBlur}
              onChange={handleInputChange}
              placeholder="Full name"
              type="text"
              value={formValues.fullName}
            />
            <span aria-hidden="true" className="auth-modal__input-icon">
              {touchedFields.fullName && !fieldErrors.fullName ? '✓' : ''}
            </span>
          </span>
          {getFieldMessage('fullName') ? (
            <span className="auth-modal__error">{getFieldMessage('fullName')}</span>
          ) : null}
        </label>

        <label className="auth-modal__field" htmlFor="profile-email">
          <span className="auth-modal__label">Email</span>
          <span className="auth-modal__input-wrap">
            <input
              className="auth-modal__input auth-modal__input--with-icon auth-modal__input--disabled"
              disabled
              id="profile-email"
              readOnly
              type="email"
              value={authUser?.email ?? ''}
            />
            <span aria-hidden="true" className="auth-modal__input-icon auth-modal__input-icon--valid">
              ✓
            </span>
          </span>
        </label>

        <div className="profile-modal__row">
          <label className="auth-modal__field" htmlFor="profile-mobile">
            <span className="auth-modal__label">Mobile Number</span>
            <span className="auth-modal__input-wrap">
              <input
                className={`auth-modal__input auth-modal__input--with-icon ${getInputStateClass('mobileNumber')}`.trim()}
                id="profile-mobile"
                name="mobileNumber"
                onBlur={handleBlur}
                onChange={handleInputChange}
                placeholder="555 123 456"
                type="text"
                value={formValues.mobileNumber}
              />
              <span aria-hidden="true" className="auth-modal__input-icon">
                {touchedFields.mobileNumber && !fieldErrors.mobileNumber ? '✓' : ''}
              </span>
            </span>
            {getFieldMessage('mobileNumber') ? (
              <span className="auth-modal__error">{getFieldMessage('mobileNumber')}</span>
            ) : null}
          </label>

          <label className="auth-modal__field profile-modal__field--age" htmlFor="profile-age">
            <span className="auth-modal__label">Age</span>
            <span className="auth-modal__input-wrap">
              <input
                className={`auth-modal__input auth-modal__input--with-icon ${getInputStateClass('age')}`.trim()}
                id="profile-age"
                inputMode="numeric"
                name="age"
                onBlur={handleBlur}
                onChange={handleInputChange}
                placeholder="18"
                type="text"
                value={formValues.age}
              />
              <span aria-hidden="true" className="auth-modal__input-icon">
                {touchedFields.age && !fieldErrors.age ? '✓' : ''}
              </span>
            </span>
            {getFieldMessage('age') ? (
              <span className="auth-modal__error">{getFieldMessage('age')}</span>
            ) : null}
          </label>
        </div>

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

        {errorMessage ? <p className="auth-modal__error">{errorMessage}</p> : null}

        {showCloseConfirm ? (
          <div className="profile-modal__confirm">
            <p className="profile-modal__confirm-text">
              Your profile is incomplete. You won't be able to enroll in courses until you
              complete it. Close anyway?
            </p>
            <div className="profile-modal__confirm-actions">
              <button
                className="profile-modal__logout"
                onClick={() => setShowCloseConfirm(false)}
                type="button"
              >
                Keep Editing
              </button>
              <button className="auth-modal__submit" onClick={onClose} type="button">
                Close Anyway
              </button>
            </div>
          </div>
        ) : null}

        <div className="profile-modal__actions">
          <button className="auth-modal__submit" disabled={!isFormValid || isSubmitting} type="submit">
            {isSubmitting ? 'Saving Profile...' : 'Save Profile'}
          </button>
          <button className="profile-modal__logout" onClick={requestClose} type="button">
            Close
          </button>
          <button className="profile-modal__logout" onClick={onLogout} type="button">
            Log Out
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

export default ProfileModal
