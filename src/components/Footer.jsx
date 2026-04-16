import { NavLink } from 'react-router-dom'
import rocketLogo from '../assets/rocket-logo.png'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <section className="site-footer__brand-block">
            <div className="site-footer__brand-line">
              <span className="site-footer__brand-mark">
                <img alt="" className="site-footer__brand-icon" src={rocketLogo} />
              </span>
              <span className="site-footer__brand-name">Bootcamp</span>
            </div>
            <p className="site-footer__description">
              Your learning journey starts here! Browse courses to get started.
            </p>
            <div className="site-footer__socials">
              <a className="site-footer__social" href="/" onClick={(event) => event.preventDefault()}>
                f
              </a>
              <a className="site-footer__social" href="/" onClick={(event) => event.preventDefault()}>
                t
              </a>
              <a className="site-footer__social" href="/" onClick={(event) => event.preventDefault()}>
                ig
              </a>
              <a className="site-footer__social" href="/" onClick={(event) => event.preventDefault()}>
                in
              </a>
            </div>
          </section>

          <div className="site-footer__links">
            <section className="site-footer__column">
              <h3 className="site-footer__heading">Explore</h3>
              <nav className="site-footer__nav">
                <NavLink className="site-footer__link" to="/">
                  Enrolled Courses
                </NavLink>
                <NavLink className="site-footer__link" to="/browse">
                  Browse Courses
                </NavLink>
              </nav>
            </section>

            <section className="site-footer__column">
              <h3 className="site-footer__heading">Account</h3>
              <nav className="site-footer__nav">
                <NavLink className="site-footer__link" to="/">
                  My Profile
                </NavLink>
              </nav>
            </section>

            <section className="site-footer__column">
              <h3 className="site-footer__heading">Contact</h3>
              <div className="site-footer__contact-list">
                <p className="site-footer__contact-item">contact@company.com</p>
                <p className="site-footer__contact-item">(+995) 555 111 222</p>
                <p className="site-footer__contact-item">Aghmashenebeli St.115</p>
              </div>
            </section>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copyright">
            Copyright © 2026 Redberry International
          </p>
          <div className="site-footer__legal">
            <a href="/" onClick={(event) => event.preventDefault()}>
              Terms and Conditions
            </a>
            <a href="/" onClick={(event) => event.preventDefault()}>
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
