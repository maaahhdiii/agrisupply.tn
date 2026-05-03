import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../store/cartStore'
import Button from '../ui/Button'

type CartSummaryProps = {
  onCheckout?: () => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 2,
  }).format(value)

const CartSummary = ({ onCheckout }: CartSummaryProps) => {
  const { t } = useTranslation()
  const items = useCartStore((state) => state.items)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )

  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{t('cart.summary')}</h3>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>{t('cart.items')}</span>
        <span>{totalItems}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-base font-semibold text-slate-900">
        <span>{t('cart.total')}</span>
        <span>{formatCurrency(totalPrice)}</span>
      </div>
      {onCheckout ? (
        <Button className="mt-6 w-full" onClick={onCheckout}>
          {t('cart.checkout')}
        </Button>
      ) : null}
    </div>
  )
}

export default CartSummary
