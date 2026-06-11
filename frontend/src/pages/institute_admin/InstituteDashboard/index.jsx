import { useState, useEffect } from 'react'
import { instituteAdminAPI } from '../../../services/api'
import { useAuth } from '../../../contexts/AuthContext'
import { Users, Store, ShoppingBag, Clock, RefreshCw } from 'lucide-react'
import './index.css'

export default function InstituteDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { 
      const res = await instituteAdminAPI.stats()
      setStats(res.data) 
    } catch (err) {
      console.error('Failed to load stats', err)
    }
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
            <h1>Institute <span className="gradient-text">Dashboard</span></h1>
            <p className="text-secondary">Overview of {user?.admin_profile?.name}'s institution</p>
          </div>
          <button id="refresh-stats" className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing…' : 'Refresh Stats'}
          </button>
        </div>

        <div className="admindashboard-grid">
          {loading && !stats ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="skeleton stat-card-skeleton" />)
          ) : statCards.map((card) => (
            <div key={card.label} className={`stat-card ${card.alert ? 'stat-card--alert' : ''}`} style={{ background: card.gradient }}>
              <div className="stat-card-icon" style={{ color: card.color }}>
                <card.icon size={24} />
              </div>
              <div className="stat-card-info">
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {stats?.pending_owners > 0 && (
          <div className="alert alert-warning animate-fade-in mt-6">
            <Clock size={18} />
            There are {stats.pending_owners} canteen owner{stats.pending_owners > 1 ? 's' : ''} waiting for approval.{' '}
            <a href="/admin/owners" style={{ color: 'var(--purple)', fontWeight: 600 }}>Review now →</a>
          </div>
        )}
      </div>
    </div>
  )
}
