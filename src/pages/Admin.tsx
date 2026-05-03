import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ProductsTable from '../components/admin/ProductsTable'
import MatchModal from '../components/admin/MatchModal'
import Button from '../components/ui/Button'
import { TUNISIAN_GOVERNORATES } from '../types/farmer'
import type { Farmer, FarmerCrop, OrderMatch } from '../types/farmer'
import { predictYield } from '../lib/matchingEngine'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('admin_auth') === 'true')
  const [shake, setShake] = useState(false)
  const [activeTab, setActiveTab] = useState<'commandes' | 'agriculteurs' | 'correspondances' | 'produits'>('commandes')

  // Data states
  const [orders, setOrders] = useState<any[]>([])
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [matches, setMatches] = useState<OrderMatch[]>([])
  const [productsList, setProductsList] = useState<any[]>([])
  
  // Modals state
  const [matchModalOrder, setMatchModalOrder] = useState<any | null>(null)
  
  const [farmerModalOpen, setFarmerModalOpen] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState<Partial<Farmer>>({})
  
  const [cropsModalFarmer, setCropsModalFarmer] = useState<Farmer | null>(null)
  const [farmerCrops, setFarmerCrops] = useState<FarmerCrop[]>([])
  const [newCrop, setNewCrop] = useState<Partial<FarmerCrop>>({})

  useEffect(() => {
    if (unlocked) {
      fetchData()
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [unlocked])

  const fetchData = async () => {
    fetchOrders()
    fetchFarmers()
    fetchMatches()
    fetchProducts()
  }

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false })
    if (data) setOrders(data)
  }

  const fetchFarmers = async () => {
    const { data } = await supabase.from('farmers').select('*, farmer_crops(*, product:products(*))').order('name')
    if (data) setFarmers(data)
  }

  const fetchMatches = async () => {
    const { data } = await supabase.from('order_matches').select('*, farmer:farmers(*), farmer_crop:farmer_crops(*, product:products(*)), order:orders(*)').order('created_at', { ascending: false })
    if (data) setMatches(data as any)
  }
  
  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*')
    if (data) setProductsList(data)
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
    if (editingFarmer.id) {
      await supabase.from('farmers').update(editingFarmer).eq('id', editingFarmer.id)
    } else {
      await supabase.from('farmers').insert(editingFarmer)
    }
    setFarmerModalOpen(false)
    fetchFarmers()
  }
  
  const deleteFarmer = async (id: string) => {
    if(confirm('Supprimer cet agriculteur ?')) {
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
    const { data } = await supabase.from('farmer_crops').select('*, product:products(*)').eq('farmer_id', farmer.id)
    if (data) setFarmerCrops(data as any)
  }

  const saveCrop = async () => {
    if (!cropsModalFarmer || !newCrop.product_id || !newCrop.planted_quantity_kg) return
    const prod = productsList.find(p => p.id === newCrop.product_id)
    const predicted = predictYield(Number(newCrop.planted_quantity_kg), prod?.name_fr || '')
    
    await supabase.from('farmer_crops').insert({
      ...newCrop,
      farmer_id: cropsModalFarmer.id,
      predicted_yield_kg: predicted,
      status: 'growing'
    })
    setNewCrop({})
    loadCropsForFarmer(cropsModalFarmer)
    fetchFarmers()
  }
  
  const updateMatchStatus = async (id: string, status: string) => {
    await supabase.from('order_matches').update({ status }).eq('id', id)
    fetchMatches()
  }

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
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
        
        {/* Mobile Nav */}
        <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2">
          {['commandes', 'agriculteurs', 'correspondances', 'produits'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-full capitalize whitespace-nowrap ${activeTab === tab ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* TAB: COMMANDES */}
        {activeTab === 'commandes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Commandes</h1>
              <Button onClick={fetchOrders} className="bg-gray-100 text-gray-800 border hover:bg-gray-200">Actualiser</Button>
            </div>
            {/* Keeping it simple instead of full OrdersTable since it was mocked */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 text-left border-b text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Tél</th>
                    <th className="p-4">Gouvernorat</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-xs font-mono">{order.id.slice(0,8)}</td>
                      <td className="p-4">{order.customer_name}</td>
                      <td className="p-4">{order.customer_phone}</td>
                      <td className="p-4">{order.delivery_governorate || 'N/A'}</td>
                      <td className="p-4 font-semibold">{order.total_amount} TND</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{order.status}</span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {order.status === 'pending' && (
                          <button onClick={() => setMatchModalOrder(order)} className="px-3 py-1 bg-[#2E7D32] text-white rounded-lg text-xs hover:bg-green-700">
                            🔗 Matcher
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: AGRICULTEURS */}
        {activeTab === 'agriculteurs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gestion des Agriculteurs</h1>
              <Button onClick={() => { setEditingFarmer({ is_active: true }); setFarmerModalOpen(true) }} className="bg-[#2E7D32]">
                ＋ Ajouter
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                  <tr>
                    <th className="p-4">Nom</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Gouvernorat</th>
                    <th className="p-4">Actif</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map(farmer => (
                    <tr key={farmer.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold">{farmer.name}</td>
                      <td className="p-4">{farmer.phone}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{farmer.governorate}</span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleFarmerActive(farmer)} className={`w-10 h-5 rounded-full relative transition-colors ${farmer.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${farmer.is_active ? 'left-5' : 'left-1'}`}></div>
                        </button>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => { setEditingFarmer(farmer); setFarmerModalOpen(true) }} className="text-blue-600 hover:underline">✎ Modifier</button>
                        <button onClick={() => loadCropsForFarmer(farmer)} className="text-green-600 hover:underline">🌱 Cultures</button>
                        <button onClick={() => deleteFarmer(farmer.id)} className="text-red-600 hover:underline">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CORRESPONDANCES */}
        {activeTab === 'correspondances' && (
          <div>
             <h1 className="text-2xl font-bold mb-6">Correspondances Commandes ↔ Agriculteurs</h1>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
                  <div className="text-3xl font-bold text-gray-800">{matches.length}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
                  <div className="text-3xl font-bold text-orange-500">{matches.filter(m => m.status === 'proposed').length}</div>
                  <div className="text-sm text-gray-500">Proposées</div>
                </div>
                <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
                  <div className="text-3xl font-bold text-green-500">{matches.filter(m => m.status === 'confirmed').length}</div>
                  <div className="text-sm text-gray-500">Confirmées</div>
                </div>
             </div>

             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b">
                  <tr>
                    <th className="p-4">Commande</th>
                    <th className="p-4">Agriculteur</th>
                    <th className="p-4">Produit</th>
                    <th className="p-4">Qté</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(match => (
                    <tr key={match.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-xs font-mono">{(match as any).order?.id?.slice(0,8)}</td>
                      <td className="p-4">{match.farmer?.name} <br/><span className="text-xs text-gray-500">{match.farmer?.phone}</span></td>
                      <td className="p-4">{(match as any).farmer_crop?.product?.name_fr || 'Produit'}</td>
                      <td className="p-4 font-semibold">{match.matched_quantity_kg} kg</td>
                      <td className="p-4">{match.match_score}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          match.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          match.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>{match.status}</span>
                      </td>
                      <td className="p-4 flex gap-2">
                        {match.status === 'proposed' && (
                          <>
                            <button onClick={() => updateMatchStatus(match.id, 'confirmed')} className="text-green-600 font-bold">✓</button>
                            <button onClick={() => updateMatchStatus(match.id, 'rejected')} className="text-red-600 font-bold">✗</button>
                          </>
                        )}
                        <a href={`tel:${match.farmer?.phone}`} className="text-blue-600">📞</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PRODUITS */}
        {activeTab === 'produits' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Produits</h1>
            <ProductsTable />
          </div>
        )}

      </div>

      {/* Modals */}
      {matchModalOrder && (
        <MatchModal 
          order={matchModalOrder} 
          isOpen={!!matchModalOrder} 
          onClose={() => setMatchModalOrder(null)} 
          onMatchCreated={() => { fetchMatches(); fetchOrders(); }}
        />
      )}

      {farmerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingFarmer.id ? 'Modifier Agriculteur' : 'Ajouter Agriculteur'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nom complet</label>
                <input type="text" value={editingFarmer.name || ''} onChange={e => setEditingFarmer({...editingFarmer, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Téléphone</label>
                <input type="text" value={editingFarmer.phone || ''} onChange={e => setEditingFarmer({...editingFarmer, phone: e.target.value})} placeholder="+216..." className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Gouvernorat</label>
                <select value={editingFarmer.governorate || ''} onChange={e => setEditingFarmer({...editingFarmer, governorate: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Sélectionner...</option>
                  {TUNISIAN_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Région (Détail)</label>
                <input type="text" value={editingFarmer.region || ''} onChange={e => setEditingFarmer({...editingFarmer, region: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={() => setFarmerModalOpen(false)} className="bg-gray-200 text-gray-800 hover:bg-gray-300">Annuler</Button>
                <Button onClick={saveFarmer} className="bg-[#2E7D32]">Sauvegarder</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cropsModalFarmer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Cultures de {cropsModalFarmer.name}</h2>
              <button onClick={() => setCropsModalFarmer(null)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
              <h3 className="font-semibold mb-3">＋ Ajouter une culture</h3>
              <div className="flex gap-3 flex-wrap items-end">
                <div>
                  <label className="block text-xs font-semibold mb-1">Produit</label>
                  <select value={newCrop.product_id || ''} onChange={e => setNewCrop({...newCrop, product_id: e.target.value})} className="border rounded-md px-2 py-1.5 text-sm">
                    <option value="">Sélectionner...</option>
                    {productsList.map(p => <option key={p.id} value={p.id}>{p.name_fr}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Planté (kg)</label>
                  <input type="number" value={newCrop.planted_quantity_kg || ''} onChange={e => setNewCrop({...newCrop, planted_quantity_kg: Number(e.target.value)})} className="border rounded-md px-2 py-1.5 text-sm w-24" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Récolte</label>
                  <input type="date" value={newCrop.harvest_date || ''} onChange={e => setNewCrop({...newCrop, harvest_date: e.target.value})} className="border rounded-md px-2 py-1.5 text-sm" />
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
                  <tr key={crop.id} className="border-b">
                    <td className="p-2">{(crop as any).product?.name_fr}</td>
                    <td className="p-2">{crop.planted_quantity_kg}</td>
                    <td className="p-2 font-semibold text-green-700">{crop.predicted_yield_kg}</td>
                    <td className="p-2">{crop.harvest_date || '-'}</td>
                    <td className="p-2">
                      <select 
                        value={crop.status} 
                        onChange={async (e) => {
                          await supabase.from('farmer_crops').update({ status: e.target.value }).eq('id', crop.id);
                          loadCropsForFarmer(cropsModalFarmer);
                        }}
                        className={`text-xs rounded-full px-2 py-1 border ${
                          crop.status === 'growing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          crop.status === 'ready' ? 'bg-green-100 text-green-800 border-green-200' :
                          crop.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="growing">En croissance</option>
                        <option value="ready">Prêt</option>
                        <option value="harvested">Récolté</option>
                        <option value="failed">Échec</option>
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
  )
}
