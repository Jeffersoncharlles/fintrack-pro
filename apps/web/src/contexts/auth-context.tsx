import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { auth } from '@/http/auth'
import { logout } from '@/http/logout'
import { me } from '@/http/me'
import { queryClient } from '@/lib/react-query'

interface User {
  id: string
  name: string
  email: string
  pixKey: string | null
}

interface SignInCredentials {
  email: string
  password: string
}

interface SignInResponse {
  success: boolean
  error?: string | null
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: (credentials: SignInCredentials) => Promise<SignInResponse>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    () => queryClient.getQueryData<User | null>(['profile']) ?? null,
  )
  const [loading, setLoading] = useState(true)

  const loadProfileSession = useCallback(async (isMounted: () => boolean) => {
    try {
      const userData = await me()
      if (isMounted()) {
        setUser(userData)
        queryClient.setQueryData(['profile'], userData)
      }
    } catch {
      if (isMounted()) {
        setUser(null)
        queryClient.setQueryData(['profile'], null)
      }
    } finally {
      if (isMounted()) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    void loadProfileSession(() => mounted)
    return () => {
      mounted = false
    }
  }, [loadProfileSession])

  const isAuthenticated = !!user

  async function signIn({
    email,
    password,
  }: SignInCredentials): Promise<SignInResponse> {
    const { user: loggedUser, error } = await auth({ email, password })
    if (loggedUser) {
      const normalizedUser: User = {
        ...loggedUser,
        pixKey: null,
      }

      setUser(normalizedUser)
      queryClient.setQueryData(['profile'], normalizedUser)
      return { success: true }
    }
    return { success: false, error }
  }

  async function signOut() {
    try {
      await logout()
    } finally {
      setUser(null)
      queryClient.setQueryData(['profile'], null)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user: user || null, isAuthenticated, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
