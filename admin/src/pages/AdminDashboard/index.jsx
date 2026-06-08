import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { Users, Store, ShoppingBag, Clock, TrendingUp, RefreshCw } from 'lucide-react'
import './index.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { const res = await adminAPI.stats(); setStats(res.data) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: 'var(--purple)', gradient: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.05))' },
    { label: 'Students', value: stats.total_students, icon: Users, color: 'var(--blue)', gradient: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(59,130,246,0.05))' },
    { label: 'Approved Owners', value: stats.approved_owners, icon: Store, color: 'var(--green)', gradient: 'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(34,197,94,0.05))' },
    { label: 'Pending Approval', value: stats.pending_owners, icon: Clock, color: 'var(--amber)', gradient: 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(251,191,36,0.05))', alert: stats.pending_owners > 0 },
    { label: 'Total Canteens', value: stats.total_canteens, icon: Store, color: 'var(--purple)', gradient: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(168,85,247,0.04))' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, color: 'var(--blue)', gradient: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(59,130,246,0.04))' },
  ] : []

  return (
    <div className="page">
      <div className="container">
        <div className="admindashboard-header animate-fade-in">
          <div>
            <h1>Platform <span className="gradient-text">Overview</span></h1>
            <p className="text-secondary">Real-time statistics for the Book It platform</p>
          </div>
          <button id="refresh-stats" className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="admindashboard-stats-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton admindashboard-stat-skeleton" />
            ))}
          </div>
        ) : (
          <div className="admindashboard-stats-grid animate-fade-in">
            {statCards.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className={`admindashboard-stat-card ${s.alert ? 'admindashboard-stat-card--alert' : ''}`}
                  style={{ background: s.gradient }}
                >
                  <div className="admindashboard-stat-top">
                    <span className="admindashboard-stat-label">{s.label}</span>
                    <div className="admindashboard-stat-icon" style={{ color: s.color }}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="admindashboard-stat-value" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  {s.alert && (
                    <span className="badge badge-amber admindashboard-stat-badge">
                      Needs attention
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {stats?.pending_owners > 0 && (
          <div className="alert alert-info animate-fade-in mt-4">
            ⚠️ <strong>{stats.pending_owners}</strong> canteen owner{stats.pending_owners > 1 ? 's' : ''} waiting for approval.{' '}
            <a href="/owners" style={{ color: 'var(--purple)', fontWeight: 600 }}>Review now →</a>
          </div>
        )}
      </div>
    </div>
  )
}
