import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TUNISIAN_GOVERNORATES } from '../types/farmer'
import type { Farmer, FarmerCrop } from '../types/farmer'
import { predictYield } from '../lib/matchingEngine'
import Button from '../components/ui/Button'

export default function Farmers() {
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem('admin_auth') === 'true')
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [productsList, setProductsList] = useState<any[]>([])
  
  // Modals state
  const [farmerModalOpen, setFarmerModalOpen] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState<Partial<Farmer>>({})
  
  const [expandedFarmerId, setExpandedFarmerId] = useState<string | null>(null)
  const [newCrop, setNewCrop] = useState<Partial<FarmerCrop>>({})

  useEffect(() => {
    if (unlocked) {
      fetchFarmers()
      fetchProducts()
    }
  }, [unlocked])

  const fetchFarmers = async () => {
    const { data } = await supabase.from('farmers')
      .select('*, farmer_crops(*, product:products(*))')
      .order('name')
    if (data) setFarmers(data)
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

  const saveFarmer = async () => {
    if (editingFarmer.id) {
      await supabase.from('farmers').update(editingFarmer).eq('id', editingFarmer.id)
    } else {
      await supabase.from('farmers').insert(editingFarmer)
    }
    setFarmerModalOpen(false)
    fetchFarmers()
  }

  const saveCrop = async (farmerId: string) => {
    if (!newCrop.product_id || !newCrop.planted_quantity_kg) return
    const prod = productsList.find(p => p.id === newCrop.product_id)
    const predicted = predictYield(Number(newCrop.planted_quantity_kg), prod?.name_fr || '')
    
    await supabase.from('farmer_crops').insert({
      ...newCrop,
      farmer_id: farmerId,
      predicted_yield_kg: predicted,
      status: 'growing'
    })
    setNewCrop({})
    setExpandedFarmerId(null)
    fetchFarmers()
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8F4]">
        <div className={`bg-white p-8 rounded-2xl shadow-md w-96 ${shake ? 'animate-shake' : ''}`}>
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2E7D32]">Accès Agriculteurs</h2>
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

  const totalActive = farmers.filter(f => f.is_active).length
  const allCrops = farmers.flatMap(f => f.farmer_crops || [])
  const totalYield = allCrops.reduce((acc, c) => acc + (c.predicted_yield_kg || 0), 0)
  const readyCrops = allCrops.filter(c => c.status === 'ready').length

  return (
    <div className="min-h-screen bg-[#F4F8F4] font-[Tajawal]">
      <div className="bg-[#1a5c1e] text-white p-4 md:p-6 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🌾 Réseau Agriculteurs</h1>
          <p className="text-white/80 text-sm">Gestion des producteurs et cultures</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => { setEditingFarmer({ is_active: true }); setFarmerModalOpen(true) }} className="bg-white text-[#1a5c1e] hover:bg-gray-100 hidden md:block">
            ＋ Ajouter
          </Button>
          <a href="/admin" className="text-white/80 hover:text-white mt-2 block text-sm">Retour Admin</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#2E7D32]">{totalActive}</div>
            <div className="text-xs md:text-sm text-gray-500">Agriculteurs actifs</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{allCrops.length}</div>
            <div className="text-xs md:text-sm text-gray-500">Cultures totales</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600">{totalYield.toFixed(0)}</div>
            <div className="text-xs md:text-sm text-gray-500">Rendement prévu (kg)</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-50 text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-500">{readyCrops}</div>
            <div className="text-xs md:text-sm text-gray-500">Prêtes à récolter</div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map(farmer => (
            <div key={farmer.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-gray-100">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-bold text-lg">
                      {farmer.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{farmer.name}</h3>
                      <a href={`tel:${farmer.phone}`} className="text-[#2E7D32] text-sm hover:underline font-medium">{farmer.phone}</a>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${farmer.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
                    📍 {farmer.governorate}
                  </span>
                  {farmer.region && (
                    <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-200">
                      {farmer.region}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 p-6 pt-4 flex-1">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Cultures</h4>
                {farmer.farmer_crops && farmer.farmer_crops.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {farmer.farmer_crops.map(crop => (
                      <div key={crop.id} className="text-sm flex justify-between items-center border-b border-gray-50 pb-2">
                        <div>
                          <span className="font-semibold text-gray-800">{(crop as any).product?.name_fr || 'Produit'}</span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Planté: {crop.planted_quantity_kg}kg | {crop.harvest_date || 'Pas de date'}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            crop.status === 'ready' ? 'bg-green-100 text-green-800' :
                            crop.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>{crop.status}</span>
                          <div className="text-xs font-bold text-[#2E7D32] mt-0.5">Prévu: {crop.predicted_yield_kg}kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic mb-4">Aucune culture enregistrée</p>
                )}

                {farmer.farmer_crops && farmer.farmer_crops.length > 0 && (
                  <div className="bg-[#F4F8F4] rounded-xl p-3 text-sm border border-green-100">
                    <div className="flex justify-between font-bold text-[#1a5c1e] mb-1">
                      <span>🌾 Rendement total prévu:</span>
                      <span>{farmer.farmer_crops.reduce((sum, c) => sum + (c.predicted_yield_kg || 0), 0).toFixed(0)} kg</span>
                    </div>
                  </div>
                )}
              </div>

              {expandedFarmerId === farmer.id && (
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <h5 className="text-sm font-bold mb-2">Ajouter culture rapide</h5>
                  <div className="space-y-2 text-sm">
                    <select value={newCrop.product_id || ''} onChange={e => setNewCrop({...newCrop, product_id: e.target.value})} className="w-full border rounded p-2">
                      <option value="">Sélectionner produit...</option>
                      {productsList.map(p => <option key={p.id} value={p.id}>{p.name_fr}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Planté (kg)" value={newCrop.planted_quantity_kg || ''} onChange={e => setNewCrop({...newCrop, planted_quantity_kg: Number(e.target.value)})} className="w-1/2 border rounded p-2" />
                      <input type="date" value={newCrop.harvest_date || ''} onChange={e => setNewCrop({...newCrop, harvest_date: e.target.value})} className="w-1/2 border rounded p-2" />
                    </div>
                    {newCrop.planted_quantity_kg && newCrop.product_id && (
                      <div className="text-xs text-[#2E7D32] font-semibold text-center bg-green-50 p-1 rounded">
                        🌾 Estimation: {predictYield(newCrop.planted_quantity_kg, productsList.find(p=>p.id===newCrop.product_id)?.name_fr || '')} kg
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => saveCrop(farmer.id)} disabled={!newCrop.product_id || !newCrop.planted_quantity_kg} className="w-full bg-[#2E7D32] py-1 text-sm">Ajouter</Button>
                      <button onClick={() => setExpandedFarmerId(null)} className="w-full text-gray-500 text-sm">Annuler</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 border-t flex justify-between">
                <button onClick={() => { setEditingFarmer(farmer); setFarmerModalOpen(true) }} className="text-blue-600 text-sm font-medium hover:underline">
                  ✎ Modifier
                </button>
                <button onClick={() => setExpandedFarmerId(expandedFarmerId === farmer.id ? null : farmer.id)} className="text-[#2E7D32] text-sm font-bold hover:underline">
                  🌱 Ajouter culture
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {farmerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingFarmer.id ? 'Modifier' : 'Ajouter'} Agriculteur</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nom complet</label>
                <input type="text" value={editingFarmer.name || ''} onChange={e => setEditingFarmer({...editingFarmer, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Téléphone</label>
                <input type="text" value={editingFarmer.phone || ''} onChange={e => setEditingFarmer({...editingFarmer, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Gouvernorat</label>
                <select value={editingFarmer.governorate || ''} onChange={e => setEditingFarmer({...editingFarmer, governorate: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Sélectionner...</option>
                  {TUNISIAN_GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Région</label>
                <input type="text" value={editingFarmer.region || ''} onChange={e => setEditingFarmer({...editingFarmer, region: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={() => setFarmerModalOpen(false)} className="bg-gray-200 text-gray-800">Annuler</Button>
                <Button onClick={saveFarmer} className="bg-[#2E7D32]">Sauvegarder</Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
