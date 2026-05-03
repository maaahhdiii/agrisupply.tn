import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../store/cartStore'

const productsPreview = [
  {
    name: 'Tomates طماطم',
    price: '8.000 TND',
    unit: 'carton/كرتون',
    img: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=300',
  },
  {
    name: 'Oranges برتقال',
    price: '20.000 TND',
    unit: 'carton/كرتون',
    img: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300',
  },
  {
    name: 'Pommes de terre بطاطا',
    price: '15.000 TND',
    unit: 'sac/كيس',
    img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
  },
  {
    name: 'Oignons بصل',
    price: '10.000 TND',
    unit: 'sac/كيس',
    img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300',
  },
  {
    name: 'Fraises فراولة',
    price: '35.000 TND',
    unit: 'carton/كرتون',
    img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300',
  },
  {
    name: 'Carottes جزر',
    price: '9.000 TND',
    unit: 'sac/كيس',
    img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300',
  },
]

const Landing = () => {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const locale = useCartStore((state) => state.locale)
  const setLocale = useCartStore((state) => state.setLocale)
  const [isScrolled, setIsScrolled] = useState(false)
  const featureRef = useRef<HTMLDivElement | null>(null)

  const isAr = locale === 'ar'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  const toggleLanguage = () => {
    const next = locale === 'ar' ? 'fr' : 'ar'
    setLocale(next)
    i18n.changeLanguage(next)
  }

  const scrollToFeatures = () => {
    featureRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const heroTitle = useMemo(() => {
    return isAr ? 'سوق الفلاحة\nالتونسية' : 'Le Souk Agricole\nTunisien'
  }, [isAr])

  return (
    <div className="bg-white text-slate-900">
      <header
        className={`fixed left-0 top-0 z-50 h-[70px] w-full transition ${
          isScrolled
            ? 'bg-white/90 shadow-md backdrop-blur border-b border-slate-100'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className={`inline-flex h-7 w-7 items-center justify-center ${isScrolled ? 'text-primary' : 'text-white'}`}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C7 3 3.5 7 3.5 11.5c0 4 3 7.5 8.5 9.5 5.5-2 8.5-5.5 8.5-9.5C20.5 7 17 3 12 3zm-2.5 9.5c0-2.5 2-4.5 4.5-4.5-1 1.2-1.5 2.6-1.5 4.1 0 2.2 1 4.1 2.7 5.4-3.3-1.3-5.7-3.4-5.7-5z" />
              </svg>
            </span>
            <span className={`${isScrolled ? 'text-slate-900' : 'text-white'}`}>AgriSupply.tn</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isScrolled
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-white/15 text-white backdrop-blur'
              }`}
            >
              🌐 AR | FR
            </button>
            <button
              onClick={() => navigate('/login')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                isScrolled
                  ? 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'border border-white/40 text-white hover:bg-white/10'
              }`}
            >
              {isAr ? 'Connexion' : 'Connexion'}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-secondary"
            >
              {isAr ? "S'inscrire" : "S'inscrire"}
            </button>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,_#0a2e0c_0%,_#1a5c1e_50%,_#0d1f0e_100%)] pt-[70px] text-white">
        <div className="absolute inset-0">
          <div className="absolute left-[-80px] top-[-60px] h-72 w-72 rounded-full bg-[#66BB6A] opacity-[0.08] blur-3xl animate-blob"></div>
          <div className="absolute right-[-60px] top-[20%] h-80 w-80 rounded-full bg-[#4CAF50] opacity-[0.08] blur-3xl animate-blob-delay-2"></div>
          <div className="absolute bottom-[-80px] left-[20%] h-96 w-96 rounded-full bg-[#2E7D32] opacity-[0.08] blur-3xl animate-blob-delay-4"></div>
          {[...Array(20)].map((_, idx) => (
            <span
              key={`star-${idx}`}
              className="absolute h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse"
              style={{
                left: `${(idx * 17) % 100}%`,
                top: `${(idx * 23) % 100}%`,
                animationDelay: `${idx * 0.2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <span className="mb-6 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur">
            🌿 Frais du jour — طازج اليوم
          </span>
          <h1 className="whitespace-pre-line text-[44px] font-black leading-tight sm:text-[64px] lg:text-[80px]">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-[560px] text-base text-emerald-200 sm:text-lg">
            {isAr
              ? 'منتجات طازجة مباشرة من المزارع إلى بابك. تجربة تسوق فاخرة بلمسة تونسية أصيلة.'
              : 'Produits frais directement des fermes jusqu’à votre porte. Une expérience premium, 100% tunisienne.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-white px-8 py-4 text-base font-bold text-primary transition hover:scale-105"
            >
              {isAr ? 'تسوق الآن' : 'Commencer'}
            </button>
            <button
              onClick={scrollToFeatures}
              className="rounded-full border border-white/70 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              {isAr ? 'اكتشف المزيد' : 'En savoir plus'}
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              '📦 1,200+ طلب',
              '🌾 85 مزارع شريك',
              '🥦 40+ منتج طازج',
            ].map((pill) => (
              <span
                key={pill}
                className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white"
        >
          <ChevronDown size={28} className="animate-bounce-soft" />
        </button>
      </section>

      <section ref={featureRef} className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              {isAr ? 'لماذا AgriSupply؟' : 'Pourquoi AgriSupply ?'}
            </h2>
            <p className="mt-3 text-base text-slate-500">
              {isAr
                ? 'منصة فاخرة تجمع بين الجودة والسرعة والدفع الآمن.'
                : 'Une plateforme premium qui rassemble qualité, rapidité et sécurité.'}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '🌿',
                title: isAr ? 'منتجات طازجة' : 'Produits frais',
                desc: isAr
                  ? 'مباشرة من المزارع التونسية'
                  : 'Directement des fermes',
                delay: 0,
              },
              {
                icon: '🚚',
                title: isAr ? 'توصيل سريع' : 'Livraison rapide',
                desc: isAr ? 'خلال 24 ساعة' : 'En moins de 24h',
                delay: 100,
              },
              {
                icon: '🔄',
                title: isAr ? 'طلب متكرر' : 'Récurrent',
                desc: isAr ? 'أسبوعي أو شهري' : 'Hebdo ou mensuel',
                delay: 200,
              },
              {
                icon: '💵',
                title: isAr ? 'الدفع عند التسليم' : 'Paiement à la livraison',
                desc: isAr ? 'لا مخاطر' : 'Zéro risque',
                delay: 300,
              },
            ].map((card) => (
              <div
                key={card.title}
                className="feature-card rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-lg"
                style={{ transitionDelay: `${card.delay}ms` }}
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-400 text-2xl">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8F4] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            {isAr ? 'كيف يعمل؟' : 'Comment ça marche ?'}
          </h2>

          <div className="relative mt-16">
            <div className="pointer-events-none absolute left-10 right-10 top-10 hidden border-t border-dashed border-emerald-300 lg:block"></div>
            <div className="grid gap-10 lg:grid-cols-4">
              {[
                {
                  icon: '🛒',
                  title: isAr ? 'تصفح' : 'Parcourez',
                  desc: isAr ? 'اختر منتجاتك' : 'Choisissez vos produits',
                },
                {
                  icon: '➕',
                  title: isAr ? 'أضف' : 'Ajoutez',
                  desc: isAr ? 'أضف إلى سلتك' : 'Ajoutez au panier',
                },
                {
                  icon: '📅',
                  title: isAr ? 'جدول' : 'Planifiez',
                  desc: isAr ? 'حدد موعد التسليم' : 'Choisissez la date',
                },
                {
                  icon: '📦',
                  title: isAr ? 'استقبل' : 'Recevez',
                  desc: isAr ? 'توصيل لبابك' : 'Livraison chez vous',
                },
              ].map((step, idx) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                  <div className="mt-5 text-5xl">{step.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            {isAr ? 'منتجاتنا الطازجة' : 'Nos produits frais'}
          </h2>

          <div className="scroll-hide mt-12 flex gap-6 overflow-x-auto pb-4">
            {productsPreview.map((product) => (
              <div
                key={product.name}
                className="min-w-[200px] overflow-hidden rounded-2xl bg-white shadow-md"
              >
                <img src={product.img} alt={product.name} className="h-40 w-full object-cover" />
                <div className="p-3">
                  <h3 className="text-sm font-bold text-slate-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-primary">{product.price}</p>
                  <p className="text-xs text-slate-400">{product.unit}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-primary px-8 py-4 text-base font-bold text-white transition hover:bg-secondary"
            >
              {isAr ? 'سجل لترى الكل' : 'Voir tous les produits'}
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a2e0c] py-12 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="inline-flex h-7 w-7 items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C7 3 3.5 7 3.5 11.5c0 4 3 7.5 8.5 9.5 5.5-2 8.5-5.5 8.5-9.5C20.5 7 17 3 12 3zm-2.5 9.5c0-2.5 2-4.5 4.5-4.5-1 1.2-1.5 2.6-1.5 4.1 0 2.2 1 4.1 2.7 5.4-3.3-1.3-5.7-3.4-5.7-5z" />
                </svg>
              </span>
              <span>AgriSupply.tn</span>
            </div>
            <p className="mt-3 text-sm text-emerald-100">
              {isAr
                ? 'منصة فاخرة للمنتجات الفلاحية التونسية'
                : 'La marketplace premium des produits agricoles tunisiens'}
            </p>
            <p className="mt-6 text-xs text-emerald-200">© 2025 AgriSupply.tn</p>
          </div>

          <div className="text-sm text-emerald-100">
            <p className="mb-3 font-semibold text-white">{isAr ? 'روابط' : 'Liens'}</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/')} className="text-left hover:text-white">
                {isAr ? 'Accueil' : 'Accueil'}
              </button>
              <button onClick={() => navigate('/home')} className="text-left hover:text-white">
                {isAr ? 'Marché' : 'Marché'}
              </button>
              <button onClick={() => navigate('/orders')} className="text-left hover:text-white">
                {isAr ? 'Mes commandes' : 'Mes commandes'}
              </button>
              <span>{isAr ? 'Contact' : 'Contact'}</span>
            </div>
          </div>

          <div className="text-sm text-emerald-100">
            <p className="mb-3 font-semibold text-white">{isAr ? 'صنع في تونس' : 'Made in Tunisia'}</p>
            <div className="flex items-center gap-3 text-xl">
              <span>🇹🇳</span>
              <span className="h-8 w-8 rounded-full bg-white/10"></span>
              <span className="h-8 w-8 rounded-full bg-white/10"></span>
              <span className="h-8 w-8 rounded-full bg-white/10"></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
