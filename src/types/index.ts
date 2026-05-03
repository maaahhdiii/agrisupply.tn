export type Locale = 'ar' | 'fr'

export type Unit = 'kg' | 'ton'

export interface Product {
  id: string
  name_ar: string
  name_fr: string
  description_ar?: string
  description_fr?: string
  price: number
  unit_ar: string
  unit_fr: string
  image_url: string
  category: string
  stock_available: boolean
  available_units?: Unit[]
}

export interface CartItem {
  product: Product
  quantity: number
  selectedUnit?: Unit
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  notes?: string
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  total_amount: number
  delivery_date: string
  delivery_region?: string
  delivery_governorate?: string
  required_quantity_kg?: number
  is_recurring: boolean
  created_at: string
}

export interface Schedule {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  product_id: string
  quantity: number
  frequency: 'weekly' | 'monthly'
  day_of_week?: number
  day_of_month?: number
  next_order_date: string
  is_active: boolean
}
