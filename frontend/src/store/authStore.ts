import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'carrier' | 'shipper'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  roles: Role[]
  ratingAvg: number
  ratingCount: number
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  activeRole: Role
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setRole: (role: Role) => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      activeRole: 'carrier',
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true, activeRole: user.roles[0] || 'carrier' }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setRole: (role) => set({ activeRole: role }),
      setUser: (user) => set({ user }),
    }),
    { name: 'xtra-auth' }
  )
)
