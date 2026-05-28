import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectList from './pages/Projects/ProjectList'
import ProjectDetail from './pages/Projects/ProjectDetail'
import TaskList from './pages/Tasks/TaskList'
import AdminProjects from './pages/Admin/AdminProjects'
import UserManagement from './pages/Admin/UserManagement'
import AdminReports from './pages/Admin/AdminReports'
import InvitationManagement from './pages/Admin/InvitationManagement'

function AppLayout({ children, adminOnly = false }) {
  return (
    <ProtectedRoute adminOnly={adminOnly}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/projects" element={<AppLayout><ProjectList /></AppLayout>} />
        <Route path="/projects/:id" element={<AppLayout><ProjectDetail /></AppLayout>} />
        <Route path="/projects/:id/tasks" element={<AppLayout><TaskList /></AppLayout>} />

        {/* Admin Only */}
        <Route path="/admin/projects" element={<AppLayout adminOnly><AdminProjects /></AppLayout>} />
        <Route path="/admin/users" element={<AppLayout adminOnly><UserManagement /></AppLayout>} />
        <Route path="/admin/reports" element={<AppLayout adminOnly><AdminReports /></AppLayout>} />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

        {/* Invitation Management */}
        <Route path="/admin/invitations" element={<AppLayout adminOnly><InvitationManagement /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  )
}