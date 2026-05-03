import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import type { Product } from '../types'
import Header from '../components/layout/Header'

const PAGE_SIZE = 8

const mockProducts: Product[] = [
  {
    id: 'mock-1',
    name_ar: 'بطاطا',
    name_fr: 'Pommes de terre',
    description_ar: '',
    description_fr: '',
    price: 15.0,
    unit_ar: 'كيس',
    unit_fr: 'sac',
    image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
    category: 'légumes',
    stock_available: true,
  },
  {
    id: 'mock-3',
    name_ar: 'برتقال',
    name_fr: 'Oranges',
    description_ar: '',
    description_fr: '',
    price: 20.0,
    unit_ar: 'كرتون',
    unit_fr: 'carton',
    image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400',
    category: 'fruits',
    stock_available: true,
  },
  {
    id: 'mock-4',
    name_ar: 'بصل',
    name_fr: 'Oignons',
    description_ar: '',
    description_fr: '',
    price: 10.0,
    unit_ar: 'كيس',
    unit_fr: 'sac',
    image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
    category: 'légumes',
    stock_available: true,
  },
  {
    id: 'mock-5',
    name_ar: 'تفاح',
    name_fr: 'Pommes',
    description_ar: '',
    description_fr: '',
    price: 25.0,
    unit_ar: 'كرتون',
    unit_fr: 'carton',
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    category: 'fruits',
    stock_available: true,
  },
  {
    id: 'mock-7',
    name_ar: 'جزر',
    name_fr: 'Carottes',
    description_ar: '',
    description_fr: '',
    price: 9.0,
    unit_ar: 'كيس',
    unit_fr: 'sac',
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
    category: 'légumes',
    stock_available: true,
  },
  {
    id: 'mock-8',
    name_ar: 'ثوم',
    name_fr: 'Ail',
    description_ar: '',
    description_fr: '',
    price: 30.0,
    unit_ar: 'كيس',
    unit_fr: 'sac',
    image_url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400',
    category: 'légumes',
    stock_available: true,
  },
  {
    id: 'mock-9',
    name_ar: 'خيار',
    name_fr: 'Concombres',
    description_ar: '',
    description_fr: '',
    price: 11.0,
    unit_ar: 'كرتون',
    unit_fr: 'carton',
    image_url: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400',
    category: 'légumes',
    stock_available: true,
  },
  {
    id: 'mock-10',
    name_ar: 'فراولة',
    name_fr: 'Fraises',
    description_ar: '',
    description_fr: '',
    price: 35.0,
    unit_ar: 'كرتون',
    unit_fr: 'carton',
    image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',
    category: 'fruits',
    stock_available: true,
  },
]

const categoryOptions = [
  { id: 'all', ar: 'الكل', fr: 'Tous' },
  { id: 'légumes', ar: '🥬 خضروات', fr: '🥬 Légumes' },
  { id: 'fruits', ar: '🍎 فواكه', fr: '🍎 Fruits' },
  { id: 'herbes', ar: '🌿 أعشاب', fr: '🌿 Herbes' },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 3,
  }).format(value)

const Home = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const locale = useCartStore((state) => state.locale)
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQty = useCartStore((state) => state.updateQty)

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [bounceId, setBounceId] = useState<string | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    const fetchProducts = async () => {
      const isFirstLoad = page === 0
      if (isFirstLoad) setIsLoading(true)
      else setIsFetchingMore(true)

      try {
        const from = page * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to)

        if (error) throw error

        if (data) {
          if (isFirstLoad) setProducts(data as Product[])
          else setProducts((prev) => [...prev, ...(data as Product[])])
          setHasMore(data.length === PAGE_SIZE)
        }
      } catch {
        if (isFirstLoad) {
          setProducts(mockProducts)
          setHasMore(false)
        }
      } finally {
        setIsLoading(false)
        setIsFetchingMore(false)
      }
    }

    fetchProducts()
  }, [page])

  useEffect(() => {
    const node = lastProductRef.current
    if (!node || isLoading || isFetchingMore || !hasMore) return

    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1)
      }
    })

    observer.current.observe(node)

    return () => observer.current?.disconnect()
  }, [isLoading, isFetchingMore, hasMore, products])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products
    return products.filter((product) => product.category === selectedCategory)
  }, [products, selectedCategory])

  const handleAdd = (product: Product) => {
    addItem(product)
    setBounceId(product.id)
    setTimeout(() => setBounceId(null), 300)
  }

  const getQuantity = (productId: string) =>
    items.find((item) => item.product.id === productId)?.quantity || 0

  return (
    <div className="min-h-screen bg-[#F4F8F4]">
      <Header />

      <div className="sticky top-16 z-40 border-b border-slate-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="scroll-hide flex items-center gap-3 overflow-x-auto">
          {categoryOptions.map((category) => {
            const isActive = selectedCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/30 bg-white text-primary hover:bg-primary/5'
                }`}
              >
                {locale === 'ar' ? category.ar : category.fr}
              </button>
            )
          })}
        </div>
      </div>

      <section className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-[#0a2e0c] via-[#1a5c1e] to-[#0d1f0e] px-6 py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <ShoppingCart size={22} />
          </div>
          <div>
            <p className="text-lg font-bold">
              {locale === 'ar'
                ? 'مرحباً! منتجات طازجة تنتظرك'
                : 'Bonjour! Produits frais disponibles'}
            </p>
            <p className="text-sm text-emerald-100">
              {locale === 'ar'
                ? 'تسوق بسهولة وجدول طلباتك'
                : 'Commandez facilement et planifiez vos achats'}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 pt-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, idx) => (
              <div key={`skeleton-${idx}`} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const quantity = getQuantity(product.id)
              const name = locale === 'ar' ? product.name_ar : product.name_fr
              const unit = locale === 'ar' ? product.unit_ar : product.unit_fr
              const isOut = !product.stock_available

              const card = (
                <div
                  className={`relative overflow-hidden rounded-2xl bg-white shadow-md transition hover:shadow-lg ${
                    bounceId === product.id ? 'animate-bounce-add' : ''
                  } ${isOut ? 'grayscale opacity-70' : ''}`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      {product.category}
                    </span>
                    {isOut && (
                      <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                        {locale === 'ar' ? 'نفد' : 'Rupture'}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-[15px] font-bold text-slate-900" title={name}>
                      {name}
                    </h3>
                    <p className="mt-1 flex items-center text-sm">
                      <span className="text-[17px] font-bold text-primary">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="text-xs text-slate-500">{unit}</span>
                    </p>

                    <div className="mt-4">
                      {quantity === 0 ? (
                        <button
                          onClick={() => handleAdd(product)}
                          disabled={isOut}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {locale === 'ar' ? '+ إضافة' : '+ Ajouter'}
                        </button>
                      ) : (
                        <div className="flex items-center justify-between rounded-xl bg-slate-100 px-2 py-2 animate-scale-in">
                          <button
                            onClick={() => updateQty(product.id, quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold text-slate-900">{quantity}</span>
                          <button
                            onClick={() => updateQty(product.id, quantity + 1)}
                            disabled={isOut}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )

              if (index === filteredProducts.length - 1) {
                return (
                  <div key={product.id} ref={lastProductRef}>
                    {card}
                  </div>
                )
              }

              return <div key={product.id}>{card}</div>
            })}
          </div>
        )}

        {isFetchingMore && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div key={`more-${idx}`} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="py-8 text-center text-sm font-semibold text-slate-500">
            ✓ {locale === 'ar' ? 'تم التحميل' : 'Tous chargés'}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
