import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import EnrolledCoursesSidebar from './modals/EnrolledCoursesSidebar'
import LoginModal from './modals/LoginModal'
import SignupModal from './modals/SignupModal'
import AppRouter from './routes/AppRouter'

function App() {
  const [activeOverlay, setActiveOverlay] = useState(null)

  function closeOverlay() {
    setActiveOverlay(null)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar
          onOpenEnrolled={() => setActiveOverlay('enrolled')}
          onOpenLogin={() => setActiveOverlay('login')}
          onOpenSignup={() => setActiveOverlay('signup')}
        />

        <main className="page-shell">
          <AppRouter />
        </main>

        <Footer />

        <LoginModal
          isOpen={activeOverlay === 'login'}
          onClose={closeOverlay}
          onSwitchToSignup={() => setActiveOverlay('signup')}
        />
        <SignupModal
          isOpen={activeOverlay === 'signup'}
          onClose={closeOverlay}
          onSwitchToLogin={() => setActiveOverlay('login')}
        />
        <EnrolledCoursesSidebar
          isOpen={activeOverlay === 'enrolled'}
          onClose={closeOverlay}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
