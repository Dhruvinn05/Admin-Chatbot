import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Admin } from '@/types/admin'

interface AuthState {
  isAuthenticated: boolean
  admin: Admin | null
  token: string | null
  
  // Actions
  login: (admin: Admin, token: string) => void
  logout: () => void
  setAdmin: (admin: Admin) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      admin: null,
      token: null,

      login: (admin, token) => set({
        isAuthenticated: true,
        admin,
        token
      }),

      logout: () => set({
        isAuthenticated: false,
        admin: null,
        token: null
      }),

      setAdmin: (admin) => set({ admin })
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        admin: state.admin,
        token: state.token
      })
    }
  )
)