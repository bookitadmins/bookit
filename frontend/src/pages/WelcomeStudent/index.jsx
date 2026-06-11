import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './index.css'

export default function WelcomeStudent() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Auto-redirect after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => navigate('/'), 3000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="welcomestudent-root">
      <div className="welcomestudent-glow" />

      <div className="welcomestudent-card animate-fade-in">
        <span className="welcomestudent-emoji">🎓</span>

        <h1 className="welcomestudent-title">
          Welcome,{' '}
          <span className="gradient-text">{user?.student_profile?.name?.split(' ')[0] || 'there'}!</span>
        </h1>

        <p className="welcomestudent-subtitle">
          You're all set to explore campus canteens, compare prices,
          and pre-book your meals in seconds.
        </p>

        <div className="welcomestudent-features">
          {[
            { icon: '🏪', title: 'Browse Canteens', desc: 'Find all campus canteens sorted by rating' },
            { icon: '🔍', title: 'Price Finder', desc: 'Compare dish prices across all canteens' },
            { icon: '🛒', title: 'Pre-Book Meals', desc: 'Order ahead, skip the queue' },
            { icon: '🔔', title: 'Live Alerts', desc: 'Get notified when food is ready' },
          ].map(f => (
            <div key={f.title} className="welcomestudent-feature">
              <span className="welcomestudent-feature-icon">{f.icon}</span>
              <div className="welcomestudent-feature-title">{f.title}</div>
              <div className="welcomestudent-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="welcomestudent-cta">
          <div className="welcomestudent-progress">
            <div className="welcomestudent-progress-bar" />
          </div>
          <p className="text-sm text-muted">Redirecting to dashboard…</p>
          <button
            id="welcome-student-continue"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/')}
          >
            Explore Canteens →
          </button>
        </div>
      </div>
    </div>
  )
}
