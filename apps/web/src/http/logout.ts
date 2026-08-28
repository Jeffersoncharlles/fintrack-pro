import { api } from '@/lib/axios'

export const logout = async () => {
  try {
    await api.post('auth/logout')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
