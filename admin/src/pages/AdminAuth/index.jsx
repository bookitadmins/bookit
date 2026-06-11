import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { Shield, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import './index.css'

export default function AdminAuth() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Admin access granted')
      navigate('/')
    } catch (err) {
      setError(err.message === 'Not an admin account'
        ? 'This account does not have admin privileges'
        : err.response?.data?.detail || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="adminauth-root">
      <div className="adminauth-glow" />

      <div className="adminauth-card animate-fade-in">
        <div className="adminauth-icon-wrap">
          <Shield size={32} />
        </div>

        <h1 className="adminauth-title">
          Admin <span className="gradient-text">Portal</span>
        </h1>
        <p className="adminauth-subtitle">
          Book It platform management. Authorised personnel only.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="adminauth-form">
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="adminauth-pw-wrap">
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                className="adminauth-pw-toggle"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Authenticating…</>
              : <><Shield size={16} /> Access Admin Panel</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
