import { useTranslation } from 'react-i18next'
import { Leaf } from 'lucide-react'
import ProductGrid from '../components/products/ProductGrid'

const Market = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 pb-20">
      <section className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,_#2E7D32_0%,_#66BB6A_100%)] px-6 py-8 text-white shadow-lg md:h-48 md:py-10">
        <div className="absolute -right-10 -top-10 opacity-20">
          <Leaf size={160} />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-center">
          <h1 className="font-main text-3xl font-bold md:text-5xl">
            {t('home.title')}
          </h1>
          <p className="mt-2 max-w-xl text-sm opacity-90 md:text-base">
            {t('home.subtitle')}
          </p>
        </div>
      </section>

      <section>
        <ProductGrid />
      </section>
    </div>
  )
}

export default Market
