import { useState, useEffect } from 'react'
import { canteensAPI, menuAPI } from '../../../services/api'
import { useAuth } from '../../../contexts/AuthContext'
import { Plus, Edit2, Trash2, Upload, X, Save, ToggleLeft, ToggleRight, Store } from 'lucide-react'
import toast from 'react-hot-toast'

function MenuItemRow({ item, onUpdate, onDelete, onUploadImage }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: item.name, price: item.price, description: item.description, category: item.category, is_available: item.is_available })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await onUpdate(item.id, { ...form, price: parseFloat(form.price) })
      setEditing(false)
      toast.success('Item updated')
    } catch { toast.error('Update failed') }
    setSaving(false)
  }

  const toggleAvail = async () => {
    try {
      await onUpdate(item.id, { is_available: !item.is_available })
    } catch { toast.error('Toggle failed') }
  }

  return (
    <div className={`menu-editor-row ${!item.is_available ? 'unavailable-row' : ''}`}>
      <div className="menu-editor-img-wrap">
        {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="img-placeholder" style={{ width: 56, height: 56, borderRadius: 8, fontSize: '1.2rem' }}>🍽️</div>}
        <label title="Upload image" className="img-upload-btn">
          <Upload size={12} />
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && onUploadImage(item.id, e.target.files[0])} />
        </label>
      </div>

      {editing ? (
        <div className="menu-editor-edit-form">
          <div className="grid-2" style={{ display: 'grid', gap: '0.5rem' }}>
            <input className="form-input form-input-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Item name" />
            <input className="form-input form-input-sm" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" step="0.50" min="0" />
          </div>
          <div className="grid-2" style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input className="form-input form-input-sm" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <input className="form-input form-input-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}><Save size={12} /> {saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={12} /> Cancel</button>
          </div>
        </div>
      ) : (
        <div className="menu-editor-info">
          <div className="flex items-center gap-2">
            <h4>{item.name}</h4>
            <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{item.category}</span>
          </div>
          {item.description && <p className="text-sm text-muted">{item.description}</p>}
          <span className="price">{parseFloat(item.price).toFixed(2)}</span>
        </div>
      )}

      {!editing && (
        <div className="menu-editor-actions">
          <button title={item.is_available ? 'Available' : 'Unavailable'} className="btn btn-ghost btn-icon btn-sm" onClick={toggleAvail}>
            {item.is_available ? <ToggleRight size={18} style={{ color: 'var(--green)' }} /> : <ToggleLeft size={18} style={{ color: 'var(--text-muted)' }} />}
          </button>
          <button id={`edit-item-${item.id.slice(0,8)}`} className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing(true)}><Edit2 size={14} /></button>
          <button id={`delete-item-${item.id.slice(0,8)}`} className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(item.id)}><Trash2 size={14} /></button>
        </div>
      )}

      <style>{`
        .menu-editor-row { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); transition: all var(--transition); }
        .menu-editor-row:hover { border-color: rgba(251,191,36,0.2); }
        .unavailable-row { opacity: 0.55; }
        .menu-editor-img-wrap { position: relative; flex-shrink: 0; }
        .menu-editor-img-wrap img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; }
        .img-upload-btn { position: absolute; bottom: -4px; right: -4px; width: 20px; height: 20px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); transition: all var(--transition); }
        .img-upload-btn:hover { background: var(--amber-500); color: #0d0d0f; border-color: var(--amber-500); }
        .menu-editor-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem; }
        .menu-editor-edit-form { flex: 1; }
        .menu-editor-actions { display: flex; align-items: center; gap: 0.25rem; flex-shrink: 0; }
        .form-input-sm { padding: 0.4rem 0.75rem; font-size: 0.85rem; }
      `}</style>
    </div>
  )
}

export default function MenuEditor() {
  const { user } = useAuth()
  const [canteen, setCanteen] = useState(null)
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCreateCanteen, setShowCreateCanteen] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: 'General' })
  const [newCanteen, setNewCanteen] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const cRes = await canteensAPI.list()
      const mine = cRes.data.find(c => c.owner_id === user.id)
      if (mine) {
        setCanteen(mine)
        const mRes = await menuAPI.getMenu(mine.id)
        setMenu(mRes.data)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createCanteen = async () => {
    setSaving(true)
    try {
      const res = await canteensAPI.create(newCanteen)
      setCanteen(res.data)
      setShowCreateCanteen(false)
      toast.success('Canteen created!')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    setSaving(false)
  }

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return
    setSaving(true)
    try {
      await menuAPI.addItem(canteen.id, { ...newItem, price: parseFloat(newItem.price) })
      await load()
      setNewItem({ name: '', price: '', description: '', category: 'General' })
      setShowAddForm(false)
      toast.success('Item added!')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    setSaving(false)
  }

  const updateItem = async (id, data) => {
    const res = await menuAPI.updateItem(id, data)
    setMenu(m => m.map(i => i.id === id ? res.data : i))
  }

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return
    try {
      await menuAPI.deleteItem(id)
      setMenu(m => m.filter(i => i.id !== id))
      toast.success('Item deleted')
    } catch { toast.error('Delete failed') }
  }

  const uploadItemImage = async (id, file) => {
    try {
      const res = await menuAPI.uploadImage(id, file)
      setMenu(m => m.map(i => i.id === id ? res.data : i))
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed') }
  }

  const uploadCanteenImage = async (file) => {
    try {
      const res = await canteensAPI.uploadImage(canteen.id, file)
      setCanteen(res.data)
      toast.success('Banner updated!')
    } catch { toast.error('Upload failed') }
  }

  if (loading) return <div className="page"><div className="container"><div className="empty-state"><span className="spinner spinner-lg" /></div></div></div>

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="mb-6 animate-fade-in">🍽️ Menu Editor</h1>

        {/* Canteen setup */}
        {!canteen ? (
          <div className="card animate-fade-in">
            {showCreateCanteen ? (
              <>
                <h3 className="mb-4">Create Your Canteen</h3>
                <div className="flex-col gap-3" style={{ display: 'flex' }}>
                  <div className="form-group">
                    <label className="form-label">Canteen Name</label>
                    <input id="canteen-name-input" className="form-input" placeholder="e.g. The Campus Dhaba" value={newCanteen.name} onChange={e => setNewCanteen(c => ({ ...c, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" placeholder="What do you serve?" value={newCanteen.description} onChange={e => setNewCanteen(c => ({ ...c, description: e.target.value }))} />
                  </div>
                  <button id="create-canteen-btn" className="btn btn-primary" onClick={createCanteen} disabled={saving || !newCanteen.name}>
                    {saving ? 'Creating…' : 'Create Canteen'}
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Store size={56} />
                <h3>No canteen yet</h3>
                <p>Create your canteen to start managing your menu</p>
                <button id="setup-canteen-btn" className="btn btn-primary" onClick={() => setShowCreateCanteen(true)}>Set Up Canteen</button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Canteen card */}
            <div className="card animate-fade-in mb-6">
              <div className="flex items-center gap-4">
                <div style={{ position: 'relative' }}>
                  {canteen.image_url ? (
                    <img src={canteen.image_url} alt={canteen.name} style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  ) : (
                    <div className="img-placeholder" style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', fontSize: '1.5rem' }}>🏪</div>
                  )}
                  <label className="img-upload-btn" style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Upload size={12} />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadCanteenImage(e.target.files[0])} />
                  </label>
                </div>
                <div>
                  <h2>{canteen.name}</h2>
                  <p className="text-secondary">{canteen.description}</p>
                  <span className="text-sm text-muted">Rating: {parseFloat(canteen.rating).toFixed(1)} ⭐</span>
                </div>
              </div>
            </div>

            {/* Menu list */}
            <div className="section-header animate-fade-in">
              <h2>Menu Items <span className="badge badge-amber" style={{ marginLeft: 8 }}>{menu.length}</span></h2>
              <button id="add-item-btn" className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Item</>}
              </button>
            </div>

            {/* Add item form */}
            {showAddForm && (
              <div className="card animate-slide-up mb-4" style={{ borderColor: 'rgba(251,191,36,0.3)' }}>
                <h3 className="mb-4">New Menu Item</h3>
                <div className="grid-2" style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Item Name *</label>
                    <input id="new-item-name" className="form-input" placeholder="e.g. Paneer Butter Masala" value={newItem.name} onChange={e => setNewItem(i => ({ ...i, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input id="new-item-price" className="form-input" type="number" step="0.50" min="0" placeholder="80.00" value={newItem.price} onChange={e => setNewItem(i => ({ ...i, price: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input id="new-item-category" className="form-input" placeholder="Main Course" value={newItem.category} onChange={e => setNewItem(i => ({ ...i, category: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" placeholder="Short description…" value={newItem.description} onChange={e => setNewItem(i => ({ ...i, description: e.target.value }))} />
                  </div>
                </div>
                <button id="save-item-btn" className="btn btn-primary" onClick={addItem} disabled={saving || !newItem.name || !newItem.price}>
                  {saving ? 'Adding…' : '+ Add to Menu'}
                </button>
              </div>
            )}

            {menu.length === 0 ? (
              <div className="empty-state animate-fade-in">
                <span style={{ fontSize: '3rem' }}>🍽️</span>
                <h3>Menu is empty</h3>
                <p>Add your first item using the button above</p>
              </div>
            ) : (
              <div className="flex-col gap-2 animate-fade-in" style={{ display: 'flex' }}>
                {menu.map(item => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                    onUploadImage={uploadItemImage}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
