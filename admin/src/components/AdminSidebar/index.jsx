import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import {
  LayoutDashboard, Users, Store, LogOut, Shield, ChevronRight
} from 'lucide-react'
import './index.css'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/owners', icon: Users, label: 'Owner Approvals' },
  { to: '/canteens', icon: Store, label: 'Canteens' },
]

export default function AdminSidebar() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <aside className="adminsidebar-root">
      {/* Brand */}
      <div className="adminsidebar-brand">
        <div className="adminsidebar-brand-icon">
          <Shield size={20} />
        </div>
        <div>
          <div className="adminsidebar-brand-title">Book<span style={{ color: 'var(--purple-400)' }}>It</span></div>
          <div className="adminsidebar-brand-sub">Admin Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="adminsidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            id={`nav-${label.toLowerCase().replace(/ /g, '-')}`}
            className={({ isActive }) =>
              `adminsidebar-nav-item ${isActive ? 'adminsidebar-nav-item--active' : ''}`
            }
          >
            <Icon size={18} className="adminsidebar-nav-icon" />
            <span className="adminsidebar-nav-label">{label}</span>
            <ChevronRight size={14} className="adminsidebar-nav-chevron" />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="adminsidebar-footer">
        <div className="adminsidebar-user">
          <div className="adminsidebar-user-avatar">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="adminsidebar-user-info">
            <div className="adminsidebar-user-name">{user?.name || 'Admin'}</div>
            <div className="adminsidebar-user-email">{user?.email}</div>
          </div>
        </div>
        <button id="admin-logout" className="btn btn-ghost btn-sm adminsidebar-logout" onClick={handleLogout}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}
