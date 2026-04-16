import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './AppContext'
import { getMe } from './api/auth.api'
import { clearToken, getToken, setToken } from './api/client'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import EnrolledCoursesSidebar from './modals/EnrolledCoursesSidebar'
import LoginModal from './modals/LoginModal'
import ProfileModal from './modals/ProfileModal'
import SignupModal from './modals/SignupModal'
import AppRouter from './routes/AppRouter'

function App() {
  const [activeOverlay, setActiveOverlay] = useState(null)
  const [authUser, setAuthUser] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function bootstrapAuth() {
      const token = getToken()

      if (!token) {
        if (isMounted) {
          setIsAuthReady(true)
        }

        return
      }

      try {
        const response = await getMe()

        if (!isMounted) {
          return
        }

        setAuthUser(response?.data ?? null)
      } catch {
        clearToken()

        if (isMounted) {
          setAuthUser(null)
        }
      } finally {
        if (isMounted) {
          setIsAuthReady(true)
        }
      }
    }

    bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [])

  function closeOverlay() {
    setActiveOverlay(null)
  }

  function handleAuthSuccess({ user, token }) {
    if (token) {
      setToken(token)
    }

    setAuthUser(user ?? null)
    setActiveOverlay(null)
  }

  function handleLogout() {
    clearToken()
    setAuthUser(null)
    setActiveOverlay(null)
  }

  function handleProfileUpdate(nextUser) {
    setAuthUser(nextUser)
  }

  const isAuthenticated = Boolean(authUser)

  const appContextValue = {
    authUser,
    isAuthReady,
    isAuthenticated,
    onAuthSuccess: handleAuthSuccess,
    onLogout: handleLogout,
    onProfileUpdate: handleProfileUpdate,
    openEnrolled: () => setActiveOverlay('enrolled'),
    openLogin: () => setActiveOverlay('login'),
    openSignup: () => setActiveOverlay('signup'),
    openProfile: () => setActiveOverlay('profile'),
  }

  return (
    <BrowserRouter>
      <AppProvider value={appContextValue}>
        <div className="app-shell">
          <Navbar
            onOpenEnrolled={() => setActiveOverlay('enrolled')}
            onOpenLogin={() => setActiveOverlay('login')}
            onOpenProfile={() => setActiveOverlay('profile')}
            onOpenSignup={() => setActiveOverlay('signup')}
          />

          <main className="page-shell">
            <AppRouter />
          </main>

          <Footer />

          <LoginModal
            isOpen={activeOverlay === 'login'}
            onClose={closeOverlay}
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setActiveOverlay('signup')}
          />
          <SignupModal
            isOpen={activeOverlay === 'signup'}
            onClose={closeOverlay}
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setActiveOverlay('login')}
          />
          <EnrolledCoursesSidebar
            isOpen={activeOverlay === 'enrolled'}
            onClose={closeOverlay}
          />
          <ProfileModal
            isOpen={activeOverlay === 'profile'}
            onClose={closeOverlay}
            onSuccess={handleProfileUpdate}
          />
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
