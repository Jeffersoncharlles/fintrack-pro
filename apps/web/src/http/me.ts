import { api } from '@/lib/axios'

interface UserProfile {
  id: string
  name: string
  email: string
  pixKey: string | null
}
export const me = async (): Promise<UserProfile | null> => {
  const { data } = await api.get<UserProfile>('/auth/me')

  return data
}
