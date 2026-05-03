import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import ProductCard from './ProductCard'

const ProductGrid = () => {
  const locale = useCartStore((state) => state.locale)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 8

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)
  
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isFetchingMore || errorMsg) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [isLoading, isFetchingMore, hasMore, errorMsg])

  useEffect(() => {
    const fetchProducts = async () => {
      const isFirstLoad = page === 0
      if (isFirstLoad) setIsLoading(true)
      else setIsFetchingMore(true)
      setErrorMsg(null)

      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to)

        if (error) throw error

        if (data) {
          if (isFirstLoad) {
            setProducts(data as Product[])
          } else {
            setProducts(prev => [...prev, ...(data as Product[])])
          }
          setHasMore(data.length === PAGE_SIZE)
        }
      } catch (err: any) {
        console.error('Error fetching products:', err)
        setErrorMsg(err.message || 'Error fetching products')
        setHasMore(false)
      } finally {
        setIsLoading(false)
        setIsFetchingMore(false)
      }
    }

    fetchProducts()
  }, [page])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
        ))}
      </div>
    )
  }

  if (errorMsg && products.length === 0) {
    return (
      <div className="rounded-3xl bg-red-50 p-8 text-center text-red-600">
        <p className="font-semibold">Error: {errorMsg}</p>
        <p className="mt-2 text-sm">Please check your Supabase connection and API keys.</p>
      </div>
    )
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center text-slate-500 shadow-sm">
        <p className="text-lg font-semibold">{locale === 'ar' ? 'لا توجد منتجات حاليا' : 'Aucun produit pour le moment'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => {
          if (products.length === index + 1) {
            return (
              <div ref={lastProductElementRef} key={product.id}>
                <ProductCard product={product} locale={locale} />
              </div>
            )
          } else {
            return <ProductCard key={product.id} product={product} locale={locale} />
          }
        })}
      </div>

      {isFetchingMore && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={`skeleton-${i}`} className="h-64 animate-pulse rounded-2xl bg-slate-200"></div>
          ))}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="py-8 text-center text-sm font-semibold text-slate-500">
          ✓ {locale === 'ar' ? 'تم تحميل جميع المنتجات' : 'Tous les produits chargés'}
        </div>
      )}
    </div>
  )
}

export default ProductGrid
