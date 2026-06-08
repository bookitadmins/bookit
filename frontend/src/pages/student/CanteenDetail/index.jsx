import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { canteensAPI, menuAPI, ordersAPI } from '../../../services/api'
import StarRating from '../../../components/StarRating'
import { ArrowLeft, Plus, Minus, ShoppingBag, X, ChefHat, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CanteenDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [canteen, setCanteen] = useState(null)
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState({}) // { itemId: qty }
  const [showModal, setShowModal] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cRes, mRes] = await Promise.all([canteensAPI.get(id), menuAPI.getMenu(id)])
      setCanteen(cRes.data)
      setMenu(mRes.data)
    } catch { navigate('/') }
    setLoading(false)
  }

  const addToCart = (itemId) => setCart(c => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }))
  const removeFromCart = (itemId) => setCart(c => {
    const qty = (c[itemId] || 0) - 1
    if (qty <= 0) { const n = { ...c }; delete n[itemId]; return n }
    return { ...c, [itemId]: qty }
  })

  const cartItems = menu.filter(m => cart[m.id])
  const cartTotal = cartItems.reduce((sum, m) => sum + parseFloat(m.price) * cart[m.id], 0)
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0)

  const categories = [...new Set(menu.map(m => m.category || 'General'))]

  const handleOrder = async () => {
    if (cartItems.length === 0) return
    setOrdering(true)
    try {
      await ordersAPI.create({
        canteen_id: id,
        items: cartItems.map(m => ({ menu_item_id: m.id, quantity: cart[m.id] })),
        notes,
      })
      toast.success('Order placed! Waiting for canteen to confirm.')
      setCart({})
      setShowModal(false)
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed')
    }
    setOrdering(false)
  }

  if (loading) return (
    <div className="page"><div className="container"><div className="empty-state"><span className="spinner spinner-lg" /></div></div></div>
  )
  if (!canteen) return null

  return (
    <div className="page">
      <div className="container">
        {/* Back */}
        <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Canteen header */}
        <div className="canteen-detail-header animate-fade-in">
          <div className="canteen-banner">
            {canteen.image_url ? (
              <img src={canteen.image_url} alt={canteen.name} />
            ) : (
              <div className="img-placeholder" style={{ height: '100%' }}>
                <ChefHat size={48} />
              </div>
            )}
            <div className="canteen-banner-overlay" />
          </div>
          <div className="canteen-detail-info">
            <div className="flex items-center gap-3 flex-wrap">
              <h1>{canteen.name}</h1>
              <span className={`badge ${canteen.is_open ? 'badge-green' : 'badge-red'}`}>
                {canteen.is_open ? '● Open' : '● Closed'}
              </span>
            </div>
            {canteen.description && <p>{canteen.description}</p>}
            <div className="flex items-center gap-3">
              <StarRating rating={parseFloat(canteen.rating)} size="md" />
              <span className="text-accent font-semibold">{parseFloat(canteen.rating).toFixed(1)}</span>
              <span className="text-muted text-sm">by {canteen.owner?.name}</span>
            </div>
          </div>
        </div>

        {/* Menu by category */}
        <div className="canteen-detail-body">
          <div className="menu-section animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Menu</h2>
            {categories.map(cat => (
              <div key={cat} className="menu-category">
                <h3 className="menu-cat-title">{cat}</h3>
                <div className="menu-items">
                  {menu.filter(m => (m.category || 'General') === cat).map(item => (
                    <div key={item.id} className={`menu-item-card ${!item.is_available ? 'unavailable' : ''}`}>
                      <div className="menu-item-left">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="menu-item-img" />
                        ) : (
                          <div className="menu-item-img img-placeholder"><span>🍽️</span></div>
                        )}
                        <div className="menu-item-info">
                          <div className="flex items-center gap-2">
                            <h4>{item.name}</h4>
                            {!item.is_available && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>Unavailable</span>}
                          </div>
                          {item.description && <p className="text-sm text-muted">{item.description}</p>}
                          <span className="price">{parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                      {item.is_available && (
                        <div className="menu-item-actions">
                          {cart[item.id] ? (
                            <div className="qty-control">
                              <button id={`remove-${item.id}`} className="btn btn-icon btn-secondary btn-sm" onClick={() => removeFromCart(item.id)}><Minus size={12} /></button>
                              <span className="qty-val">{cart[item.id]}</span>
                              <button id={`add-${item.id}`} className="btn btn-icon btn-primary btn-sm" onClick={() => addToCart(item.id)}><Plus size={12} /></button>
                            </div>
                          ) : (
                            <button id={`add-first-${item.id}`} className="btn btn-secondary btn-sm" onClick={() => addToCart(item.id)}>
                              <Plus size={14} /> Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Floating cart button */}
          {cartCount > 0 && (
            <button id="view-cart-btn" className="btn btn-primary floating-cart animate-slide-up" onClick={() => setShowModal(true)}>
              <ShoppingBag size={18} />
              <span>View Cart</span>
              <span className="cart-count-badge">{cartCount}</span>
              <span style={{ marginLeft: 'auto' }}>₹{cartTotal.toFixed(2)}</span>
            </button>
          )}
        </div>

        {/* Order modal */}
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal-box">
              <div className="flex justify-between items-center mb-4">
                <h3>Order Summary</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
              </div>

              <div className="flex-col gap-3" style={{ display: 'flex', marginBottom: '1rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted text-sm"> × {cart[item.id]}</span>
                    </div>
                    <span className="price">
                      {(parseFloat(item.price) * cart[item.id]).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="price" style={{ fontSize: '1.3rem' }}>{cartTotal.toFixed(2)}</span>
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Special instructions (optional)</label>
                <textarea className="form-input" rows={2} placeholder="Extra spicy, no onion…" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <button id="confirm-order-btn" className="btn btn-primary btn-lg w-full" onClick={handleOrder} disabled={ordering}>
                {ordering ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Placing order…</> : `Pre-Book — ₹${cartTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .canteen-detail-header { margin-bottom: 2rem; }
        .canteen-banner { height: 240px; border-radius: var(--radius-lg); overflow: hidden; position: relative; margin-bottom: 1.25rem; background: var(--bg-elevated); }
        .canteen-banner img { width: 100%; height: 100%; object-fit: cover; }
        .canteen-banner-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%); }
        .canteen-detail-info { display: flex; flex-direction: column; gap: 0.625rem; }
        .canteen-detail-info h1 { font-size: 2rem; }
        .menu-category { margin-bottom: 2rem; }
        .menu-cat-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--amber-400); margin-bottom: 0.875rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
        .menu-items { display: flex; flex-direction: column; gap: 0.75rem; }
        .menu-item-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); transition: all var(--transition); }
        .menu-item-card:hover { border-color: rgba(251,191,36,0.2); }
        .menu-item-card.unavailable { opacity: 0.5; }
        .menu-item-left { display: flex; gap: 1rem; align-items: center; flex: 1; min-width: 0; }
        .menu-item-img { width: 64px; height: 64px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; }
        .menu-item-info { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
        .menu-item-info h4 { font-size: 0.95rem; }
        .menu-item-actions { flex-shrink: 0; }
        .qty-control { display: flex; align-items: center; gap: 0.5rem; background: var(--bg-elevated); border-radius: var(--radius-md); padding: 0.25rem; }
        .qty-val { font-weight: 700; font-size: 0.9rem; min-width: 20px; text-align: center; }
        .floating-cart { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; border-radius: var(--radius-full); box-shadow: var(--shadow-amber); min-width: 300px; z-index: 40; }
        .cart-count-badge { background: rgba(0,0,0,0.2); border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
      `}</style>
    </div>
  )
}
