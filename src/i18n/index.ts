import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const saved = localStorage.getItem('agrisupply_locale') || 'fr'
document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = saved

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: {
        nav: { home: 'الرئيسية', cart: 'السلة', orders: 'طلباتي', logout: 'خروج' },
        product: { add: 'إضافة', outOfStock: 'غير متوفر' },
        cart: { title: 'السلة', empty: 'السلة فارغة', subtotal: 'المجموع الجزئي', delivery: 'التوصيل', total: 'الإجمالي', checkout: 'إتمام الطلب', continue: 'متابعة التسوق' },
        checkout: { title: 'تأكيد الطلب', name: 'الاسم الكامل', phone: 'رقم الهاتف', address: 'العنوان', notes: 'ملاحظات', delivery_date: 'تاريخ التسليم', cod: 'الدفع عند التسليم', submit: 'تأكيد الطلب', success_title: 'تم إرسال طلبك!', success_sub: 'سنتصل بك قريباً لتأكيد التسليم', back_home: 'العودة للرئيسية' },
        orders: { title: 'طلباتي', search_label: 'ابحث برقم هاتفك', search_btn: 'بحث', no_orders: 'لا توجد طلبات', status: { pending: 'قيد الانتظار', confirmed: 'مؤكد', delivered: 'تم التسليم', cancelled: 'ملغي' } },
        schedule: { title: 'جدولة الطلب', one_time: 'طلب مرة واحدة', recurring: 'طلب متكرر', weekly: 'أسبوعي', monthly: 'شهري', next_delivery: 'التسليم القادم', days: ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'] }
      }
    },
    fr: {
      translation: {
        nav: { home: 'Accueil', cart: 'Panier', orders: 'Mes commandes', logout: 'Déconnexion' },
        product: { add: 'Ajouter', outOfStock: 'Rupture' },
        cart: { title: 'Panier', empty: 'Votre panier est vide', subtotal: 'Sous-total', delivery: 'Livraison', total: 'Total', checkout: 'Commander', continue: 'Continuer mes achats' },
        checkout: { title: 'Confirmer la commande', name: 'Nom complet', phone: 'Téléphone', address: 'Adresse', notes: 'Notes', delivery_date: 'Date de livraison', cod: 'Paiement à la livraison', submit: 'Confirmer', success_title: 'Commande envoyée!', success_sub: 'Nous vous appellerons pour confirmer', back_home: "Retour à l'accueil" },
        orders: { title: 'Mes commandes', search_label: 'Rechercher par téléphone', search_btn: 'Rechercher', no_orders: 'Aucune commande', status: { pending: 'En attente', confirmed: 'Confirmée', delivered: 'Livrée', cancelled: 'Annulée' } },
        schedule: { title: 'Planifier', one_time: 'Commande unique', recurring: 'Récurrente', weekly: 'Hebdomadaire', monthly: 'Mensuelle', next_delivery: 'Prochaine livraison', days: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'] }
      }
    }
  },
  lng: saved,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false }
})

export default i18n
