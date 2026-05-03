import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Minus } from 'lucide-react'
import type { Product, Locale, Unit } from '../../types'
import { useCartStore } from '../../store/cartStore'

type ProductCardProps = {
  product: Product
  locale: Locale
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 2,
  }).format(value)

const ProductCard = ({ product, locale }: ProductCardProps) => {
  const { t } = useTranslation()
  const [isBouncing, setIsBouncing] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit>('kg')
  
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQty = useCartStore((state) => state.updateQty)
  const updateUnit = useCartStore((state) => state.updateUnit)
  const removeItem = useCartStore((state) => state.removeItem)
  
  const cartItem = items.find((item) => item.product.id === product.id)
  const quantity = cartItem?.quantity || 0
  const currentUnit = cartItem?.selectedUnit || 'kg'

  const name = locale === 'ar' ? product.name_ar : product.name_fr
  
  // Calculate price based on unit (ton = 1000 kg)
  const getDisplayPrice = (basePrice: number, unit: Unit) => {
    return unit === 'ton' ? basePrice * 1000 : basePrice
  }
  
  const displayPrice = getDisplayPrice(product.price, currentUnit || 'kg')

  const handleAdd = () => {
    addItem(product, selectedUnit)
    triggerBounce()
  }

  const handleUnitChange = (newUnit: Unit) => {
    updateUnit(product.id, newUnit)
    setSelectedUnit(newUnit)
  }

  const handleIncrease = () => {
    updateQty(product.id, quantity + 1)
    triggerBounce()
  }

  const handleDecrease = () => {
    if (quantity === 1) {
      removeItem(product.id)
    } else {
      updateQty(product.id, quantity - 1)
    }
  }

  const triggerBounce = () => {
    setIsBouncing(true)
    setTimeout(() => setIsBouncing(false), 300)
  }

  return (
    <div 
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all ${
        !product.stock_available ? 'opacity-60 grayscale' : 'hover:shadow-lg'
      } ${isBouncing ? 'animate-bounce-sm' : ''}`}
    >
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt=""
            onError={(e) => { e.currentTarget.style.display = 'none' }}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            No Image
          </div>
        )}
        
        {!product.stock_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-base font-bold text-slate-900 line-clamp-1" title={name}>
          {name}
        </h3>
        
        <p className="mt-1 flex items-center text-sm">
          <span className="font-semibold text-primary">{formatCurrency(displayPrice)}</span>
          <span className="mx-1 text-slate-400">/</span>
          <select 
            value={currentUnit || 'kg'}
            onChange={(e) => handleUnitChange(e.target.value as Unit)}
            disabled={quantity === 0}
            className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            <option value="kg">kg</option>
            <option value="ton">ton</option>
          </select>
        </p>

        <div className="mt-4 flex-1">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!product.stock_available}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Plus size={18} />
              {t('product.add')}
            </button>
          ) : (
            <div className="flex h-[40px] items-center justify-between overflow-hidden rounded-xl bg-slate-100 transition-transform">
              <button
                onClick={handleDecrease}
                className="flex h-full w-10 items-center justify-center text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center font-bold text-slate-900">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                disabled={!product.stock_available}
                className="flex h-full w-10 items-center justify-center text-primary transition hover:bg-primary/10 hover:text-secondary disabled:text-slate-400"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
