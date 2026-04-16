import { NavLink } from 'react-router-dom'
import { useAppContext } from '../AppContext'
import rocketLogo from '../assets/rocket-logo.png'

function Navbar({ onOpenEnrolled, onOpenLogin, onOpenProfile, onOpenSignup }) {
  const { authUser, isAuthenticated } = useAppContext()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink aria-label="Go to dashboard" className="site-header__brand" to="/">
          <span className="site-header__brand-mark">
            <img alt="" className="site-header__brand-icon" src={rocketLogo} />
          </span>
        </NavLink>

        <div className="site-header__right">
          <nav className="site-header__nav">
            {isAuthenticated ? (
              <>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? 'site-link site-link--active' : 'site-link'
                  }
                  to="/browse"
                >
                  <span className="site-link__content">
                    <span aria-hidden="true" className="site-link__icon">
                      <svg
                        className="site-link__svg"
                        fill="none"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 1.5L5.6 4.4L8.5 5L5.6 5.6L5 8.5L4.4 5.6L1.5 5L4.4 4.4L5 1.5Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M11.6 7.5L12 9L13.5 9.4L12 9.8L11.6 11.3L11.2 9.8L9.7 9.4L11.2 9L11.6 7.5Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.1"
                        />
                      </svg>
                    </span>
                    <span>Browse Courses</span>
                  </span>
                </NavLink>

                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? 'site-button site-button--header-link site-link--active'
                      : 'site-button site-button--header-link'
                  }
                  to="/enrolled"
                >
                  <span className="site-link__content">
                    <span aria-hidden="true" className="site-link__icon">
                      <svg
                        className="site-link__svg"
                        fill="none"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.25 3.5C2.25 2.95 2.7 2.5 3.25 2.5H7.25C7.92 2.5 8.47 3.05 8.47 3.72V12.9C8.47 12.53 8.17 12.23 7.8 12.23H3.25C2.7 12.23 2.25 11.78 2.25 11.23V3.5Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M8.47 3.72C8.47 3.05 9.01 2.5 9.69 2.5H12.75C13.3 2.5 13.75 2.95 13.75 3.5V11.23C13.75 11.78 13.3 12.23 12.75 12.23H9.14C8.77 12.23 8.47 12.53 8.47 12.9V3.72Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </span>
                    <span>Enrolled Courses</span>
                  </span>
                </NavLink>
              </>
            ) : (
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'site-link site-link--active' : 'site-link'
                }
                to="/browse"
              >
                <span className="site-link__content">
                  <span aria-hidden="true" className="site-link__icon">
                    <svg
                      className="site-link__svg"
                      fill="none"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 1.5L5.6 4.4L8.5 5L5.6 5.6L5 8.5L4.4 5.6L1.5 5L4.4 4.4L5 1.5Z"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M11.6 7.5L12 9L13.5 9.4L12 9.8L11.6 11.3L11.2 9.8L9.7 9.4L11.2 9L11.6 7.5Z"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.1"
                      />
                    </svg>
                  </span>
                  <span>Browse Courses</span>
                </span>
              </NavLink>
            )}
          </nav>

          {isAuthenticated ? (
            <div className="site-header__actions">
              <button className="site-header__profile" onClick={onOpenProfile} type="button">
                <span className="site-header__profile-ring" />
                {authUser?.avatar ? (
                  <img
                    alt=""
                    className="site-header__profile-avatar"
                    src={authUser.avatar}
                  />
                ) : null}
                <span className="site-header__profile-status" />
              </button>
            </div>
          ) : (
            <div className="site-header__actions">
              <button
                className="site-button site-button--header-outline"
                onClick={onOpenLogin}
                type="button"
              >
                Log In
              </button>
              <button
                className="site-button site-button--header-primary"
                onClick={onOpenSignup}
                type="button"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
