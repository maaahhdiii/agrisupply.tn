import type { Order } from '../../types'
import Badge from '../ui/Badge'

const statusTone = (status: Order['status']) => {
  if (status === 'delivered') return 'green'
  return 'gray'
}

const OrdersTable = () => {
  const orders: Order[] = [
    {
      id: 'ORD-1120',
      customer_name: 'Amina Trabelsi',
      customer_phone: '12345678',
      customer_address: 'Tunis',
      notes: '',
      total_amount: 158.6,
      status: 'delivered',
      delivery_date: '2026-05-05',
      is_recurring: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'ORD-1121',
      customer_name: 'Sami Ben Ali',
      customer_phone: '87654321',
      customer_address: 'Ariana',
      notes: '',
      total_amount: 94.2,
      status: 'pending',
      delivery_date: '2026-05-08',
      is_recurring: false,
      created_at: new Date().toISOString()
    },
  ]

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/90 text-xs uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-6 py-4">Order</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-white/70">
              <td className="px-6 py-4 font-semibold text-slate-900">
                {order.id}
              </td>
              <td className="px-6 py-4 text-slate-600">{order.customer_name}</td>
              <td className="px-6 py-4 text-slate-600">{order.delivery_date}</td>
              <td className="px-6 py-4 text-slate-600">{order.total_amount} TND</td>
              <td className="px-6 py-4">
                <Badge label={order.status} tone={statusTone(order.status)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable
