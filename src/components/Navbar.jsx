import { NavLink } from 'react-router-dom'

function Navbar() {
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
      </div>
    </header>
  )
}

export default Navbar
