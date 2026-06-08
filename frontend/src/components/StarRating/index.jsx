import { Star } from 'lucide-react'
import './index.css'

export default function StarRating({ rating = 0, max = 5, size = 'md', interactive = false, onChange }) {
  const sizes = { sm: 12, md: 16, lg: 20 }
  const px = sizes[size] || 16

  return (
    <div className="starrating-root">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const half = !filled && i < rating
        return (
          <span
            key={i}
            className={`starrating-star ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange?.(i + 1)}
          >
            <Star
              size={px}
              fill={filled ? '#fbbf24' : 'none'}
              color={filled || half ? '#fbbf24' : '#3f3f46'}
              strokeWidth={1.5}
            />
          </span>
        )
      })}
    </div>
  )
}
