import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { CheckCircle, XCircle, Clock, RefreshCw, User } from 'lucide-react'
import toast from 'react-hot-toast'
import './index.css'

export default function OwnersApproval() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // 'pending' | 'approved' | 'all'
  const [acting, setActing] = useState({})

  const load = async () => {
    setLoading(true)
    try { const res = await adminAPI.listOwners(); setOwners(res.data) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (id, name) => {
    setActing(a => ({ ...a, [id]: 'approving' }))
    try {
      await adminAPI.approveOwner(id)
      setOwners(o => o.map(u => u.id === id ? { ...u, is_approved: true } : u))
      toast.success(`✅ ${name} approved!`)
    } catch { toast.error('Approval failed') }
    setActing(a => ({ ...a, [id]: null }))
  }

  const reject = async (id, name) => {
    if (!confirm(`Revoke access for ${name}?`)) return
    setActing(a => ({ ...a, [id]: 'rejecting' }))
    try {
      await adminAPI.rejectOwner(id)
      setOwners(o => o.map(u => u.id === id ? { ...u, is_approved: false } : u))
      toast.success(`❌ ${name} access revoked`)
    } catch { toast.error('Action failed') }
    setActing(a => ({ ...a, [id]: null }))
  }

  const filtered = owners.filter(o => {
    if (filter === 'pending') return !o.is_approved
    if (filter === 'approved') return o.is_approved
    return true
  })

  const pendingCount = owners.filter(o => !o.is_approved).length

  return (
    <div className="page">
      <div className="container">
        <div className="ownersapproval-header animate-fade-in">
          <div>
            <h1>Canteen Owner <span className="gradient-text">Approvals</span></h1>
            <p className="text-secondary">Review and approve canteen owner registrations</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {pendingCount > 0 && (
              <span className="badge badge-amber">{pendingCount} pending</span>
            )}
            <button id="refresh-owners" className="btn btn-secondary btn-sm" onClick={load}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="ownersapproval-filters animate-fade-in">
          {[
            { key: 'pending', label: `Pending (${owners.filter(o => !o.is_approved).length})` },
            { key: 'approved', label: `Approved (${owners.filter(o => o.is_approved).length})` },
            { key: 'all', label: `All (${owners.length})` },
          ].map(f => (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              className={`ownersapproval-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >{f.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><span className="spinner spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={48} />
            <h3>{filter === 'pending' ? 'No pending approvals' : 'No owners found'}</h3>
            <p>{filter === 'pending' ? 'All canteen owners have been reviewed' : ''}</p>
          </div>
        ) : (
          <div className="ownersapproval-list animate-fade-in">
            {filtered.map(owner => (
              <div
                key={owner.id}
                id={`owner-row-${owner.id.slice(0, 8)}`}
                className={`ownersapproval-row ${!owner.is_approved ? 'ownersapproval-row--pending' : ''}`}
              >
                <div className="ownersapproval-row-left">
                  <div className="ownersapproval-avatar">
                    {owner.name[0].toUpperCase()}
                  </div>
                  <div className="ownersapproval-info">
                    <div className="flex items-center gap-2">
                      <h3>{owner.name}</h3>
                      <span className={`badge ${owner.is_approved ? 'badge-green' : 'badge-amber'}`}>
                        {owner.is_approved ? <><CheckCircle size={10} /> Approved</> : <><Clock size={10} /> Pending</>}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{owner.email}</p>
                    <p className="text-sm text-muted">📞 {owner.phone}</p>
                  </div>
                </div>

                <div className="ownersapproval-actions">
                  {!owner.is_approved ? (
                    <button
                      id={`approve-${owner.id.slice(0, 8)}`}
                      className="btn btn-success btn-sm"
                      onClick={() => approve(owner.id, owner.name)}
                      disabled={acting[owner.id]}
                    >
                      {acting[owner.id] === 'approving'
                        ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        : <><CheckCircle size={14} /> Approve</>
                      }
                    </button>
                  ) : (
                    <button
                      id={`revoke-${owner.id.slice(0, 8)}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => reject(owner.id, owner.name)}
                      disabled={acting[owner.id]}
                    >
                      {acting[owner.id] === 'rejecting'
                        ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        : <><XCircle size={14} /> Revoke</>
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
