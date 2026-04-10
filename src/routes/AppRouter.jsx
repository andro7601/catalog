import { Route, Routes } from 'react-router-dom'
import BrowsePage from './BrowsePage'
import CourseDetailPage from './CourseDetailPage'
import DashboardPage from './DashboardPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<DashboardPage />} path="/" />
      <Route element={<BrowsePage />} path="/browse" />
      <Route element={<CourseDetailPage />} path="/courses/:courseId" />
    </Routes>
  )
}

export default AppRouter
