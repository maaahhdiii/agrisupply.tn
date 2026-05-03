import type { Product } from '../../types'
import Badge from '../ui/Badge'

const ProductsTable = () => {
  const products: Product[] = [
    {
      id: 'p-1',
      name_fr: 'Tomates cerises',
      name_ar: 'طماطم كرزية',
      price: 9.4,
      unit_fr: '1 kg',
      unit_ar: '1 كغ',
      category: 'légumes',
      image_url: '',
      stock_available: true
    },
    {
      id: 'p-2',
      name_fr: 'Olives verte',
      name_ar: 'زيتون أخضر',
      price: 12.8,
      unit_fr: '500 g',
      unit_ar: '500 غ',
      category: 'légumes',
      image_url: '',
      stock_available: true
    },
  ]

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/90 text-xs uppercase tracking-[0.2em] text-slate-500">
          <tr>
            <th className="px-6 py-4">Produit</th>
            <th className="px-6 py-4">Unite</th>
            <th className="px-6 py-4">Prix</th>
            <th className="px-6 py-4">Tag</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-white/70">
              <td className="px-6 py-4 font-semibold text-slate-900">
                {product.name_fr}
              </td>
              <td className="px-6 py-4 text-slate-600">{product.unit_fr}</td>
              <td className="px-6 py-4 text-slate-600">{product.price} TND</td>
              <td className="px-6 py-4">
                <Badge label={product.category} tone="green" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductsTable
