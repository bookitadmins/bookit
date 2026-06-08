import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ordersAPI } from '../../../services/api'
import { ArrowLeft, Clock, Send, ChefHat, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const TRANSITIONS = {
  pending:    ['preparing', 'cancelled'],
  preparing:  ['ready_in_5', 'cancelled'],
  ready_in_5: ['completed'],
  completed:  [],
  cancelled:  [],
}

const STATUS_LABELS = {
  pending: 'Pending', preparing: 'Preparing', ready_in_5: '🔔 Ready in 5 min', completed: 'Completed', cancelled: 'Cancelled',
}

export default function OrderFulfillment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [prepTime, setPrepTime] = useState(10)

  useEffect(() => {
    if (location.state?.order) setOrder(location.state.order)
  }, [location.state])

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      const payload = { status }
      if (status === 'preparing') payload.estimated_prep_time = prepTime
      const res = await ordersAPI.updateStatus(id, payload)
      setOrder(res.data)
      const msgs = {
        preparing: `✅ Accepted! Customer notified (${prepTime} min)`,
        ready_in_5: '🔔 5-minute alert sent to customer!',
        completed: '✅ Order marked complete',
        cancelled: 'Order cancelled',
      }
      toast.success(msgs[status] || 'Updated')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    }
    setUpdating(false)
  }


  if (!order && !loading) {
    return (
      <div className="page"><div className="container">
        <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate('/owner')}><ArrowLeft size={16} /> Back</button>
        <div className="empty-state">
          <h3>Order not found</h3>
          <button className="btn btn-primary" onClick={() => navigate('/owner')}>Back to Dashboard</button>
        </div>
      </div></div>
    )
  }

  const nextStatuses = order ? TRANSITIONS[order.status] || [] : []

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <button className="btn btn-ghost btn-sm mb-4 animate-fade-in" onClick={() => navigate('/owner')}><ArrowLeft size={16} /> Dashboard</button>

        {order && (
          <>
            <div className="card animate-fade-in mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2>Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                  <p className="text-sm text-muted">{new Date(order.created_at).toLocaleString('en-IN')}</p>
                </div>
                <span className={`badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
              </div>

              <div className="divider" />

              <div style={{ marginBottom: '1rem' }}>
                <h4 className="text-sm font-semibold text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</h4>
                <p className="font-semibold">{order.user?.name || 'Customer'}</p>
                <p className="text-sm text-muted">{order.user?.phone}</p>
              </div>

              <div className="divider" />

              <div style={{ marginBottom: '1rem' }}>
                <h4 className="text-sm font-semibold text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</h4>
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-accent">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <>
                  <div className="divider" />
                  <p className="text-sm text-secondary">📝 {order.notes}</p>
                </>
              )}

              <div className="divider" />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="price" style={{ fontSize: '1.3rem' }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Action center */}
            {nextStatuses.length > 0 && (
              <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="mb-4">Order Actions</h3>

                {nextStatuses.includes('preparing') && (
                  <div className="form-group mb-4">
                    <label className="form-label">Estimated Prep Time</label>
                    <div className="flex items-center gap-3">
                      <input
                        id="prep-time-input"
                        type="range"
                        min={5} max={60} step={5}
                        value={prepTime}
                        onChange={e => setPrepTime(Number(e.target.value))}
                        style={{ flex: 1, accentColor: 'var(--amber-400)' }}
                      />
                      <span className="badge badge-amber" style={{ minWidth: 60, justifyContent: 'center' }}>
                        <Clock size={12} /> {prepTime} min
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex-col gap-3" style={{ display: 'flex' }}>
                  {nextStatuses.map(status => {
                    const configs = {
                      preparing:  { label: `✅ Accept & Start Cooking (${prepTime} min)`, cls: 'btn-primary', icon: ChefHat },
                      ready_in_5: { label: '🔔 Send 5-Minute Ready Notice', cls: 'btn-primary', icon: Send },
                      completed:  { label: '✅ Mark as Completed', cls: 'btn-secondary', icon: CheckCircle },
                      cancelled:  { label: '❌ Cancel Order', cls: 'btn-danger', icon: XCircle },
                    }
                    const cfg = configs[status]
                    if (!cfg) return null
                    return (
                      <button
                        key={status}
                        id={`action-${status}`}
                        className={`btn ${cfg.cls} btn-lg`}
                        onClick={() => updateStatus(status)}
                        disabled={updating}
                      >
                        {updating ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {nextStatuses.length === 0 && (
              <div className="alert alert-success animate-fade-in">
                Order is {STATUS_LABELS[order.status].toLowerCase()}. No further actions needed.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
