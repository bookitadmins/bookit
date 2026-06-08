import { Link } from 'react-router-dom'
import { ChevronRight, Utensils } from 'lucide-react'
import StarRating from '../StarRating'
import './index.css'

export default function CanteenCard({ canteen }) {
  const { id, name, description, image_url, rating, is_open } = canteen

  return (
    <Link to={`/canteen/${id}`} className="canteencard-root animate-fade-in">

      {/* Banner image */}
      <div className="canteencard-image">
        {image_url ? (
          <img src={image_url} alt={name} />
        ) : (
          <div className="canteencard-placeholder">
            <Utensils size={36} />
            <span>No image</span>
          </div>
        )}
        <div className="canteencard-status-badge">
          <span className={`badge ${is_open ? 'badge-green' : 'badge-red'}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {is_open ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="canteencard-body">
        <div className="canteencard-title-row">
          <h3 className="canteencard-title">{name}</h3>
          <ChevronRight size={16} className="canteencard-chevron" />
        </div>

        {description && (
          <p className="canteencard-description">{description}</p>
        )}

        <div className="canteencard-footer">
          <StarRating rating={parseFloat(rating) || 0} size="sm" />
          <span className="canteencard-rating-value">
            {parseFloat(rating).toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}
