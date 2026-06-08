import { Link } from 'react-router-dom'
import { TrendingDown, ArrowRight } from 'lucide-react'
import StarRating from '../StarRating'
import './index.css'

export default function PriceComparisonRow({ result, rank }) {
  const { menu_item, canteen } = result
  const isBest = rank === 0

  return (
    <div
      className={`pricecomparisonrow-root animate-fade-in ${isBest ? 'best' : ''}`}
      style={{ animationDelay: `${rank * 60}ms` }}
    >
      {isBest && (
        <div className="pricecomparisonrow-best-badge">
          <TrendingDown size={12} /> Best Price
        </div>
      )}

      <div className="pricecomparisonrow-left">
        <div className="pricecomparisonrow-rank">{rank + 1}</div>

        {menu_item.image_url ? (
          <img src={menu_item.image_url} alt={menu_item.name} className="pricecomparisonrow-img" />
        ) : (
          <div className="pricecomparisonrow-img pricecomparisonrow-img-placeholder">🍽️</div>
        )}

        <div className="pricecomparisonrow-info">
          <h4>{canteen.name}</h4>
          <p className="text-sm text-muted">{menu_item.description || menu_item.category}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={parseFloat(canteen.rating)} size="sm" />
            <span className="text-xs text-secondary">{parseFloat(canteen.rating).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="pricecomparisonrow-right">
        <div className="price" style={{ fontSize: '1.4rem' }}>
          {parseFloat(menu_item.price).toFixed(2)}
        </div>
        <Link to={`/canteen/${canteen.id}`} className="btn btn-primary btn-sm">
          Order <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
