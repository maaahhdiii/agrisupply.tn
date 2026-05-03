import { Fragment, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import MatchModal from '../components/admin/MatchModal'
import Button from '../components/ui/Button'
import { TUNISIAN_GOVERNORATES } from '../types/farmer'
import type { Farmer, FarmerCrop, OrderMatch } from '../types/farmer'
import type { Product, Order } from '../types'
import { predictYield } from '../lib/matchingEngine'

type OrderWithItems = Order & {
  order_items?: Array<{ id: string; product_id: string; quantity: number; product?: Product }>
}

const statusColor = (status: string) => {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800'
  if (status === 'confirmed') return 'bg-green-100 text-green-800'
  if (status === 'delivered') return 'bg-slate-100 text-slate-600'
  return 'bg-red-100 text-red-800'
}

const scoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 border border-green-200'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
  if (score >= 40) return 'bg-orange-100 text-orange-800 border border-orange-200'
  return 'bg-red-100 text-red-800 border border-red-200'
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('admin_auth') === 'true')
  const [shake, setShake] = useState(false)
  const [activeTab, setActiveTab] = useState<'commandes' | 'agriculteurs' | 'correspondances' | 'produits'>('commandes')

  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [matches, setMatches] = useState<OrderMatch[]>([])
  const [productsList, setProductsList] = useState<Product[]>([])

  const [matchModalOrder, setMatchModalOrder] = useState<OrderWithItems | null>(null)
  const [farmerModalOpen, setFarmerModalOpen] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState<Partial<Farmer>>({})

  const [cropsModalFarmer, setCropsModalFarmer] = useState<Farmer | null>(null)
  const [farmerCrops, setFarmerCrops] = useState<FarmerCrop[]>([])
  const [newCrop, setNewCrop] = useState<Partial<FarmerCrop>>({})

  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({})

  const [searchFarmerTerm, setSearchFarmerTerm] = useState('')
  const [matchStatusFilter, setMatchStatusFilter] = useState<'all' | 'proposed' | 'confirmed' | 'rejected' | 'delivered'>('all')

  useEffect(() => {
    if (unlocked) {
      fetchData()
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [unlocked])

  const fetchData = async () => {
    await Promise.all([fetchOrders(), fetchFarmers(), fetchMatches(), fetchProducts()])
  }

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*, product:products(*))').order('created_at', { ascending: false })
    if (data) setOrders(data as OrderWithItems[])
  }

  const fetchFarmers = async () => {
    const { data } = await supabase.from('farmers').select('*, farmer_crops(*, product:products(*))').order('name')
    if (data) setFarmers(data as Farmer[])
  }

  const fetchMatches = async () => {
    const { data } = await supabase.from('order_matches').select('*, farmer:farmers(*), farmer_crop:farmer_crops(*, product:products(*)), order:orders(*)').order('created_at', { ascending: false })
    if (data) setMatches(data as OrderMatch[])
  }

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name_fr')
    if (data) setProductsList(data as Product[])
  }

  const handleUnlock = () => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setUnlocked(true)
      sessionStorage.setItem('admin_auth', 'true')
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleLogout = () => {
    setUnlocked(false)
    sessionStorage.removeItem('admin_auth')
  }

  const saveFarmer = async () => {
    const payload = {
      name: editingFarmer.name,
      phone: editingFarmer.phone,
      region: editingFarmer.region,
      governorate: editingFarmer.governorate,
      notes: editingFarmer.notes,
      is_active: editingFarmer.is_active ?? true,
    }

    if (editingFarmer.id) {
      await supabase.from('farmers').update(payload).eq('id', editingFarmer.id)
    } else {
      await supabase.from('farmers').insert(payload)
    }

    setFarmerModalOpen(false)
    setEditingFarmer({})
    fetchFarmers()
  }

  const deleteFarmer = async (id: string) => {
    if (confirm('Supprimer cet agriculteur ?')) {
      await supabase.from('farmers').delete().eq('id', id)
      fetchFarmers()
    }
  }

  const toggleFarmerActive = async (farmer: Farmer) => {
    await supabase.from('farmers').update({ is_active: !farmer.is_active }).eq('id', farmer.id)
    fetchFarmers()
  }

  const loadCropsForFarmer = async (farmer: Farmer) => {
    setCropsModalFarmer(farmer)
    const { data } = await supabase.from('farmer_crops').select('*, product:products(*)').eq('farmer_id', farmer.id).order('created_at', { ascending: true })
    if (data) setFarmerCrops(data as FarmerCrop[])
  }

  const saveCrop = async () => {
    if (!cropsModalFarmer || !newCrop.product_id || !newCrop.planted_quantity_kg) return
    const prod = productsList.find(p => p.id === newCrop.product_id)
    const predicted = predictYield(Number(newCrop.planted_quantity_kg), prod?.name_fr || '')

    await supabase.from('farmer_crops').insert({
      farmer_id: cropsModalFarmer.id,
      product_id: newCrop.product_id,
      planted_quantity_kg: Number(newCrop.planted_quantity_kg),
      harvest_date: newCrop.harvest_date,
      season: newCrop.season,
      notes: newCrop.notes,
      predicted_yield_kg: predicted,
      status: 'growing',
    })

    setNewCrop({})
    loadCropsForFarmer(cropsModalFarmer)
    fetchFarmers()
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    fetchOrders()
  }

  const confirmCancelOrder = async (orderId: string) => {
    if (confirm('Voulez-vous vraiment annuler cette commande ?')) {
      await updateOrderStatus(orderId, 'cancelled')
    }
  }

  const saveProduct = async () => {
    const payload = {
      name_fr: editingProduct.name_fr,
      name_ar: editingProduct.name_ar,
      price: editingProduct.price,
      unit_fr: editingProduct.unit_fr,
      unit_ar: editingProduct.unit_ar,
      category: editingProduct.category,
      description_fr: editingProduct.description_fr,
      description_ar: editingProduct.description_ar,
      stock_available: editingProduct.stock_available ?? true,
      image_url: editingProduct.image_url || '',
    }

    if (editingProduct.id) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id)
    } else {
      await supabase.from('products').insert(payload)
    }

    setEditingProduct({})
    setProductModalOpen(false)
    fetchProducts()
  }

  const toggleProductStock = async (product: Product) => {
    await supabase.from('products').update({ stock_available: !product.stock_available }).eq('id', product.id)
    fetchProducts()
  }

  const handleReject = async (match: OrderMatch) => {
    await updateMatchStatus(match.id, 'rejected')
    if (match.order) setMatchModalOrder(match.order as OrderWithItems)
  }

  const updateMatchStatus = async (id: string, status: string) => {
    await supabase.from('order_matches').update({ status }).eq('id', id)
    fetchMatches()
  }

  const exportMatchesCSV = () => {
    const rows = [
      ['Order ID', 'Client', 'Farmer', 'Phone', 'Product', 'Kg', 'Score', 'Distance', 'Status'],
      ...matches.map(match => [
        match.order?.id ?? '',
        match.order?.customer_name ?? '',
        match.farmer?.name ?? '',
        match.farmer?.phone ?? '',
        match.farmer_crop?.product?.name_fr ?? '',
        String(match.matched_quantity_kg),
        String(match.match_score),
        String(match.distance_km ?? ''),
        match.status,
      ]),
    ]

    const csvContent = rows.map(row => row.map(String).map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'correspondances.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredMatches = useMemo(() => {
    return matchStatusFilter === 'all' ? matches : matches.filter(match => match.status === matchStatusFilter)
  }, [matches, matchStatusFilter])

  const filteredFarmers = useMemo(() => {
    const query = searchFarmerTerm.toLowerCase()
    return farmers.filter(farmer => [farmer.name, farmer.phone, farmer.governorate, farmer.region].some(value => value?.toLowerCase().includes(query)))
  }, [farmers, searchFarmerTerm])

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F4]">
        <div className={`bg-white p-8 rounded-2xl shadow-md w-96 ${shake ? 'animate-shake' : ''}`}>
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2E7D32]">Panel Admin</h2>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-[#2E7D32]"
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          />
          <Button onClick={handleUnlock} className="w-full">Connexion</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F4F8F4] overflow-hidden text-sm md:text-base font-[Tajawal]">
      <div className="w-64 bg-[#1a5c1e] text-white flex flex-col hidden md:flex">
        <div className="p-6 font-bold text-xl border-b border-white/10">Admin AgriSupply</div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'commandes', icon: '📦', label: 'Commandes' },
            { id: 'agriculteurs', icon: '👨‍🌾', label: 'Agriculteurs' },
            { id: 'correspondances', icon: '🔗', label: 'Correspondances' },
            { id: 'produits', icon: '🌿', label: 'Produits' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === tab.id ? 'bg-white/20 font-semibold' : 'hover:bg-white/10'}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
          <a href="/farmers" className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors hover:bg-white/10 block">
            <span>🌾</span> Vue Agriculteurs
          </a>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-xl flex items-center gap-3">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
        <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2">
          {['commandes', 'agriculteurs', 'correspondances', 'produits'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${activeTab === tab ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'commandes' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Commandes</h1>
                <p className="text-sm text-gray-500 mt-1">Toutes les commandes et leurs correspondances d'agriculteurs.</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={fetchOrders} className="bg-gray-100 text-gray-800 border hover:bg-gray-200">Actualiser</Button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-500">
                  <tr>
                    <th className="px-4 py-4">ID</th>
                    <th className="px-4 py-4">Client</th>
                    <th className="px-4 py-4">Téléphone</th>
                    <th className="px-4 py-4">Gouvernorat</th>
                    <th className="px-4 py-4">Articles</th>
                    <th className="px-4 py-4">Qté(kg)</th>
                    <th className="px-4 py-4">Montant</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const orderQty = order.required_quantity_kg || order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
                    const assigned = matches.filter(match => match.order_id === order.id).reduce((sum, match) => sum + (match.matched_quantity_kg || 0), 0)
                    return (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-4 text-xs font-mono">{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-4">{order.customer_name}</td>
                        <td className="px-4 py-4">{order.customer_phone}</td>
                        <td className="px-4 py-4">{order.delivery_governorate || order.delivery_region || 'N/A'}</td>
                        <td className="px-4 py-4 max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">{order.order_items?.map(item => item.product?.name_fr || item.product?.name_ar || 'Produit').join(', ')}</td>
                        <td className="px-4 py-4">{orderQty}</td>
                        <td className="px-4 py-4 font-semibold">{order.total_amount} TND</td>
                        <td className="px-4 py-4">
                          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>{order.status}</div>
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className="h-2 rounded-full bg-[#2E7D32]" style={{ width: `${Math.min(orderQty > 0 ? (assigned / orderQty) * 100 : 0, 100)}%` }} />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">{assigned} / {orderQty} kg</p>
                        </td>
                        <td className="px-4 py-4 flex flex-wrap gap-2">
                          {order.status === 'pending' && (
                            <>
                              <button onClick={() => setMatchModalOrder(order)} className="rounded-xl bg-[#2E7D32] px-3 py-2 text-white text-xs hover:bg-green-700">🔗 Matcher</button>
                              <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="rounded-xl bg-green-100 px-3 py-2 text-green-800 text-xs">✓ Confirmer</button>
                              <button onClick={() => confirmCancelOrder(order.id)} className="rounded-xl bg-red-100 px-3 py-2 text-red-800 text-xs">✗ Annuler</button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'agriculteurs' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Gestion des Agriculteurs</h1>
                <p className="text-sm text-gray-500 mt-1">Recherchez, éditez et gérez les cultures des agriculteurs.</p>
              </div>
              <Button onClick={() => { setEditingFarmer({ is_active: true }); setFarmerModalOpen(true) }} className="bg-[#2E7D32]">＋ Ajouter</Button>
            </div>
            <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
              <input type="search" placeholder="Rechercher par nom, téléphone ou gouvernorat" value={searchFarmerTerm} onChange={e => setSearchFarmerTerm(e.target.value)} className="w-full md:max-w-md rounded-2xl border border-gray-200 px-4 py-3" />
            </div>
            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-500">
                  <tr>
                    <th className="px-4 py-4">Nom</th>
                    <th className="px-4 py-4">Téléphone</th>
                    <th className="px-4 py-4">Gouvernorat</th>
                    <th className="px-4 py-4">Cultures actives</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map(farmer => (
                    <Fragment key={farmer.id}>
                      <tr className="border-t hover:bg-gray-50">
                        <td className="px-4 py-4 font-semibold">{farmer.name}</td>
                        <td className="px-4 py-4">{farmer.phone}</td>
                        <td className="px-4 py-4"><span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">{farmer.governorate}</span></td>
                        <td className="px-4 py-4">{farmer.farmer_crops?.length || 0}</td>
                        <td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${farmer.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{farmer.is_active ? 'Actif' : 'Inactif'}</span></td>
                        <td className="px-4 py-4 flex flex-wrap gap-2">
                          <button onClick={() => { setEditingFarmer(farmer); setFarmerModalOpen(true) }} className="text-blue-600 text-xs font-semibold hover:underline">✎ Modifier</button>
                          <button onClick={() => loadCropsForFarmer(farmer)} className="text-green-600 text-xs font-semibold hover:underline">🌱 Cultures</button>
                          <button onClick={() => deleteFarmer(farmer.id)} className="text-red-600 text-xs font-semibold hover:underline">🗑 Supprimer</button>
                          <button onClick={() => toggleFarmerActive(farmer)} className="text-gray-700 text-xs font-semibold hover:underline">{farmer.is_active ? 'Désactiver' : 'Activer'}</button>
                        </td>
                      </tr>
                      {farmer.farmer_crops && farmer.farmer_crops.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              {farmer.farmer_crops.map(crop => (
                                <div key={crop.id} className="rounded-3xl border border-gray-200 bg-white p-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <div>
                                      <div className="font-semibold">{crop.product?.name_fr || crop.product?.name_ar || 'Produit'}</div>
                                      <div className="text-xs text-gray-500">Planté: {crop.planted_quantity_kg} kg</div>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${crop.status === 'ready' ? 'bg-green-100 text-green-800' : crop.status === 'growing' ? 'bg-blue-100 text-blue-800' : crop.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                      {crop.status}
                                    </span>
                                  </div>
                                  <div className="mt-3 text-xs text-slate-600">Récolte: {crop.harvest_date || 'N/A'}</div>
                                  <div className="mt-2 text-xs text-slate-700 font-semibold">Prévu: {crop.predicted_yield_kg || 0} kg</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'correspondances' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Correspondances Commandes ↔ Agriculteurs</h1>
                <p className="text-sm text-gray-500 mt-1">Visualisez les correspondances et confirmez les meilleurs matchs.</p>
              </div>
              <Button onClick={exportMatchesCSV} className="bg-[#2E7D32]">Exporter CSV</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm text-center">
                <div className="text-3xl font-bold text-gray-900">{matches.length}</div>
                <div className="text-sm text-gray-500">Total correspondances</div>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm text-center">
                <div className="text-3xl font-bold text-orange-600">{matches.filter(m => m.status === 'proposed').length}</div>
                <div className="text-sm text-gray-500">Proposées</div>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm text-center">
                <div className="text-3xl font-bold text-green-600">{matches.filter(m => m.status === 'confirmed').length}</div>
                <div className="text-sm text-gray-500">Confirmées</div>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm text-center">
                <div className="text-3xl font-bold text-gray-900">{matches.length ? Math.round((matches.filter(m => m.status === 'confirmed').length / matches.length) * 100) : 0}%</div>
                <div className="text-sm text-gray-500">Taux de satisfaction</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              {['all', 'proposed', 'confirmed', 'rejected', 'delivered'].map(option => (
                <button key={option} onClick={() => setMatchStatusFilter(option as any)} className={`rounded-full px-4 py-2 text-sm ${matchStatusFilter === option ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {option === 'all' ? 'Toutes' : option}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-[0.18em] text-gray-500">
                  <tr>
                    <th className="px-4 py-4">Order ID</th>
                    <th className="px-4 py-4">Client</th>
                    <th className="px-4 py-4">Agriculteur</th>
                    <th className="px-4 py-4">Téléphone</th>
                    <th className="px-4 py-4">Produit</th>
                    <th className="px-4 py-4">Qté(kg)</th>
                    <th className="px-4 py-4">Score</th>
                    <th className="px-4 py-4">Distance</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map(match => (
                    <tr key={match.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-4 text-xs font-mono">{match.order?.id?.slice(0, 8)}</td>
                      <td className="px-4 py-4">{match.order?.customer_name || 'N/A'}</td>
                      <td className="px-4 py-4">{match.farmer?.name || 'N/A'}</td>
                      <td className="px-4 py-4">{match.farmer?.phone || 'N/A'}</td>
                      <td className="px-4 py-4">{match.farmer_crop?.product?.name_fr || match.farmer_crop?.product?.name_ar || 'N/A'}</td>
                      <td className="px-4 py-4">{match.matched_quantity_kg}</td>
                      <td className="px-4 py-4"><span className={`${scoreColor(match.match_score)} inline-flex rounded-full px-2 py-1 text-[11px] font-semibold`}>{match.match_score}</span></td>
                      <td className="px-4 py-4">{match.distance_km ?? 'N/A'} km</td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${match.status === 'proposed' ? 'bg-blue-100 text-blue-800' : match.status === 'confirmed' ? 'bg-green-100 text-green-800' : match.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{match.status}</span></td>
                      <td className="px-4 py-4 flex flex-wrap gap-2">
                        {match.status !== 'confirmed' && <button onClick={() => updateMatchStatus(match.id, 'confirmed')} className="rounded-xl bg-green-100 px-3 py-2 text-green-800 text-xs">✓ Confirmer</button>}
                        {match.status !== 'rejected' && <button onClick={() => handleReject(match)} className="rounded-xl bg-red-100 px-3 py-2 text-red-800 text-xs">✗ Rejeter</button>}
                        {match.farmer?.phone && <a href={`tel:${match.farmer.phone}`} className="rounded-xl bg-gray-100 px-3 py-2 text-gray-700 text-xs">📞 Appeler</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'produits' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Produits</h1>
                <p className="text-sm text-gray-500 mt-1">Gérez l'inventaire des produits disponibles.</p>
              </div>
              <Button onClick={() => { setEditingProduct({ stock_available: true }); setProductModalOpen(true) }} className="bg-[#2E7D32]">＋ Ajouter un produit</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {productsList.map(product => (
                <div key={product.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name_fr}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <button onClick={() => toggleProductStock(product)} className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stock_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {product.stock_available ? 'En stock' : 'Rupture'}
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{product.description_fr || product.description_ar || 'Aucune description'}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{product.unit_fr}</span>
                    <span className="font-semibold">{product.price} TND</span>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={() => { setEditingProduct(product); setProductModalOpen(true) }} className="rounded-xl bg-[#2E7D32] px-3 py-2 text-white text-xs">✎ Modifier</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {productModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editingProduct.id ? 'Modifier un produit' : 'Ajouter un produit'}</h2>
                <button onClick={() => setProductModalOpen(false)} className="text-gray-500 hover:text-black">✕</button>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nom (FR)</label>
                  <input value={editingProduct.name_fr || ''} onChange={e => setEditingProduct({ ...editingProduct, name_fr: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nom (AR)</label>
                  <input value={editingProduct.name_ar || ''} onChange={e => setEditingProduct({ ...editingProduct, name_ar: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Prix</label>
                    <input type="number" value={editingProduct.price ?? ''} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Unité (FR)</label>
                    <input value={editingProduct.unit_fr || ''} onChange={e => setEditingProduct({ ...editingProduct, unit_fr: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Catégorie</label>
                    <input value={editingProduct.category || ''} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">URL Image</label>
                    <input value={editingProduct.image_url || ''} onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Description (FR)</label>
                  <textarea value={editingProduct.description_fr || ''} onChange={e => setEditingProduct({ ...editingProduct, description_fr: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" rows={3} />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="productStock" checked={editingProduct.stock_available ?? true} onChange={e => setEditingProduct({ ...editingProduct, stock_available: e.target.checked })} className="h-4 w-4" />
                  <label htmlFor="productStock" className="text-sm">En stock</label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="secondary" onClick={() => setProductModalOpen(false)}>Annuler</Button>
                  <Button onClick={saveProduct}>Sauvegarder</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {matchModalOrder && (
          <MatchModal
            order={matchModalOrder}
            isOpen={Boolean(matchModalOrder)}
            onClose={() => setMatchModalOrder(null)}
            onMatchCreated={() => { fetchMatches(); fetchOrders() }}
          />
        )}

        {farmerModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingFarmer.id ? 'Modifier Agriculteur' : 'Ajouter Agriculteur'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nom complet</label>
                  <input type="text" value={editingFarmer.name || ''} onChange={e => setEditingFarmer({ ...editingFarmer, name: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Téléphone</label>
                  <input type="text" value={editingFarmer.phone || ''} onChange={e => setEditingFarmer({ ...editingFarmer, phone: e.target.value })} placeholder="+216..." className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Gouvernorat</label>
                  <select value={editingFarmer.governorate || ''} onChange={e => setEditingFarmer({ ...editingFarmer, governorate: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3">
                    <option value="">Sélectionner...</option>
                    {TUNISIAN_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Région (Détail)</label>
                  <input type="text" value={editingFarmer.region || ''} onChange={e => setEditingFarmer({ ...editingFarmer, region: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Notes</label>
                  <textarea value={editingFarmer.notes || ''} onChange={e => setEditingFarmer({ ...editingFarmer, notes: e.target.value })} className="w-full rounded-2xl border border-gray-200 px-4 py-3" rows={4} />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="active" checked={editingFarmer.is_active ?? true} onChange={e => setEditingFarmer({ ...editingFarmer, is_active: e.target.checked })} className="h-4 w-4" />
                  <label htmlFor="active" className="text-sm">Actif</label>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setFarmerModalOpen(false)}>Annuler</Button>
                  <Button onClick={saveFarmer}>Sauvegarder</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {cropsModalFarmer && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold">Cultures de {cropsModalFarmer.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Gérez et ajoutez des cultures pour cet agriculteur.</p>
                </div>
                <button onClick={() => setCropsModalFarmer(null)} className="text-gray-500 hover:text-black">✕</button>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                <h3 className="font-semibold mb-3">＋ Ajouter une culture</h3>
                <div className="flex gap-3 flex-wrap items-end">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Produit</label>
                    <select value={newCrop.product_id || ''} onChange={e => setNewCrop({ ...newCrop, product_id: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm">
                      <option value="">Sélectionner...</option>
                      {productsList.map(p => <option key={p.id} value={p.id}>{p.name_fr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Planté (kg)</label>
                    <input type="number" value={newCrop.planted_quantity_kg || ''} onChange={e => setNewCrop({ ...newCrop, planted_quantity_kg: Number(e.target.value) })} className="border rounded-md px-2 py-1.5 text-sm w-24" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Récolte</label>
                    <input type="date" value={newCrop.harvest_date || ''} onChange={e => setNewCrop({ ...newCrop, harvest_date: e.target.value })} className="border rounded-md px-2 py-1.5 text-sm" />
                  </div>
                  <Button onClick={saveCrop} disabled={!newCrop.product_id || !newCrop.planted_quantity_kg} className="bg-[#2E7D32] py-1.5 px-4 h-[34px] flex items-center">Ajouter</Button>
                </div>
              </div>

              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">Produit</th>
                    <th className="p-2">Planté (kg)</th>
                    <th className="p-2">Prévu (kg)</th>
                    <th className="p-2">Récolte</th>
                    <th className="p-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerCrops.map(crop => (
                    <tr key={crop.id} className="border-t">
                      <td className="p-2">{(crop as any).product?.name_fr || 'Produit'}</td>
                      <td className="p-2">{crop.planted_quantity_kg}</td>
                      <td className="p-2 font-semibold text-green-700">{crop.predicted_yield_kg ?? '—'}</td>
                      <td className="p-2">{crop.harvest_date || '-'}</td>
                      <td className="p-2">
                        <select
                          value={crop.status}
                          onChange={async e => {
                            await supabase.from('farmer_crops').update({ status: e.target.value }).eq('id', crop.id)
                            loadCropsForFarmer(cropsModalFarmer)
                          }}
                          className={`text-xs rounded-full px-2 py-1 border ${
                            crop.status === 'growing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            crop.status === 'ready' ? 'bg-green-100 text-green-800 border-green-200' :
                            crop.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <option value="growing">growing</option>
                          <option value="ready">ready</option>
                          <option value="harvested">harvested</option>
                          <option value="failed">failed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {farmerCrops.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-500">Aucune culture enregistrée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
