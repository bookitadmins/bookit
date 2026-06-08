import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
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

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '',
    role: 'student_resident',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let user
      if (mode === 'login') {
        user = await login(form.email, form.password)
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      } else {
        user = await register(form)
        toast.success(`Welcome to BookIt, ${user.name.split(' ')[0]}!`)
      }

      // Redirect to role-specific welcome page
      if (user.role === 'student_resident') {
        navigate('/welcome/student')
      } else if (user.role === 'canteen_owner' && user.is_approved) {
        navigate('/welcome/owner')
      } else if (user.role === 'canteen_owner') {
        navigate('/welcome/pending')
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
                    className={`authpage-role-btn ${form.role === 'student_resident' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: 'student_resident' }))}
                  >🎓 Student / Resident</button>
                  <button
                    type="button"
                    id="role-owner"
                    className={`authpage-role-btn ${form.role === 'canteen_owner' ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, role: 'canteen_owner' }))}
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
