import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import BrowsePage from '../routes/BrowsePage'
import CourseDetailPage from '../routes/CourseDetailPage'
import DashboardPage from '../routes/DashboardPage'

function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-shell">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route element={<DashboardPage />} path="/" />
          <Route element={<BrowsePage />} path="/browse" />
          <Route element={<CourseDetailPage />} path="/courses/:courseId" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
