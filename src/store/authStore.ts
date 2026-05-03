import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Locale = 'ar' | 'fr'

interface User {
  name: string
  phone: string
  email?: string
}

interface AuthStore {
  user: User | null
  locale: Locale
  setUser: (user: User) => void
  setGuest: () => void
  logout: () => void
  setLocale: (locale: Locale) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      locale: (localStorage.getItem('agrisupply_locale') as Locale) || 'fr',

      setUser: (user) => set({ user }),

      setGuest: () => set({ user: { name: 'Visiteur', phone: '' } }),

      logout: () => {
        set({ user: null })
        localStorage.removeItem('agrisupply_locale')
      },

      setLocale: (locale) => {
        localStorage.setItem('agrisupply_locale', locale)
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = locale
        set({ locale })
      },
    }),
    {
      name: 'agrisupply-auth',
      partialize: (state) => ({ user: state.user, locale: state.locale }),
    }
  )
)
