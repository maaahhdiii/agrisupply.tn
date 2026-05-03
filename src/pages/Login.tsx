import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

const Login = () => {
  const navigate = useNavigate()
  const locale = useCartStore((state) => state.locale)
  const setUser = useAuthStore((state) => state.setUser)

  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')

  const isAr = locale === 'ar'

  const handleContinue = () => {
    if (!identifier.trim()) return
    setUser({ name: name.trim() || (isAr ? 'زائر' : 'Visiteur'), phone: identifier.trim() })
    navigate('/home')
  }

  const handleGuest = () => {
    setUser({ name: 'Visiteur', phone: '' })
    navigate('/home')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0a2e0c] via-[#1a5c1e] to-[#0d1f0e]">
      <div className="relative hidden w-[40%] items-center justify-center text-white lg:flex">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute right-20 bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        </div>

        <div className="relative z-10 flex max-w-sm flex-col items-center text-center">
          <div className="text-3xl font-black">AgriSupply.tn</div>
          <p className="mt-4 text-lg text-emerald-100">
            {isAr
              ? 'منصة الفلاحة التونسية الراقية'
              : 'La marketplace agricole premium en Tunisie'}
          </p>

          <div className="relative mt-10 h-44 w-full">
            <div className="absolute left-0 top-0 h-20 w-20 overflow-hidden rounded-full border-4 border-white/30 animate-float">
              <img
                src="https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200"
                alt="Tomate"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute right-0 top-10 h-20 w-20 overflow-hidden rounded-full border-4 border-white/30 animate-float-delay">
              <img
                src="https://images.unsplash.com/photo-1547514701-42782101795e?w=200"
                alt="Orange"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute left-10 bottom-0 h-20 w-20 overflow-hidden rounded-full border-4 border-white/30 animate-float">
              <img
                src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200"
                alt="Potato"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              isAr ? '🌾 منتجات طازجة' : '🌾 Produits frais',
              isAr ? '🚚 توصيل سريع' : '🚚 Livraison rapide',
              isAr ? '💵 الدفع عند التسليم' : '💵 Paiement à la livraison',
            ].map((pill) => (
              <span
                key={pill}
                className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-[60%]">
        <div className="w-full max-w-[420px] rounded-3xl bg-white px-8 py-12">
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-sm text-slate-500"
          >
            <ArrowLeft size={16} />
            {isAr ? 'رجوع' : 'Retour'}
          </button>

          <div className="mb-8 text-center lg:hidden">
            <div className="text-2xl font-black text-primary">AgriSupply.tn</div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            {isAr ? 'مرحباً بك' : 'Bienvenue'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isAr ? 'أدخل بياناتك للمتابعة' : 'Entrez vos informations pour continuer'}
          </p>

          <div className="mt-8 space-y-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={isAr ? 'الاسم / Prénom' : 'Prénom / الاسم'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={isAr ? 'الهاتف أو البريد / Téléphone ou email' : 'Téléphone ou email / الهاتف'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <button
              onClick={handleContinue}
              className="mt-2 w-full rounded-full bg-primary py-4 text-sm font-semibold text-white transition hover:bg-secondary"
            >
              {isAr ? 'متابعة' : 'Continuer'}
            </button>

            <div className="text-center text-xs text-slate-400">─── {isAr ? 'أو' : 'ou'} ───</div>

            <button
              onClick={handleGuest}
              className="w-full rounded-full border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              {isAr ? 'تسوق كضيف' : 'Commander sans compte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
