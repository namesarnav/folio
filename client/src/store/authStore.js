import { create } from 'zustand'

const useAuthStore = create((set, get) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null }),
  isAuthenticated: () => !!get().accessToken,
}))

export default useAuthStore
