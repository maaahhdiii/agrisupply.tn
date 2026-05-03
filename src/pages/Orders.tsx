import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Order } from '../types'
import Badge from '../components/ui/Badge'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 2,
  }).format(value)

const statusTone = (status: string) => {
  switch (status) {
    case 'pending': return 'orange'
    case 'confirmed': return 'green'
    case 'delivered': return 'gray'
    case 'cancelled': return 'red'
    default: return 'gray'
  }
}

const Orders = () => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone.trim())
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data as Order[])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <h1 className="font-main text-3xl font-bold text-slate-900">
        {t('orders.title')}
      </h1>

      <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
        <input
          type="tel"
          placeholder="+216 XX XXX XXX"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-primary shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-white transition hover:bg-secondary disabled:opacity-70 shadow-sm sm:w-auto"
        >
          <Search size={18} />
          {locale === 'ar' ? 'بحث' : 'Rechercher'}
        </button>
      </form>

      {searched && orders.length === 0 && (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-slate-500">{t('orders.noOrders')}</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition hover:shadow-md">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  #{order.id.substring(0, 8).toUpperCase()}
                </p>
                <p className="font-semibold text-slate-900">
                  {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-TN' : 'fr-FR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }).format(new Date(order.created_at))}
                </p>
              </div>
              <Badge 
                label={t(`orders.status.${order.status}`)} 
                tone={statusTone(order.status) as any} 
              />
            </div>
            
            <div className="pt-4 flex justify-between items-center text-sm">
              <div className="text-slate-600">
                <span className="font-semibold">{t('checkout.deliveryDate')}: </span>
                <span>{order.delivery_date}</span>
                {order.is_recurring && (
                  <span className="ml-2 inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {locale === 'ar' ? 'متكرر' : 'Récurrent'}
                  </span>
                )}
              </div>
              <div className="font-bold text-lg text-primary">
                {formatCurrency(order.total_amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
