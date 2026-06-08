import { useState, useEffect } from 'react'
import { ordersAPI } from '../../../services/api'
import { Clock, Package, ChefHat, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_INFO = {
  pending:    { label: 'Pending',       icon: Clock,        cls: 'status-pending' },
  preparing:  { label: 'Preparing',     icon: ChefHat,      cls: 'status-preparing' },
  ready_in_5: { label: 'Ready in 5 min!', icon: Package,    cls: 'status-ready_in_5' },
  completed:  { label: 'Completed',     icon: CheckCircle,  cls: 'status-completed' },
  cancelled:  { label: 'Cancelled',     icon: XCircle,      cls: 'status-cancelled' },
}

function OrderCard({ order }) {
  const info = STATUS_INFO[order.status] || STATUS_INFO.pending
  const Icon = info.icon

  return (
    <div className={`order-card ${order.status === 'ready_in_5' ? 'order-card-ready' : ''}`}>
      <div className="order-card-header">
        <div>
          <h4>{order.canteen?.name || 'Canteen'}</h4>
          <p className="text-sm text-muted">{new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <span className={`badge ${info.cls}`}>
          <Icon size={12} />
          {info.label}
        </span>
      </div>

      <div className="order-items-list">
        {order.items?.map(item => (
          <div key={item.id} className="order-item-row">
            <span>{item.name} × {item.quantity}</span>
            <span className="text-accent font-semibold">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <p className="text-sm text-muted" style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
          📝 {order.notes}
        </p>
      )}

      <div className="order-card-footer">
        {order.estimated_prep_time && (
          <span className="text-sm text-secondary">
            <Clock size={12} style={{ display: 'inline' }} /> Est. {order.estimated_prep_time} min
          </span>
        )}
        <span className="price" style={{ marginLeft: 'auto' }}>
          {parseFloat(order.total_amount).toFixed(2)}
        </span>
      </div>

      <style>{`
        .order-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; transition: all var(--transition); }
        .order-card-ready { border-color: rgba(168,85,247,0.4); box-shadow: 0 0 24px rgba(168,85,247,0.1); animation: pulse-glow 2s ease-in-out infinite; }
        .order-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .order-card-header h4 { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
        .order-items-list { display: flex; flex-direction: column; gap: 0.375rem; }
        .order-item-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-secondary); }
        .order-card-footer { display: flex; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--border); }
      `}</style>
    </div>
  )
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  const load = async () => {
    setLoading(true)
    try { const res = await ordersAPI.myOrders(); setOrders(res.data) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const active = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const past = orders.filter(o => ['completed', 'cancelled'].includes(o.status))
  const shown = tab === 'active' ? active : past

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="flex justify-between items-center mb-6 animate-fade-in">
          <h1>My Orders</h1>
          <button id="refresh-orders" className="btn btn-ghost btn-sm" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="tabs mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <button id="tab-active" className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
            Active {active.length > 0 && <span className="badge badge-amber" style={{ marginLeft: 4, padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>{active.length}</span>}
          </button>
          <button id="tab-history" className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
            History
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner spinner-lg" /></div>
        ) : shown.length === 0 ? (
          <div className="empty-state">
            <Package size={56} />
            <h3>{tab === 'active' ? 'No active orders' : 'No order history'}</h3>
            <p>{tab === 'active' ? 'Place an order to see it here' : 'Completed orders will appear here'}</p>
            {tab === 'active' && <Link to="/" className="btn btn-primary">Browse Canteens</Link>}
          </div>
        ) : (
          <div className="flex-col gap-4 animate-fade-in" style={{ display: 'flex' }}>
            {shown.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  )
}
