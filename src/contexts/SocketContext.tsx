// contexts/SocketContext.tsx

import type React from "react"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"
import type { Message, DirectMessage } from "../types"

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  joinGroup: (groupId: string) => void
  leaveGroup: (groupId: string) => void
  sendMessage: (groupId: string, content: string) => void
  messages: Record<string, Message[]>
  onlineUsers: string[]
  joinDirectChat: (chatId: string) => void
  sendDirectMessage: (chatId: string, content: string) => void
  directMessages: Record<string, DirectMessage[]>
  directChats: Record<string, any>
  setDirectMessagesForChat: (chatId: string, messages: DirectMessage[]) => void
  setGroupMessages: (groupId: string, messages: Message[]) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

function getApiUrl() {
  try {
    if ((import.meta as any)?.env?.VITE_API_URL) {
      return (import.meta as any).env.VITE_API_URL
    }
  } catch {}
  if (typeof window !== "undefined" && (window as any).VITE_API_URL) {
    return (window as any).VITE_API_URL
  }
  return "http://localhost:8000"
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [onlineUsers] = useState<string[]>([])
  const [directMessages, setDirectMessages] = useState<Record<string, DirectMessage[]>>({})
  const [directChats, setDirectChats] = useState<Record<string, any>>({})

  useEffect(() => {
    if (user && token) {
      const newSocket = io(getApiUrl(), {
        auth: { token },
      })

      newSocket.on("connect", () => {
        console.log("Connected to server")
        setConnected(true)
        newSocket.emit("join-user-groups")
      })

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server")
        setConnected(false)
      })

      newSocket.on("group-messages", (groupMessages: Message[]) => {
        const groupId = groupMessages[0]?.groupId
        if (groupId) {
          setMessages((prev) => ({
            ...prev,
            [groupId]: groupMessages,
          }))
        }
      })

      newSocket.on("new-group-message", (message: Message) => {
        setMessages((prev) => ({
          ...prev,
          [message.groupId]: [...(prev[message.groupId] || []), message],
        }))
      })

      newSocket.on("user-joined-group", ({ userId, groupId }) => {
        console.log(`User ${userId} joined group ${groupId}`)
      })

      newSocket.on("error", (error: string) => {
        console.error("Socket error:", error)
      })

      // Direct message handlers
      newSocket.on("direct-messages", ({ chatId, messages, chat }) => {
        console.log("Received direct messages for chat:", chatId, messages)
        setDirectMessages((prev) => ({
          ...prev,
          [chatId]: messages,
        }))
        if (chat) {
          setDirectChats((prev) => ({
            ...prev,
            [chatId]: chat,
          }))
        }
      })

      newSocket.on("new-direct-message", (message: DirectMessage) => {
        console.log("Received new direct message:", message)
        setDirectMessages((prev) => ({
          ...prev,
          [message.chatId]: [...(prev[message.chatId] || []), message],
        }))
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user, token])

  const joinGroup = (groupId: string) => {
    if (socket) {
      socket.emit("join-group", groupId)
    }
  }

  const leaveGroup = (groupId: string) => {
    if (socket) {
      socket.emit("leave-group", groupId)
    }
  }

  const sendMessage = (groupId: string, content: string) => {
    if (socket && content.trim()) {
      socket.emit("send-group-message", { groupId, content: content.trim() })
    }
  }

  const joinDirectChat = (chatId: string) => {
    if (socket) {
      console.log("Joining direct chat:", chatId)
      socket.emit("join-direct-chat", chatId)
    }
  }

  const sendDirectMessage = (chatId: string, content: string) => {
    if (socket && content.trim()) {
      console.log("Sending direct message:", { chatId, content: content.trim() })
      socket.emit("send-direct-message", { chatId, content: content.trim() })
    }
  }

  const setDirectMessagesForChat = (chatId: string, messages: DirectMessage[]) => {
    setDirectMessages((prev) => ({
      ...prev,
      [chatId]: messages,
    }))
  }

  const setGroupMessages = (groupId: string, messages: Message[]) => {
    setMessages((prev) => ({
      ...prev,
      [groupId]: messages,
    }))
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinGroup,
        leaveGroup,
        sendMessage,
        messages,
        onlineUsers,
        joinDirectChat,
        sendDirectMessage,
        directMessages,
        directChats,
        setDirectMessagesForChat,
        setGroupMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
