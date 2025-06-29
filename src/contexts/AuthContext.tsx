// contexts/AuthContext.tsx

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthResponse } from "../types"
import api from "../services/api"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>("/auth/login", { email, password })
    const { token: newToken, user: newUser } = response.data

    setToken(newToken)
    setUser(newUser)

    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await api.post<AuthResponse>("/auth/register", { email, password, name })
    const { token: newToken, user: newUser } = response.data

    setToken(newToken)
    setUser(newUser)

    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(newUser))
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete api.defaults.headers.common["Authorization"]
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>
  )
}
