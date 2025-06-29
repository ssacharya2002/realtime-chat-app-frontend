// services/api.ts

import axios from "axios"

function getApiUrl() {
  try {
    if ((import.meta as any)?.env?.VITE_API_URL) {
      return (import.meta as any).env.VITE_API_URL
    }
  } catch {}
  if (typeof window !== "undefined" && (window as any).VITE_API_URL) {
    return (window as any).VITE_API_URL
  }
  return "http://localhost:8000/api"
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Get current user's invite code
export const getMyInviteCode = async () => {
  try {
    const response = await api.get<{ inviteCode: string }>("/auth/me/invite-code")
    return response.data.inviteCode
  } catch (error) {
    console.error("Error getting invite code:", error)
    throw error
  }
}

// Join/start a direct chat with another user's invite code
export const joinDirectChat = async (inviteCode: string) => {
  try {
    const response = await api.post("/auth/direct-chat/join/" + inviteCode)
    return response.data
  } catch (error) {
    console.error("Error joining direct chat:", error)
    throw error
  }
}

// Get messages in a direct chat
export const getDirectMessages = async (chatId: string) => {
  try {
    const response = await api.get(`/auth/direct-chat/${chatId}/messages`)
    console.log("API response for direct messages:", response.data)
    // Return the data directly since it's already an array
    return response.data
  } catch (error) {
    console.error("Error getting direct messages:", error)
    throw error
  }
}

// Send a message in a direct chat
export const sendDirectMessage = async (chatId: string, content: string) => {
  try {
    const response = await api.post(`/auth/direct-chat/${chatId}/messages`, { content })
    return response.data
  } catch (error) {
    console.error("Error sending direct message:", error)
    throw error
  }
}

// Get all direct chats for the current user
export const getDirectChats = async () => {
  try {
    const response = await api.get("/auth/direct-chats")
    return response.data
  } catch (error) {
    console.error("Error getting direct chats:", error)
    return []
  }
}

export default api
