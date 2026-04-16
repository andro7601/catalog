import { useEffect, useState } from 'react'
import { useAppContext } from '../AppContext'
import { updateProfile } from '../api/profile.api'
import ModalShell from './ModalShell'

function ProfileModal({ isOpen, onClose, onSuccess }) {
  const { authUser, onLogout } = useAppContext()
  const [formValues, setFormValues] = useState({
    fullName: '',
    mobileNumber: '',
    age: '',
    avatar: null,
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormValues({
      fullName: authUser?.fullName ?? '',
      mobileNumber: authUser?.mobileNumber ?? '',
      age: authUser?.age ? String(authUser.age) : '',
      avatar: null,
    })
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(false)
  }, [authUser, isOpen])

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

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      formData.append('full_name', formValues.fullName)
      formData.append('mobile_number', formValues.mobileNumber.replace(/\D/g, ''))
      formData.append('age', formValues.age)

      if (formValues.avatar) {
        formData.append('avatar', formValues.avatar)
      }

      const response = await updateProfile(formData)
      const nextUser = response?.data ?? null

      onSuccess?.(nextUser)
      setSuccessMessage('Profile updated successfully.')
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

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} panelClassName="profile-modal">
      <button className="modal-shell__close" onClick={onClose} type="button">
        x
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
          <p className="profile-modal__status">
            {authUser?.profileComplete ? 'Profile is Complete' : 'Profile needs updates'}
          </p>
        </div>
      </div>

      <form className="profile-modal__form" onSubmit={handleSubmit}>
        <label className="auth-modal__field" htmlFor="profile-name">
          <span className="auth-modal__label">Full Name</span>
          <span className="auth-modal__input-wrap">
            <input
              className="auth-modal__input auth-modal__input--with-icon"
              id="profile-name"
              name="fullName"
              onChange={handleInputChange}
              placeholder="Full name"
              type="text"
              value={formValues.fullName}
            />
            <span aria-hidden="true" className="auth-modal__input-icon">
              <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.9 3.6L14.4 6.1"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.2"
                />
                <path
                  d="M3.75 14.25L6.54 13.69L13.72 6.52C14.1 6.13 14.1 5.5 13.72 5.12L12.88 4.28C12.5 3.9 11.87 3.9 11.48 4.28L4.31 11.46L3.75 14.25Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.2"
                />
              </svg>
            </span>
          </span>
        </label>

        <label className="auth-modal__field" htmlFor="profile-email">
          <span className="auth-modal__label">Email</span>
          <span className="auth-modal__input-wrap">
            <input
              className="auth-modal__input auth-modal__input--with-icon auth-modal__input--disabled"
              id="profile-email"
              disabled
              placeholder="Email@gmail.com"
              type="email"
              value={authUser?.email ?? ''}
              readOnly
            />
            <span aria-hidden="true" className="auth-modal__input-icon">
              <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.5 9L8 11.5L12.5 7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.2"
                />
              </svg>
            </span>
          </span>
        </label>

        <div className="profile-modal__row">
          <label className="auth-modal__field" htmlFor="profile-mobile">
            <span className="auth-modal__label">Mobile Number</span>
            <span className="auth-modal__input-wrap">
              <input
                className="auth-modal__input auth-modal__input--with-icon"
                id="profile-mobile"
                name="mobileNumber"
                onChange={handleInputChange}
                placeholder="+995 599209820"
                type="text"
                value={formValues.mobileNumber}
              />
              <span aria-hidden="true" className="auth-modal__input-icon">
                <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5.5 9L8 11.5L12.5 7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                  />
                </svg>
              </span>
            </span>
          </label>

          <label className="auth-modal__field profile-modal__field--age" htmlFor="profile-age">
            <span className="auth-modal__label">Age</span>
            <span className="auth-modal__input-wrap">
              <input
                className="auth-modal__input auth-modal__input--with-icon"
                id="profile-age"
                name="age"
                onChange={handleInputChange}
                placeholder="29"
                type="text"
                value={formValues.age}
              />
              <span aria-hidden="true" className="auth-modal__input-icon">
                <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5 7L9 11L13 7"
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
        {successMessage ? <p className="auth-modal__success">{successMessage}</p> : null}

        <div className="profile-modal__actions">
          <button className="auth-modal__submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
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
