import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '../../types'
import { useCartStore } from '../../store/cartStore'
import { useTranslation } from 'react-i18next'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 2,
  }).format(value)

type CartItemProps = {
  item: CartItemType
}

const CartItem = ({ item }: CartItemProps) => {
  const updateQty = useCartStore((state) => state.updateQty)
  const removeItem = useCartStore((state) => state.removeItem)
  const { i18n } = useTranslation()
  const lang = i18n.language

  const name = lang === 'ar' ? item.product.name_ar : item.product.name_fr
  const unit = lang === 'ar' ? item.product.unit_ar : item.product.unit_fr

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={name}
            className="h-[50px] w-[50px] rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">
            Img
          </div>
        )}
        <div>
          <p className="text-base font-semibold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">
            {formatCurrency(item.product.price)} / {unit}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:gap-6">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
          <button
            className="text-slate-500 transition hover:text-primary"
            onClick={() => updateQty(item.product.id, item.quantity - 1)}
          >
            <Minus size={16} />
          </button>
          <span className="w-6 text-center text-sm font-bold text-slate-900">
            {item.quantity}
          </span>
          <button
            className="text-slate-500 transition hover:text-primary"
            onClick={() => updateQty(item.product.id, item.quantity + 1)}
          >
            <Plus size={16} />
          </button>
        </div>

        <p className="w-24 text-right text-base font-bold text-slate-900">
          {formatCurrency(item.product.price * item.quantity)}
        </p>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition hover:bg-red-50 hover:text-red-600"
          onClick={() => removeItem(item.product.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}

export default CartItem
