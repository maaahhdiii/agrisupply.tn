export interface Farmer {
  id: string
  name: string
  phone: string
  region: string
  governorate: string
  gps_lat?: number
  gps_lng?: number
  is_active: boolean
  notes?: string
  created_at: string
  farmer_crops?: FarmerCrop[]
}

import type { Order } from './index'

export interface FarmerCrop {
  id: string
  farmer_id: string
  product_id: string
  planted_quantity_kg: number
  harvest_date?: string
  predicted_yield_kg?: number
  actual_yield_kg?: number
  status: 'growing' | 'ready' | 'harvested' | 'failed'
  season?: string
  notes?: string
  created_at: string
  product?: {
    id: string
    name_ar: string
    name_fr: string
    image_url: string
  }
  farmer?: Farmer
}

export interface OrderMatch {
  id: string
  order_id: string
  farmer_id: string
  farmer_crop_id: string
  matched_quantity_kg: number
  status: 'proposed' | 'confirmed' | 'rejected' | 'delivered'
  match_score: number
  distance_km?: number
  notes?: string
  created_at: string
  farmer?: Farmer
  farmer_crop?: FarmerCrop
  order?: Order
}

export interface MatchResult {
  farmer: Farmer
  crop: FarmerCrop
  available_kg: number
  match_score: number
  distance_km: number
  can_fulfill_kg: number
}

export const TUNISIAN_GOVERNORATES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
  'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Le Kef', 'Siliana',
  'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gabès', 'Medenine', 'Tataouine',
  'Gafsa', 'Tozeur', 'Kebili'
]
