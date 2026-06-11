import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import AdminSidebar from './components/AdminSidebar'
import AdminAuth from './pages/AdminAuth'
import AdminDashboard from './pages/AdminDashboard'
import OwnersApproval from './pages/OwnersApproval'
import CanteensList from './pages/CanteensList'
import InstitutionsPage from './pages/InstitutionsPage'
import './index.css'

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

function AdminRoutes() {
  const { isAuthenticated } = useAdminAuth()
  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AdminAuth />}
      />
      <Route path="/" element={
        <ProtectedLayout><AdminDashboard /></ProtectedLayout>
      } />
      <Route path="/institutions" element={
        <ProtectedLayout><InstitutionsPage /></ProtectedLayout>
      } />
      <Route path="/owners" element={
        <ProtectedLayout><OwnersApproval /></ProtectedLayout>
      } />
      <Route path="/canteens" element={
        <ProtectedLayout><CanteensList /></ProtectedLayout>
      } />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/auth'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181c',
              color: '#f4f4f5',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
          }}
        />
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
