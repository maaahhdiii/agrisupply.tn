import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gfppeehyeuhhcvtnbpmt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcHBlZWh5ZXVoaGN2dG5icG10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc1ODM4NSwiZXhwIjoyMDkzMzM0Mzg1fQ.18y6-gRdq4XbxDW_-OXc5HAzP7sgBm20-hoUTZMwCUg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndInsert() {
  // Check if table exists
  const { data, error } = await supabase.from('products').select('id').limit(1)
  
  if (error) {
    console.error('Error querying products table:', error.message)
    return
  }
  
  console.log('Clearing old products...')
  await supabase.from('products').delete().neq('id', '')
  
  console.log('Inserting updated products with correct images and units...')
  
  const products = [
    {
      name_ar: 'زيت زيتون بكر ممتاز',
      name_fr: 'Huile d\'Olive Extra Vierge',
      description_ar: 'زيت زيتون تونسي بكر ممتاز من سيدي بوزيد',
      description_fr: 'Huile d\'olive tunisienne extra vierge de Sidi Bouzid',
      price: 25.00,
      unit_ar: '1 لتر',
      unit_fr: '1 L',
      image_url: 'https://images.unsplash.com/photo-1585518419759-473a5cded6f6?w=400&h=400&fit=crop',
      category: 'premium',
      stock_available: true
    },
    {
      name_ar: 'تمور دقلة نور',
      name_fr: 'Dattes Deglet Nour',
      description_ar: 'تمور تونسية فاخرة',
      description_fr: 'Dattes tunisiennes de qualité supérieure',
      price: 12.00,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1585707272962-b82acbda2957?w=400&h=400&fit=crop',
      category: 'fruits',
      stock_available: true
    },
    {
      name_ar: 'طماطم طازجة',
      name_fr: 'Tomates Fraîches',
      description_ar: 'طماطم طازجة من المزرعة',
      description_fr: 'Tomates fraîches de la ferme',
      price: 8.00,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1592841657303-869f76646f0c?w=400&h=400&fit=crop',
      category: 'légumes',
      stock_available: true
    },
    {
      name_ar: 'كوسة طازجة',
      name_fr: 'Courgette',
      description_ar: 'كوسة طازجة من الحقول',
      description_fr: 'Courgette fraîche des champs',
      price: 12.00,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1633128486319-b07df9b5d8b8?w=400&h=400&fit=crop',
      category: 'légumes',
      stock_available: true
    },
    {
      name_ar: 'بطاطا',
      name_fr: 'Pommes de terre',
      description_ar: 'بطاطا صالحة للقلي والطبخ',
      description_fr: 'Pommes de terre pour frites et cuisson',
      price: 1.80,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1590080876918-8421174a3797?w=400&h=400&fit=crop',
      category: 'légumes',
      stock_available: true
    },
    {
      name_ar: 'هريسة دياري',
      name_fr: 'Harissa Diari',
      description_ar: 'هريسة عربية مصنوعة يدويا',
      description_fr: 'Harissa artisanale faite maison',
      price: 8.00,
      unit_ar: '500 غ',
      unit_fr: '500 g',
      image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561a1a?w=400&h=400&fit=crop',
      category: 'epicerie',
      stock_available: true
    },
    {
      name_ar: 'برتقال طمسون',
      name_fr: 'Oranges Thomson',
      description_ar: 'برتقال طمسون ممتاز للعصير',
      description_fr: 'Oranges Thomson excellentes pour le jus',
      price: 3.00,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1580959375944-abd7e991d971?w=400&h=400&fit=crop',
      category: 'fruits',
      stock_available: true
    },
    {
      name_ar: 'فراولة طازجة',
      name_fr: 'Fraises Fraîches',
      description_ar: 'فراولة حلوة وطازجة من الوطن القبلي',
      description_fr: 'Fraises sucrées et fraîches du Cap Bon',
      price: 6.00,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1610996239125-eb3fa34b2176?w=400&h=400&fit=crop',
      category: 'fruits',
      stock_available: true
    },
    {
      name_ar: 'عسل نحل طبيعي',
      name_fr: 'Miel Naturel',
      description_ar: 'عسل نحل طبيعي 100٪ من الشمال الغربي',
      description_fr: 'Miel 100% naturel du Nord-Ouest',
      price: 45.00,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1599599810694-deca1a8c4d5a?w=400&h=400&fit=crop',
      category: 'premium',
      stock_available: true
    },
    {
      name_ar: 'بيض عربي',
      name_fr: 'Oeufs Fermiers',
      description_ar: 'بيض دجاج عربي حر',
      description_fr: 'Oeufs de poules élevées en plein air',
      price: 7.50,
      unit_ar: '15 بيضة',
      unit_fr: '15 pièces',
      image_url: 'https://images.unsplash.com/photo-1585707272962-b82acbda2957?w=400&h=400&fit=crop',
      category: 'ferme',
      stock_available: true
    },
    {
      name_ar: 'لوز',
      name_fr: 'Amandes',
      description_ar: 'لوز تونسي مقشر',
      description_fr: 'Amandes tunisiennes décortiquées',
      price: 35.00,
      unit_ar: '1 كغ',
      unit_fr: '1 kg',
      image_url: 'https://images.unsplash.com/photo-1572690232128-77b0d68e6d80?w=400&h=400&fit=crop',
      category: 'fruits-secs',
      stock_available: true
    }
  ]

  const { error: insertError } = await supabase.from('products').insert(products)
  if (insertError) {
    console.error('Error inserting products:', insertError.message)
  } else {
    console.log('Successfully inserted realistic products!')
  }
}

checkAndInsert()
