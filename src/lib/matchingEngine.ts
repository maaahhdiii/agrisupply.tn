import { supabase } from './supabase'
import type { Farmer, FarmerCrop, MatchResult, OrderMatch } from '../types/farmer'

// Governorate proximity matrix (distance in km, approximate)
const GOVERNORATE_DISTANCES: Record<string, Record<string, number>> = {
  'Tunis': { 'Tunis':0,'Ariana':8,'Ben Arous':12,'Manouba':15,'Nabeul':65,'Bizerte':65,'Zaghouan':55,'Béja':105 },
  'Ariana': { 'Tunis':8,'Ariana':0,'Ben Arous':18,'Manouba':10,'Nabeul':70,'Bizerte':60 },
  'Ben Arous': { 'Tunis':12,'Ariana':18,'Ben Arous':0,'Manouba':20,'Zaghouan':40 },
  'Manouba': { 'Tunis':15,'Ariana':10,'Ben Arous':20,'Manouba':0,'Béja':90,'Bizerte':70 },
  'Nabeul': { 'Tunis':65,'Nabeul':0,'Zaghouan':55,'Sousse':85,'Monastir':100 },
  'Sousse': { 'Tunis':145,'Nabeul':85,'Sousse':0,'Monastir':25,'Mahdia':60,'Kairouan':55 },
  'Sfax': { 'Tunis':270,'Sousse':130,'Sfax':0,'Gabès':130,'Mahdia':80,'Kairouan':150 },
  'Kairouan': { 'Tunis':160,'Sousse':55,'Sfax':150,'Kairouan':0,'Sidi Bouzid':80 },
  'Bizerte': { 'Tunis':65,'Ariana':60,'Manouba':70,'Béja':70,'Bizerte':0 },
}

function getDistance(gov1: string, gov2: string): number {
  return GOVERNORATE_DISTANCES[gov1]?.[gov2] 
    || GOVERNORATE_DISTANCES[gov2]?.[gov1] 
    || 300 // default far distance
}

function calculateMatchScore(
  crop: FarmerCrop,
  requiredKg: number,
  orderGovernorate: string,
  farmerGovernorate: string
): number {
  let score = 0

  // 1. Availability score (40 points)
  const available = crop.predicted_yield_kg || crop.planted_quantity_kg * 0.8
  if (available >= requiredKg) score += 40
  else score += Math.floor((available / requiredKg) * 40)

  // 2. Distance score (30 points)
  const distance = getDistance(orderGovernorate, farmerGovernorate)
  if (distance <= 20) score += 30
  else if (distance <= 50) score += 25
  else if (distance <= 100) score += 15
  else if (distance <= 200) score += 8
  else score += 2

  // 3. Readiness score (20 points)
  if (crop.status === 'ready') score += 20
  else if (crop.status === 'growing') {
    if (crop.harvest_date) {
      const daysUntilHarvest = Math.ceil(
        (new Date(crop.harvest_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilHarvest <= 7) score += 15
      else if (daysUntilHarvest <= 14) score += 10
      else score += 5
    }
  }

  // 4. Farmer reliability (10 points) — always 10 for now
  score += 10

  return Math.min(score, 100)
}

export async function findMatchesForOrder(
  productId: string,
  requiredKg: number,
  orderGovernorate: string
): Promise<MatchResult[]> {
  const { data: crops, error } = await supabase
    .from('farmer_crops')
    .select(`
      *,
      farmer:farmers(*),
      product:products(id, name_ar, name_fr, image_url)
    `)
    .eq('product_id', productId)
    .in('status', ['ready', 'growing'])
    .order('harvest_date', { ascending: true })

  if (error || !crops) return []

  const results: MatchResult[] = crops.map(crop => {
    const farmer = crop.farmer as Farmer
    const available = crop.predicted_yield_kg || crop.planted_quantity_kg * 0.8
    const distance = getDistance(orderGovernorate, farmer.governorate)
    const score = calculateMatchScore(crop, requiredKg, orderGovernorate, farmer.governorate)
    
    return {
      farmer,
      crop,
      available_kg: available,
      match_score: score,
      distance_km: distance,
      can_fulfill_kg: Math.min(available, requiredKg)
    }
  })

  // Sort by score descending
  results.sort((a, b) => b.match_score - a.match_score)
  return results
}

export async function autoMatchOrder(
  orderId: string,
  productId: string,
  requiredKg: number,
  orderGovernorate: string
): Promise<{ matches: OrderMatch[], totalFulfilled: number }> {
  const candidates = await findMatchesForOrder(productId, requiredKg, orderGovernorate)
  
  let remaining = requiredKg
  const createdMatches: OrderMatch[] = []

  for (const candidate of candidates) {
    if (remaining <= 0) break
    
    const assignKg = Math.min(candidate.available_kg, remaining)
    
    const { data: match } = await supabase
      .from('order_matches')
      .insert({
        order_id: orderId,
        farmer_id: candidate.farmer.id,
        farmer_crop_id: candidate.crop.id,
        matched_quantity_kg: assignKg,
        status: 'proposed',
        match_score: candidate.match_score,
        distance_km: candidate.distance_km
      })
      .select()
      .single()

    if (match) {
      createdMatches.push(match)
      remaining -= assignKg
    }
  }

  return {
    matches: createdMatches,
    totalFulfilled: requiredKg - remaining
  }
}

export function predictYield(plantedKg: number, productName: string): number {
  // Yield multipliers by product type
  const multipliers: Record<string, number> = {
    'tomat': 0.85, 'طماطم': 0.85,
    'pomme de terre': 0.75, 'بطاطا': 0.75,
    'oignon': 0.80, 'بصل': 0.80,
    'orange': 0.70, 'برتقال': 0.70,
    'fraise': 0.65, 'فراولة': 0.65,
    'carotte': 0.82, 'جزر': 0.82,
    'courgette': 0.88, 'كوسة': 0.88,
    'ail': 0.78, 'ثوم': 0.78,
  }
  
  const key = Object.keys(multipliers).find(k => 
    productName.toLowerCase().includes(k.toLowerCase())
  )
  const multiplier = key ? multipliers[key] : 0.80
  return Math.round(plantedKg * multiplier * 100) / 100
}
