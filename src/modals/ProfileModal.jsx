import ModalShell from './ModalShell'

function ProfileModal({ isOpen, onClose }) {
  return (
    <ModalShell isOpen={isOpen} onClose={onClose} panelClassName="profile-modal">
      <button className="modal-shell__close" onClick={onClose} type="button">
        x
      </button>

      <div className="profile-modal__header">
        <h2 className="profile-modal__title">Profile</h2>
      </div>

      <div className="profile-modal__identity">
        <div className="profile-modal__avatar" />
        <div>
          <p className="profile-modal__name">Username</p>
          <p className="profile-modal__status">Profile is Complete</p>
        </div>
      </div>

      <div className="profile-modal__form">
        <label className="auth-modal__field" htmlFor="profile-name">
          <span className="auth-modal__label">Full Name</span>
          <span className="auth-modal__input-wrap">
            <input
              className="auth-modal__input auth-modal__input--with-icon"
              id="profile-name"
              placeholder="Username"
              type="text"
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
              placeholder="Email@gmail.com"
              type="email"
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
                placeholder="+995 599209820"
                type="text"
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
                placeholder="29"
                type="text"
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
              Drag and drop or{' '}
              <button className="auth-modal__switch-link" type="button">
                Upload file
              </button>
            </p>
            <p className="upload-box__hint">JPG, PNG or WebP</p>
          </div>
        </div>
      </div>

      <button className="auth-modal__submit" type="button">
        Update Profile
      </button>
    </ModalShell>
  )
}

export default ProfileModal
