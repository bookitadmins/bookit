import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import Navbar from './components/Navbar'

// Pages — folder structure
import AuthPage from './pages/AuthPage'
import WelcomeStudent from './pages/WelcomeStudent'
import WelcomeOwner from './pages/WelcomeOwner'
import WelcomePending from './pages/WelcomePending'
import StudentDashboard from './pages/student/Dashboard'
import PriceComparison from './pages/student/PriceComparison'
import CanteenDetail from './pages/student/CanteenDetail'
import OrderHistory from './pages/student/OrderHistory'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import OrderFulfillment from './pages/owner/OrderFulfillment'
import MenuEditor from './pages/owner/MenuEditor'
import InstituteDashboard from './pages/institute_admin/InstituteDashboard'
import OwnersApproval from './pages/institute_admin/OwnersApproval'

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isOwner, isStudent, isInstituteAdmin, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  if (role === 'owner') {
    if (!isOwner) return <Navigate to="/" replace />
    if (!user?.is_approved) return <Navigate to="/welcome/pending" replace />
  }
  if (role === 'student' && !isStudent) {
    if (isOwner) return <Navigate to="/owner" replace />
    if (isInstituteAdmin) return <Navigate to="/admin" replace />
    return <Navigate to="/auth" replace />
  }
  if (role === 'admin' && !isInstituteAdmin) {
    if (isStudent) return <Navigate to="/" replace />
    if (isOwner) return <Navigate to="/owner" replace />
    return <Navigate to="/auth" replace />
  }
  return children
}

function AppRoutes() {
  const { isAuthenticated, isOwner, user } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        {/* Auth */}
        <Route
          path="/auth"
          element={
            isAuthenticated
              ? <Navigate to={isOwner ? '/owner' : (isInstituteAdmin ? '/admin' : '/')} replace />
              : <AuthPage />
          }
        />

        {/* Welcome pages — no Navbar needed for these but we keep it for consistency */}
        <Route path="/welcome/student" element={
          isAuthenticated ? <WelcomeStudent /> : <Navigate to="/auth" replace />
        } />
        <Route path="/welcome/owner" element={
          isAuthenticated ? <WelcomeOwner /> : <Navigate to="/auth" replace />
        } />
        <Route path="/welcome/pending" element={
          isAuthenticated ? <WelcomePending /> : <Navigate to="/auth" replace />
        } />

        {/* Student routes */}
        <Route path="/" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute role="student"><PriceComparison /></ProtectedRoute>} />
        <Route path="/canteen/:id" element={<ProtectedRoute role="student"><CanteenDetail /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="student"><OrderHistory /></ProtectedRoute>} />

        {/* Owner routes */}
        <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/order/:id" element={<ProtectedRoute role="owner"><OrderFulfillment /></ProtectedRoute>} />
        <Route path="/owner/menu" element={<ProtectedRoute role="owner"><MenuEditor /></ProtectedRoute>} />

        {/* Institute Admin routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><InstituteDashboard /></ProtectedRoute>} />
        <Route path="/admin/owners" element={<ProtectedRoute role="admin"><OwnersApproval /></ProtectedRoute>} />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? (isOwner
                      ? (user?.is_approved ? '/owner' : '/welcome/pending')
                      : (isInstituteAdmin ? '/admin' : '/'))
                  : '/auth'
              }
              replace
            />
          }
        />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
              },
            }}
          />
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
