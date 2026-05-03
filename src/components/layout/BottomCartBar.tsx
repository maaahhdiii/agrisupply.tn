import { useNavigate, useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react'

export default function BottomCartBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const totalItems = useCartStore(s => s.totalItems())
  const totalPrice = useCartStore(s => s.totalPrice())
  const locale = useAuthStore(s => s.locale)

  const showOn = ['/home', '/cart']
  if (!showOn.includes(location.pathname)) return null
  if (totalItems === 0) return null

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up cursor-pointer"
      style={{ background: '#2E7D32' }}
      onClick={() => navigate('/cart')}
    >
      <div className="flex items-center justify-between px-4 h-16 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-white">
          <ShoppingCart size={20} />
          <span className="font-bold text-sm">
            {totalItems} {locale === 'ar' ? 'منتج' : 'article(s)'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="font-bold">
            {totalPrice.toFixed(3)} TND
          </span>
          <Arrow size={18} />
        </div>
      </div>
    </div>
  )
}
