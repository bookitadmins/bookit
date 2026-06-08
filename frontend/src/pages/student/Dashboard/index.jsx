import { useState, useEffect } from 'react'
import { canteensAPI } from '../../../services/api'
import CanteenCard from '../../../components/CanteenCard'
import { Search, SortAsc, SortDesc, Utensils, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [canteens, setCanteens] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('desc')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCanteens()
  }, [sort])

  const loadCanteens = async () => {
    setLoading(true)
    try {
      const res = await canteensAPI.list(sort)
      setCanteens(res.data)
    } catch {}
    setLoading(false)
  }

  const filtered = canteens.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="container">
        {/* Hero header */}
        <div className="dashboard-hero animate-fade-in">
          <div>
            <h1>Hey, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              What are you craving today?
            </p>
          </div>
          <button
            id="go-price-finder"
            className="btn btn-secondary"
            onClick={() => navigate('/search')}
          >
            <TrendingUp size={16} />
            Price Finder
          </button>
        </div>

        {/* Controls */}
        <div className="dashboard-controls animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="canteen-search"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search canteens…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-toggle">
            <button
              id="sort-desc"
              className={`btn btn-sm ${sort === 'desc' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSort('desc')}
            >
              <SortDesc size={14} /> Top Rated
            </button>
            <button
              id="sort-asc"
              className={`btn btn-sm ${sort === 'asc' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSort('asc')}
            >
              <SortAsc size={14} /> Lowest First
            </button>
          </div>
        </div>

        {/* Canteen grid */}
        {loading ? (
          <div className="grid-auto">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Utensils size={56} />
            <h3>No canteens found</h3>
            <p>{search ? 'Try a different search term' : 'No canteens available right now'}</p>
          </div>
        ) : (
          <div className="grid-auto">
            {filtered.map((c) => (
              <CanteenCard key={c.id} canteen={c} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dashboard-hero { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; }
        .dashboard-controls { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .sort-toggle { display: flex; gap: 0.5rem; }
      `}</style>
    </div>
  )
}
