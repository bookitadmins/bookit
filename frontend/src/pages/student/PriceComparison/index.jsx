import { useState } from 'react'
import { menuAPI } from '../../../services/api'
import PriceComparisonRow from '../../../components/PriceComparisonRow'
import { Search, Loader, TrendingDown } from 'lucide-react'

export default function PriceComparison() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setResults(null)
    setSearched(query.trim())
    try {
      const res = await menuAPI.search(query.trim())
      setResults(res.data)
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'var(--grad-amber)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d0d0f' }}>
              <TrendingDown size={20} />
            </div>
            <h1>Price Finder</h1>
          </div>
          <p>Search any dish to compare prices across all campus canteens instantly.</p>
        </div>

        {/* Search form */}
        <form id="price-search-form" onSubmit={handleSearch} className="animate-fade-in" style={{ animationDelay: '0.1s', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="dish-search-input"
              className="form-input"
              style={{ paddingLeft: '3rem', fontSize: '1rem', height: '52px' }}
              placeholder="e.g. Chole Bhature, Paneer, Dosa…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button id="dish-search-btn" type="submit" className="btn btn-primary" style={{ height: '52px', padding: '0 1.5rem' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Compare'}
          </button>
        </form>

        {/* Results */}
        {loading && (
          <div className="empty-state">
            <span className="spinner spinner-lg" />
            <p>Scanning all canteens…</p>
          </div>
        )}

        {results !== null && !loading && (
          <>
            <div className="section-header animate-fade-in">
              <div>
                <h3>Results for "<span className="gradient-text">{searched}</span>"</h3>
                <p className="text-sm text-muted">{results.length} canteen{results.length !== 1 ? 's' : ''} serving this dish</p>
              </div>
              {results.length > 0 && (
                <div className="badge badge-green">
                  Sorted by lowest price
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div className="empty-state">
                <Search size={48} />
                <h3>No results found</h3>
                <p>No canteen currently serves "<strong>{searched}</strong>"</p>
              </div>
            ) : (
              <div className="flex-col gap-3" style={{ display: 'flex' }}>
                {results.map((r, i) => (
                  <PriceComparisonRow key={r.menu_item.id} result={r} rank={i} />
                ))}
              </div>
            )}
          </>
        )}

        {results === null && !loading && (
          <div className="empty-state" style={{ paddingTop: '2rem' }}>
            <div style={{ fontSize: '4rem' }}>🔍</div>
            <h3>Find the best price</h3>
            <p>Type any dish name above and see where it's cheapest across campus</p>
          </div>
        )}
      </div>
    </div>
  )
}
