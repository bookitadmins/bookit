import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { Star, RefreshCw, Store, CheckCircle, XCircle } from 'lucide-react'
import './index.css'

export default function CanteensList() {
  const [canteens, setCanteens] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { const res = await adminAPI.listCanteens(); setCanteens(res.data) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="page">
      <div className="container">
        <div className="canteenslist-header animate-fade-in">
          <div>
            <h1>All <span className="gradient-text">Canteens</span></h1>
            <p className="text-secondary">{canteens.length} canteens registered on the platform</p>
          </div>
          <button id="refresh-canteens" className="btn btn-secondary btn-sm" onClick={load}>
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner spinner-lg" /></div>
        ) : canteens.length === 0 ? (
          <div className="empty-state">
            <Store size={48} />
            <h3>No canteens yet</h3>
            <p>Canteens will appear here once owners set them up</p>
          </div>
        ) : (
          <div className="canteenslist-grid animate-fade-in">
            {canteens.map(c => (
              <div key={c.id} id={`canteen-${c.id.slice(0, 8)}`} className="canteenslist-card">
                <div className="canteenslist-card-img">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} />
                  ) : (
                    <div className="canteenslist-card-img-placeholder">🏪</div>
                  )}
                  <div className="canteenslist-card-status">
                    <span className={`badge ${c.is_open ? 'badge-green' : 'badge-red'}`}>
                      {c.is_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <div className="canteenslist-card-body">
                  <h3>{c.name}</h3>
                  <p className="text-sm text-muted">{c.description || 'No description'}</p>
                  <div className="canteenslist-card-footer">
                    <span className="flex items-center gap-1 text-sm">
                      <Star size={14} style={{ color: 'var(--amber)' }} fill="var(--amber)" />
                      {parseFloat(c.rating).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted badge badge-purple">
                      ID: {c.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
