import { useState, useEffect, useCallback } from 'react'
import { canteensAPI, ordersAPI } from '../../../services/api'
import { useAuth } from '../../../contexts/AuthContext'
import { useWebSocket } from '../../../contexts/WebSocketContext'
import { Bell, Clock, Package, RefreshCw, ChevronRight, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:    'status-pending',
  preparing:  'status-preparing',
  ready_in_5: 'status-ready_in_5',
  completed:  'status-completed',
  cancelled:  'status-cancelled',
}

const STATUS_LABELS = {
  pending: 'Pending', preparing: 'Preparing', ready_in_5: 'Ready in 5', completed: 'Done', cancelled: 'Cancelled',
}

export default function OwnerDashboard() {
  const { user } = useAuth()
  const ws = useWebSocket()
  const navigate = useNavigate()
  const [canteen, setCanteen] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  const loadData = useCallback(async () => {
    try {
      const canteenRes = await canteensAPI.list()
      const mine = canteenRes.data.find(c => c.owner_id === user.id)
      if (mine) {
        setCanteen(mine)
        const ordRes = await ordersAPI.canteenOrders(mine.id)
        setOrders(ordRes.data)
      }
    } catch {}
    setLoading(false)
  }, [user.id])

  useEffect(() => { loadData() }, [loadData])

  // Auto-refresh when WS notification comes in
  useEffect(() => {
    if (ws?.notifications?.length > 0) loadData()
  }, [ws?.notifications?.length])

  const active = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const past = orders.filter(o => ['completed', 'cancelled'].includes(o.status))
  const shown = tab === 'active' ? active : past

  if (loading) return <div className="page"><div className="container"><div className="empty-state"><span className="spinner spinner-lg" /></div></div></div>

  if (!canteen) return (
    <div className="page"><div className="container">
      <div className="empty-state">
        <Store size={56} />
        <h3>No canteen yet</h3>
        <p>Go to Menu Editor to set up your canteen</p>
        <button className="btn btn-primary" onClick={() => navigate('/owner/menu')}>Set Up Canteen</button>
      </div>
    </div></div>
  )

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="owner-header animate-fade-in">
          <div>
            <h1>📊 Dashboard</h1>
            <p className="text-secondary">{canteen.name}</p>
          </div>
          <div className="flex gap-3">
            <button id="refresh-dashboard" className="btn btn-secondary btn-sm" onClick={loadData}><RefreshCw size={14} /></button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/owner/menu')}>Menu Editor</button>
          </div>
        </div>

        {/* Stats */}
        <div className="owner-stats animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { label: 'Active Orders', value: active.length, color: 'var(--amber-400)' },
            { label: 'Completed Today', value: past.filter(o => o.status === 'completed').length, color: 'var(--green)' },
            { label: 'Rating', value: parseFloat(canteen.rating).toFixed(1), color: 'var(--blue)' },
            { label: 'Total Orders', value: orders.length, color: 'var(--purple)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        {ws?.connected && (
          <div className="alert alert-info flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <span className="ws-dot connected" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', display: 'inline-block' }} />
            Live updates active — new orders will appear instantly
          </div>
        )}

        {/* Orders tabs */}
        <div className="tabs mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button id="tab-active-orders" className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
            Active {active.length > 0 && <span className="badge badge-amber" style={{ marginLeft: 4, padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>{active.length}</span>}
          </button>
          <button id="tab-past-orders" className={`tab-btn ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Past Orders</button>
        </div>

        {shown.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>{tab === 'active' ? 'No active orders' : 'No past orders'}</h3>
            <p>{tab === 'active' ? 'New orders will appear here instantly' : ''}</p>
          </div>
        ) : (
          <div className="orders-grid animate-fade-in" style={{ animationDelay: '0.25s' }}>
            {shown.map(order => (
              <div
                key={order.id}
                id={`order-${order.id.slice(0,8)}`}
                className={`owner-order-card ${order.status === 'pending' ? 'owner-order-new' : ''}`}
                onClick={() => navigate(`/owner/order/${order.id}`, { state: { order } })}
              >
                {order.status === 'pending' && <div className="new-order-badge">NEW</div>}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h4>{order.user?.name || 'Customer'}</h4>
                    <p className="text-xs text-muted">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                </div>

                <div className="flex-col gap-1" style={{ display: 'flex', marginBottom: '0.75rem' }}>
                  {order.items?.map(item => (
                    <span key={item.id} className="text-sm text-secondary">{item.name} × {item.quantity}</span>
                  ))}
                </div>

                <div className="flex justify-between items-center" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <span className="price">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                  <span className="flex items-center gap-1 text-muted text-sm">Manage <ChevronRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .owner-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; }
        .owner-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; text-align: center; }
        .stat-value { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 0.3rem; }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
        .owner-order-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; cursor: pointer; transition: all var(--transition); position: relative; overflow: hidden; }
        .owner-order-card:hover { border-color: rgba(251,191,36,0.3); transform: translateY(-2px); box-shadow: var(--shadow-card); }
        .owner-order-new { border-color: rgba(251,191,36,0.4); animation: pulse-glow 2s ease-in-out infinite; }
        .new-order-badge { position: absolute; top: 0; right: 0; background: var(--grad-amber); color: #0d0d0f; font-size: 0.65rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 0 var(--radius-lg) 0 var(--radius-sm); }
        @media (max-width: 700px) { .owner-stats { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  )
}
