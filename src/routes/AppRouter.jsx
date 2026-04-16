import { Route, Routes } from 'react-router-dom'
import BrowsePage from './BrowsePage'
import CourseDetailPage from './CourseDetailPage'
import DashboardPage from './DashboardPage'
import EnrolledCoursesPage from './EnrolledCoursesPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<DashboardPage />} path="/" />
      <Route element={<BrowsePage />} path="/browse" />
      <Route element={<CourseDetailPage />} path="/courses/:courseId" />
      <Route element={<EnrolledCoursesPage />} path="/enrolled" />
    </Routes>
  )
}

export default AppRouter
