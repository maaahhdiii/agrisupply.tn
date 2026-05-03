import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TUNISIAN_GOVERNORATES } from '../../types/farmer'
import type { MatchResult, OrderMatch } from '../../types/farmer'
import { findMatchesForOrder, autoMatchOrder } from '../../lib/matchingEngine'
import Button from '../ui/Button'

interface MatchModalProps {
  order: {
    id: string
    customer_name: string
    customer_phone: string
    delivery_governorate?: string
    total_amount: number
    required_quantity_kg?: number
    order_items?: Array<{ product_id: string; quantity: number; product?: { name_fr?: string; name_ar?: string } }>
  }
  isOpen: boolean
  onClose: () => void
  onMatchCreated: () => void
}

export default function MatchModal({ order, isOpen, onClose, onMatchCreated }: MatchModalProps) {
  const [gov, setGov] = useState(order.delivery_governorate || 'Tunis')
  const [productId, setProductId] = useState(order.order_items?.[0]?.product_id || '')
  const [requiredKg, setRequiredKg] = useState(order.required_quantity_kg || order.order_items?.[0]?.quantity || 0)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<MatchResult[]>([])
  const [matches, setMatches] = useState<OrderMatch[]>([])

  const orderItems = order.order_items || []

  useEffect(() => {
    if (isOpen) {
      fetchCurrentMatches()
      if (orderItems.length > 0 && !productId) {
        setProductId(orderItems[0].product_id)
      }
    }
  }, [isOpen, orderItems, productId])

  const fetchCurrentMatches = async () => {
    const { data } = await supabase
      .from('order_matches')
      .select('*, farmer:farmers(*), farmer_crop:farmer_crops(*, product:products(*))')
      .eq('order_id', order.id)

    if (data) setMatches(data as OrderMatch[])
  }

  const handleSearch = async () => {
    if (!productId) return
    setSearching(true)
    const res = await findMatchesForOrder(productId, Number(requiredKg), gov)
    setResults(res)
    setSearching(false)
  }

  const handleAutoMatch = async () => {
    if (!orderItems.length) return
    setSearching(true)
    for (const item of orderItems) {
      await autoMatchOrder(order.id, item.product_id, Number(item.quantity) || 10, gov)
    }
    await fetchCurrentMatches()
    onMatchCreated()
    setSearching(false)
  }

  const handleAssign = async (result: MatchResult) => {
    const assignKg = Math.min(result.available_kg, requiredKg)
    await supabase.from('order_matches').insert({
      order_id: order.id,
      farmer_id: result.farmer.id,
      farmer_crop_id: result.crop.id,
      matched_quantity_kg: assignKg,
      status: 'proposed',
      match_score: result.match_score,
      distance_km: result.distance_km,
    })
    await fetchCurrentMatches()
    onMatchCreated()
  }

  const handleRemoveMatch = async (matchId: string) => {
    await supabase.from('order_matches').delete().eq('id', matchId)
    await fetchCurrentMatches()
    onMatchCreated()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2E7D32]">🔗 Matcher la commande #{order.id.slice(0, 8)}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        <div className="border border-[#2E7D32] rounded-xl p-4 mb-6 bg-[#F4F8F4]">
          <p><strong>Client:</strong> {order.customer_name}</p>
          <p><strong>Gouvernorat:</strong> {order.delivery_governorate || 'N/A'}</p>
          <p><strong>Total:</strong> {order.total_amount} TND</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1">Livraison</label>
            <select value={gov} onChange={e => setGov(e.target.value)} className="border rounded-md px-3 py-2">
              {TUNISIAN_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Produit</label>
            <select value={productId} onChange={e => setProductId(e.target.value)} className="border rounded-md px-3 py-2">
              {orderItems.map(item => (
                <option key={item.product_id} value={item.product_id}>
                  {item.product?.name_fr || item.product?.name_ar || item.product_id}
                </option>
              ))}
              {!orderItems.length && <option value="">Aucun produit</option>}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Qté (kg)</label>
            <input type="number" value={requiredKg} onChange={e => setRequiredKg(Number(e.target.value))} className="border rounded-md px-3 py-2 w-24" />
          </div>
          <Button onClick={handleSearch} disabled={searching || !productId}>🔍 Rechercher</Button>
          <Button onClick={handleAutoMatch} disabled={searching || !orderItems.length}>⚡ Auto-matcher</Button>
        </div>

        {searching && <div className="text-center py-4">Recherche en cours...</div>}

        {!searching && results.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Agriculteur</th>
                  <th className="p-2">Région</th>
                  <th className="p-2">Dispo (kg)</th>
                  <th className="p-2">Récolte</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Distance</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{r.farmer.name} <br/><span className="text-xs text-gray-500">{r.farmer.phone}</span></td>
                    <td className="p-2">{r.farmer.region}</td>
                    <td className="p-2">{r.available_kg}</td>
                    <td className="p-2">{r.crop.harvest_date || 'N/A'}</td>
                    <td className="p-2"><span className={`px-2 py-1 rounded-full text-xs border ${getScoreColor(r.match_score)}`}>{r.match_score}</span></td>
                    <td className="p-2">{r.distance_km} km</td>
                    <td className="p-2">
                      <button onClick={() => handleAssign(r)} className="bg-[#2E7D32] text-white px-3 py-1 rounded-md text-xs hover:bg-green-700">✓ Assigner</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="font-bold mb-4">Correspondances actuelles</h3>
          {matches.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune correspondance pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {matches.map(match => (
                <div key={match.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                  <div>
                    <span className="font-semibold">{match.farmer?.name}</span> - {match.matched_quantity_kg} kg
                    <span className="ml-3 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{match.status}</span>
                  </div>
                  <button onClick={() => handleRemoveMatch(match.id)} className="text-red-500 hover:text-red-700 text-sm">Retirer</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
