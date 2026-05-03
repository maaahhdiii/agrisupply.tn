import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { supabase } from '../lib/supabase'
import { getNextDeliveryDate } from '../lib/recurring'
import ScheduleSelector from '../components/schedule/ScheduleSelector'

const DELIVERY_FEE = 5.0

const Checkout = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isScheduled = searchParams.get('scheduled') === 'true'

  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.totalPrice())
  const clearCart = useCartStore((state) => state.clearCart)
  const locale = useCartStore((state) => state.locale)

  const isRtl = i18n.language === 'ar'
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  
  const [isRecurring, setIsRecurring] = useState(isScheduled)
  const [frequency, setFrequency] = useState<'weekly'|'monthly'>('weekly')
  const [dayOfWeek, setDayOfWeek] = useState(1) // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (items.length === 0 && !success) {
      navigate('/cart')
    }
  }, [items, success, navigate])

  const getMinMaxDates = () => {
    const min = new Date()
    min.setDate(min.getDate() + 1)
    const max = new Date()
    max.setDate(max.getDate() + 7)
    return {
      min: min.toISOString().split('T')[0],
      max: max.toISOString().split('T')[0]
    }
  }

  const handleScheduleChange = (updates: any) => {
    if (updates.isRecurring !== undefined) setIsRecurring(updates.isRecurring)
    if (updates.frequency !== undefined) setFrequency(updates.frequency)
    if (updates.dayOfWeek !== undefined) setDayOfWeek(updates.dayOfWeek)
    if (updates.dayOfMonth !== undefined) setDayOfMonth(updates.dayOfMonth)
  }

  const validate = () => {
    const newErrors: Record<string, boolean> = {
      name: !name.trim(),
      phone: !phone.trim(),
      address: !address.trim(),
      deliveryDate: !isRecurring && !deliveryDate
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const finalTotal = totalPrice + DELIVERY_FEE
      const finalDeliveryDate = isRecurring
        ? getNextDeliveryDate(frequency, dayOfWeek, dayOfMonth).toISOString().split('T')[0]
        : deliveryDate

      // 1. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          notes,
          total_amount: finalTotal,
          delivery_date: finalDeliveryDate,
          is_recurring: isRecurring,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError
      const orderId = orderData.id

      // 2. Insert Order Items
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Insert Schedule if recurring
      if (isRecurring) {
        // Insert a schedule row per item, or a single row? 
        // The schema for schedules: customer_name, customer_phone, customer_address, product_id, quantity, frequency, day_of_week, day_of_month, next_order_date
        const schedules = items.map(item => ({
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          product_id: item.product.id,
          quantity: item.quantity,
          frequency,
          day_of_week: dayOfWeek,
          day_of_month: dayOfMonth,
          next_order_date: finalDeliveryDate
        }))

        const { error: schedError } = await supabase
          .from('schedules')
          .insert(schedules)

        if (schedError) throw schedError
      }

      setOrderNumber(orderId.substring(0, 8).toUpperCase())
      clearCart()
      setSuccess(true)

    } catch (err) {
      console.error('Error submitting order:', err)
      alert('Error submitting order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-primary">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {locale === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Votre commande est en route!'}
        </h2>
        <p className="mt-2 text-slate-500">
          {locale === 'ar' ? 'رقم الطلب:' : 'Numéro de commande:'} <strong className="text-slate-900">#{orderNumber}</strong>
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-8 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-secondary"
        >
          {t('nav.home')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-slate-50"
        >
          <BackIcon size={20} className="text-slate-700" />
        </button>
        <h1 className="font-main text-2xl font-bold text-slate-900">
          {t('checkout.title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t('checkout.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none transition focus:border-primary ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t('checkout.phone')}
            </label>
            <input
              type="tel"
              placeholder="+216 XX XXX XXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={`w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none transition focus:border-primary ${errors.phone ? 'border-red-400' : 'border-slate-200'}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t('checkout.address')}
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              className={`w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none transition focus:border-primary ${errors.address ? 'border-red-400' : 'border-slate-200'}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t('checkout.notes')}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <ScheduleSelector
          isRecurring={isRecurring}
          frequency={frequency}
          dayOfWeek={dayOfWeek}
          dayOfMonth={dayOfMonth}
          onChange={handleScheduleChange}
          locale={locale}
        />

        {!isRecurring && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t('checkout.deliveryDate')}
            </label>
            <input
              type="date"
              min={getMinMaxDates().min}
              max={getMinMaxDates().max}
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
              className={`w-full rounded-xl border bg-slate-50 p-3 text-sm outline-none transition focus:border-primary ${errors.deliveryDate ? 'border-red-400' : 'border-slate-200'}`}
            />
          </div>
        )}

        <div className="rounded-2xl border border-primary bg-[#e7f5ea] p-4 text-center">
          <p className="font-semibold text-primary">
            💵 {locale === 'ar' ? 'الدفع عند التسليم' : 'Paiement à la livraison'}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-4 font-bold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? '...' : t('checkout.submit')}
        </button>
      </form>
    </div>
  )
}

export default Checkout
