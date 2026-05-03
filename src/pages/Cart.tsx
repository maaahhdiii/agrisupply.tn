import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, ShoppingCart, Calendar } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import CartItem from '../components/cart/CartItem'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 2,
  }).format(value)

const DELIVERY_FEE = 5.0

const Cart = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const totalItems = useCartStore((state) => state.totalItems())
  const totalPrice = useCartStore((state) => state.totalPrice())
  
  const isRtl = i18n.language === 'ar'
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-300">
          <ShoppingCart size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t('cart.empty')}</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
        >
          {isRtl ? 'تسوق الآن' : 'Continuer les achats'}
        </button>
      </div>
    )
  }

  const finalTotal = totalPrice + DELIVERY_FEE

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-slate-50"
        >
          <BackIcon size={20} className="text-slate-700" />
        </button>
        <h1 className="font-main text-2xl font-bold text-slate-900">
          {t('cart.title')} ({totalItems})
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        <div>
          <div className="sticky top-24 rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-900">{t('cart.total')}</h3>
            
            <div className="mt-6 space-y-3 border-b border-slate-100 pb-6 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>{t('cart.total')}</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.delivery')}</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(DELIVERY_FEE)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-secondary"
              >
                {t('cart.checkout')}
              </button>
              
              <button
                onClick={() => navigate('/checkout?scheduled=true')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <Calendar size={18} />
                {t('schedule.title')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
