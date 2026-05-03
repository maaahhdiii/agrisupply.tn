import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../store/cartStore'
import type { Locale } from '../../types'

const Header = () => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = useCartStore((state) => state.locale)
  const setLocale = useCartStore((state) => state.setLocale)
  const totalItems = useCartStore((state) => state.totalItems())
  const isAr = locale === 'ar'

  const toggleLanguage = () => {
    const nextLocale: Locale = locale === 'ar' ? 'fr' : 'ar'
    setLocale(nextLocale)
    i18n.changeLanguage(nextLocale)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="AgriSupply TN" className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-500 md:flex">
          <Link to="/home" className="hover:text-primary">
            {isAr ? 'الرئيسية' : 'Accueil'}
          </Link>
          <Link to="/orders" className="hover:text-primary">
            {isAr ? 'طلباتي' : 'Commandes'}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            AR | FR
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
