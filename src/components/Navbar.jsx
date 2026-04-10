import { NavLink } from 'react-router-dom'

function Navbar({ onOpenEnrolled, onOpenLogin, onOpenSignup }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink className="site-header__brand" to="/">
          Bootcamp
        </NavLink>

        <nav className="site-header__nav">
          <NavLink
            className={({ isActive }) =>
              isActive ? 'site-link site-link--active' : 'site-link'
            }
            to="/"
          >
            Dashboard
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? 'site-link site-link--active' : 'site-link'
            }
            to="/browse"
          >
            Browse Courses
          </NavLink>
        </nav>

        <div className="site-header__actions">
          <button
            className="site-button site-button--ghost"
            onClick={onOpenEnrolled}
            type="button"
          >
            Enrolled Courses
          </button>
          <button
            className="site-button site-button--ghost"
            onClick={onOpenLogin}
            type="button"
          >
            Log In
          </button>
          <button
            className="site-button site-button--primary"
            onClick={onOpenSignup}
            type="button"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
