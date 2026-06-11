import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Clock } from 'lucide-react'
import './index.css'

export default function WelcomePending() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="welcomepending-root">
      <div className="welcomepending-glow" />

      <div className="welcomepending-card animate-fade-in">
        <div className="welcomepending-icon-wrap">⏳</div>

        <h1 className="welcomepending-title">
          Almost there,{' '}
          <span style={{ color: 'var(--purple)' }}>{user?.owner_profile?.name?.split(' ')[0] || 'Chef'}!</span>
        </h1>

        <p className="welcomepending-subtitle">
          Your canteen owner account has been registered successfully.
          An admin will review and approve your account shortly.
        </p>

        <div className="welcomepending-info-box">
          <div className="welcomepending-info-title">
            <Clock size={16} /> What happens next?
          </div>
          <ul className="welcomepending-info-steps">
            <li className="welcomepending-info-step">
              <span className="welcomepending-info-step-dot" />
              Admin reviews your registration details
            </li>
            <li className="welcomepending-info-step">
              <span className="welcomepending-info-step-dot" />
              Your account gets approved (usually within 24 hours)
            </li>
            <li className="welcomepending-info-step">
              <span className="welcomepending-info-step-dot" />
              Log back in to access your full owner dashboard
            </li>
            <li className="welcomepending-info-step">
              <span className="welcomepending-info-step-dot" />
              Set up your canteen and start managing orders!
            </li>
          </ul>
        </div>

        <div className="welcomepending-actions">
          <p className="text-sm text-muted">
            Registered as: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
          </p>
          <button
            id="pending-check-status"
            className="btn btn-secondary"
            onClick={() => {
              // Re-fetch user status by logging in again
              logout()
              navigate('/auth')
            }}
          >
            Check approval status
          </button>
          <button
            id="pending-logout"
            className="btn btn-ghost btn-sm text-muted"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
