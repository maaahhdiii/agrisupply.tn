import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem, Locale, Unit } from '../types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  locale: Locale
  addItem: (product: Product, unit?: Unit) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  updateUnit: (productId: string, unit: Unit) => void
  clearCart: () => void
  setLocale: (locale: Locale) => void
  toggleCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      locale: (localStorage.getItem('agrisupply_locale') as Locale) || 'ar',

      addItem: (product, unit = 'kg') => {
        const items = get().items
        const existing = items.find(i => i.product.id === product.id && i.selectedUnit === unit)
        if (existing) {
          set({ items: items.map(i => i.product.id === product.id && i.selectedUnit === unit ? { ...i, quantity: i.quantity + 1 } : i) })
        } else {
          set({ items: [...items, { product, quantity: 1, selectedUnit: unit }] })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter(i => i.product.id !== productId) }),

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter(i => i.product.id !== productId) })
        } else {
          set({ items: get().items.map(i => i.product.id === productId ? { ...i, quantity: qty } : i) })
        }
      },

      updateUnit: (productId, unit) => {
        set({ items: get().items.map(i => i.product.id === productId ? { ...i, selectedUnit: unit } : i) })
      },

      clearCart: () => set({ items: [] }),
      setLocale: (locale) => {
        localStorage.setItem('agrisupply_locale', locale)
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = locale
        set({ locale })
      },
      toggleCart: () => set({ isOpen: !get().isOpen }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'agrisupply-cart',
    }
  )
)
