import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useWebSocket } from '../../contexts/WebSocketContext'
import { Bell, LogOut, ChefHat } from 'lucide-react'
import { useState } from 'react'
import './index.css'

export default function Navbar() {
  const { user, logout, isOwner, isInstituteAdmin } = useAuth()
  const ws = useWebSocket()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const unreadCount = ws?.notifications?.length || 0

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <nav className="navbar-root">
      <div className="navbar-inner container">

        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <ChefHat size={22} />
          </div>
          <span>Book<span className="gradient-text">It</span></span>
        </Link>

        {/* Nav links */}
        {user && (
          <div className="navbar-links">
            {isOwner ? (
              <>
                <Link to="/owner" className={`navbar-nav-link ${isActive('/owner')}`}>Dashboard</Link>
                <Link to="/owner/menu" className={`navbar-nav-link ${isActive('/owner/menu')}`}>Menu Editor</Link>
              </>
            ) : isInstituteAdmin ? (
              <>
                <Link to="/admin" className={`navbar-nav-link ${isActive('/admin')}`}>Dashboard</Link>
                <Link to="/admin/owners" className={`navbar-nav-link ${isActive('/admin/owners')}`}>Approvals</Link>
              </>
            ) : (
              <>
                <Link to="/" className={`navbar-nav-link ${isActive('/')}`}>Canteens</Link>
                <Link to="/search" className={`navbar-nav-link ${isActive('/search')}`}>Price Finder</Link>
                <Link to="/orders" className={`navbar-nav-link ${isActive('/orders')}`}>My Orders</Link>
              </>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <>
              <button
                className="btn btn-icon btn-ghost navbar-bell-btn"
                onClick={() => navigate(isOwner ? '/owner' : '/orders')}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="navbar-bell-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <span
                className={`navbar-ws-dot ${ws?.connected ? 'connected' : 'disconnected'}`}
                title={ws?.connected ? 'Live' : 'Reconnecting…'}
              />

              <div className="navbar-user-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="navbar-user-avatar">
                  {(user.student_profile?.name || user.owner_profile?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">
                    {(user.student_profile?.name || user.owner_profile?.name || user.admin_profile?.name || 'User').split(' ')[0]}
                  </span>
                  <span className={`badge ${isOwner ? 'badge-amber' : (isInstituteAdmin ? 'badge-purple' : 'badge-blue')}`}
                    style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                    {isOwner ? 'Owner' : (isInstituteAdmin ? 'Admin' : 'Student')}
                  </span>
                </div>

                {menuOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-item text-muted text-sm">{user.email}</div>
                    <div className="divider" style={{ margin: '0.5rem 0' }} />
                    <button className="navbar-dropdown-item" onClick={handleLogout}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
