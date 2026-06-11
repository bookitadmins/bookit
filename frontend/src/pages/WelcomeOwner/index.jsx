import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ChefHat } from 'lucide-react'
import './index.css'

export default function WelcomeOwner() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/owner'), 3000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="welcomeowner-root">
      <div className="welcomeowner-glow" />

      <div className="welcomeowner-card animate-fade-in">
        <div className="welcomeowner-icon-wrap">
          <ChefHat size={48} color="#0d0d0f" />
        </div>

        <h1 className="welcomeowner-title">
          Welcome back,{' '}
          <span className="gradient-text">{user?.owner_profile?.name?.split(' ')[0] || 'Chef'}!</span>
        </h1>

        <p className="welcomeowner-subtitle">
          Your canteen dashboard is ready. Manage your menu,
          track orders in real-time, and keep customers happy.
        </p>

        <div className="welcomeowner-steps">
          {[
            { title: 'Set up your canteen', desc: 'Add your canteen name, description and banner image' },
            { title: 'Build your menu', desc: 'Add items with prices, photos and categories' },
            { title: 'Manage live orders', desc: 'Accept orders and send ready notifications instantly' },
          ].map((s, i) => (
            <div key={s.title} className="welcomeowner-step">
              <div className="welcomeowner-step-num">{i + 1}</div>
              <div className="welcomeowner-step-text">
                <strong>{s.title}</strong>
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        <div className="welcomeowner-progress">
          <div className="welcomeowner-progress-bar" />
        </div>
        <p className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>Redirecting to dashboard…</p>

        <button
          id="welcome-owner-continue"
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/owner')}
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  )
}
