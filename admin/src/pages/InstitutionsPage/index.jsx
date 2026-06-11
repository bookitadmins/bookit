import { useState, useEffect } from 'react'
import { institutionsAPI } from '../../services/api'
import { Building2, Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import './index.css'

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', short_name: '', domain: '', city: '', logo_url: ''
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await institutionsAPI.list()
      setInstitutions(res.data)
    } catch (err) {
      toast.error('Failed to load institutions')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openModal = (inst = null) => {
    if (inst) {
      setEditing(inst.id)
      setForm({
        name: inst.name,
        short_name: inst.short_name,
        domain: inst.domain || '',
        city: inst.city || '',
        logo_url: inst.logo_url || ''
      })
    } else {
      setEditing(null)
      setForm({ name: '', short_name: '', domain: '', city: '', logo_url: '' })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await institutionsAPI.update(editing, form)
        toast.success('Institution updated')
      } else {
        await institutionsAPI.create(form)
        toast.success('Institution created')
      }
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this institution? This might affect many users.')) return
    try {
      await institutionsAPI.delete(id)
      toast.success('Institution deleted')
      load()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="admindashboard-header animate-fade-in">
          <div>
            <h1>Manage <span className="gradient-text">Institutions</span></h1>
            <p className="text-secondary">Platform-wide IIT list management</p>
          </div>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> Add Institution
          </button>
        </div>

        {loading ? (
          <div className="skeleton-list">
            {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton inst-card-skeleton" />)}
          </div>
        ) : (
          <div className="inst-grid animate-fade-in">
            {institutions.map(inst => (
              <div key={inst.id} className="inst-card">
                <div className="inst-card-content">
                  <div className="inst-logo-wrap">
                    {inst.logo_url ? (
                      <img src={inst.logo_url} alt={inst.short_name} className="inst-logo" />
                    ) : (
                      <Building2 size={24} className="text-secondary" />
                    )}
                  </div>
                  <div>
                    <h3 className="inst-name">{inst.name}</h3>
                    <p className="inst-meta">{inst.short_name} • {inst.city || 'Unknown city'}</p>
                    {inst.domain && <code className="inst-domain">@{inst.domain}</code>}
                  </div>
                </div>
                <div className="inst-card-actions">
                  <button className="btn-icon" onClick={() => openModal(inst)} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon text-error" onClick={() => handleDelete(inst.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h2>{editing ? 'Edit' : 'Add'} Institution</h2>
                <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="IIT Bombay" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Name</label>
                  <input className="form-input" value={form.short_name} onChange={e => setForm({...form, short_name: e.target.value})} placeholder="IITB" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Domain (optional)</label>
                  <input className="form-input" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} placeholder="iitb.ac.in" />
                </div>
                <div className="form-group">
                  <label className="form-label">City (optional)</label>
                  <input className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Mumbai" />
                </div>
                <div className="form-group">
                  <label className="form-label">Logo URL (optional)</label>
                  <input className="form-input" value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} placeholder="https://..." />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <Check size={18} /> {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
