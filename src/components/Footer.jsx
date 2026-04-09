import { NavLink } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">Redberry Bootcamp XI</div>
        <nav className="site-footer__nav">
          <NavLink className="site-link" to="/">
            Home
          </NavLink>
          <NavLink className="site-link" to="/browse">
            Browse
          </NavLink>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
