import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { institutionsAPI } from '../../services/api'
import { ChefHat, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import './index.css'

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [institutions, setInstitutions] = useState([])

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '',
    role: 'STUDENT', institute_id: '',
    roll_number: '', hostel_name: '', room_number: '',
    fssai_license: ''
  })

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await institutionsAPI.list()
        setInstitutions(res.data)
        if (res.data.length > 0) {
          setForm(f => ({ ...f, institute_id: res.data[0].id }))
        }
      } catch (err) {
        console.error('Failed to fetch institutions', err)
      }
    }
    fetchInstitutions()
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let user
      if (mode === 'login') {
        user = await login(form.email, form.password)
        const profile = user.student_profile || user.owner_profile || user.admin_profile
        toast.success(`Welcome back, ${profile?.name?.split(' ')[0] || 'User'}!`)
      } else {
        user = await register(form)
        const profile = user.student_profile || user.owner_profile || user.admin_profile
        toast.success(`Welcome to BookIt, ${profile?.name?.split(' ')[0] || 'User'}!`)
      }

      // Redirect based on role
      if (user.role === 'STUDENT') {
        navigate('/welcome/student')
      } else if (user.role === 'CANTEEN_OWNER' && user.is_approved) {
        navigate('/welcome/owner')
      } else if (user.role === 'CANTEEN_OWNER') {
        navigate('/welcome/pending')
      } else if (user.role === 'INSTITUTE_ADMIN') {
        navigate('/admin')
      } else if (user.role === 'SUPER_ADMIN') {
        const serverIp = import.meta.env.VITE_SERVER_IP || window.location.hostname
        window.location.href = `http://${serverIp}:5174/`
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authpage-root">
      {/* Left hero panel */}
      <div className="authpage-hero">
        <div className="authpage-hero-content">
          <div className="authpage-hero-logo">
            <ChefHat size={36} />
          </div>
          <h1 className="authpage-hero-title">
            Campus Food,<br />
            <span className="gradient-text">Reimagined.</span>
          </h1>
          <p className="authpage-hero-subtitle">
            Pre-book your meals, compare prices across canteens,
            and get real-time alerts when your food is ready.
          </p>
          <div className="authpage-features">
            {[
              '⚡ Instant pre-booking',
              '🔍 Cross-canteen price comparison',
              '🔔 Real-time order alerts',
              '⭐ Rate your experience',
            ].map((f) => (
              <div key={f} className="authpage-feature-item">{f}</div>
            ))}
          </div>
        </div>
        <div className="authpage-hero-glow" />
      </div>

      {/* Right form panel */}
      <div className="authpage-form-panel">
        <div className="authpage-form-card">

          {/* Mode toggle */}
          <div className="tabs mb-6">
            <button
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >Sign In</button>
            <button
              className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError('') }}
            >Create Account</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert-error">{error}</div>}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Select Institution</label>
                  <select
                    className="form-input"
                    value={form.institute_id}
                    onChange={set('institute_id')}
                    required
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.short_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input id="reg-name" className="form-input" placeholder="Arjun Sharma"
                      value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input id="reg-phone" className="form-input" placeholder="9876543210"
                      value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>

                {form.role === 'STUDENT' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Roll Number</label>
                      <input className="form-input" placeholder="22B1234"
                        value={form.roll_number} onChange={set('roll_number')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hostel</label>
                      <input className="form-input" placeholder="H-15"
                        value={form.hostel_name} onChange={set('hostel_name')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Room</label>
                      <input className="form-input" placeholder="302-A"
                        value={form.room_number} onChange={set('room_number')} required />
                    </div>
                  </div>
                )}

                {form.role === 'CANTEEN_OWNER' && (
                  <div className="form-group">
                    <label className="form-label">FSSAI License Number</label>
                    <input className="form-input" placeholder="12345678901234"
                      value={form.fssai_license} onChange={set('fssai_license')} required />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input id="auth-email" type="email" className="form-input"
                placeholder="you@campus.edu" value={form.email} onChange={set('email')} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="authpage-pw-wrap">
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" className="authpage-pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">I am a…</label>
                <div className="authpage-role-toggle">
                  <button
                    type="button"
                    id="role-student"
                    className={`authpage-role-btn ${form.role === 'STUDENT' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: 'STUDENT' }))}
                  >🎓 Student / Resident</button>
                  <button
                    type="button"
                    id="role-owner"
                    className={`authpage-role-btn ${form.role === 'CANTEEN_OWNER' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: 'CANTEEN_OWNER' }))}
                  >🍽️ Canteen Owner</button>
                </div>
              </div>
            )}

            <button
              id="auth-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              style={{ marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : mode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          <p className="authpage-switch-text">
            {mode === 'login' ? "New to BookIt?" : "Already have an account?"}{' '}
            <button
              className="authpage-switch-btn"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
