// pages/PersonalChat.tsx

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSocket } from "../contexts/SocketContext"
import { useAuth } from "../contexts/AuthContext"
import type { DirectMessage } from "../types"
import { ArrowLeft, Send, Smile } from "lucide-react"
import { getDirectMessages } from "../services/api"

const PersonalChat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { joinDirectChat, sendDirectMessage, directMessages, directChats, connected, setDirectMessagesForChat } =
    useSocket()
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!chatId) {
      setError("Invalid chat.")
      setLoading(false)
      return
    }

    const initializeChat = async () => {
      try {
        console.log("Joining direct chat:", chatId)
        joinDirectChat(chatId)

        // Fetch messages from API
        console.log("Fetching messages from API for chat:", chatId)
        const messagesData = await getDirectMessages(chatId)
        console.log("Received messages data:", messagesData)
        if (messagesData && Array.isArray(messagesData)) {
          setDirectMessagesForChat(chatId, messagesData)
        } else if (messagesData && messagesData.messages && Array.isArray(messagesData.messages)) {
          setDirectMessagesForChat(chatId, messagesData.messages)
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
        setError("Failed to load chat")
      }
    }

    initializeChat()

    // Set loading to false after a reasonable delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [directMessages[chatId || ""]])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && chatId) {
      sendDirectMessage(chatId, newMessage)
      setNewMessage("")
      inputRef.current?.focus()
    }
  }

  const formatMessageTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMessageDate = (date: Date | string) => {
    const messageDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today"
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: messageDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  // Add this useEffect to handle loading state based on data availability
  useEffect(() => {
    if (chatId && (directMessages[chatId] || directChats[chatId])) {
      setLoading(false)
    }
  }, [chatId, directMessages, directChats])

  if (loading && !directMessages[chatId || ""] && !directChats[chatId || ""]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{error}</h2>
          <button onClick={() => navigate("/dashboard")} className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const messages = directMessages[chatId || ""] || []
  const chat = directChats[chatId || ""]
  const otherUser = chat?.otherUser

  // Group messages by date
  const messagesByDate = messages.reduce(
    (acc, message) => {
      const date = formatMessageDate(message.createdAt)
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(message)
      return acc
    },
    {} as Record<string, DirectMessage[]>,
  )

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate("/dashboard")} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">{otherUser ? otherUser.name : "Personal Chat"}</h1>
            <p className="text-sm text-gray-600">
              {connected ? (
                <span className="text-green-500">• Connected</span>
              ) : (
                <span className="text-red-500">• Disconnected</span>
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messagesByDate).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{date}</div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const isOwnMessage = message.senderId === user?.id
                const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-1"}`}
                  >
                    <div
                      className={`flex ${isOwnMessage ? "flex-row-reverse" : "flex-row"} items-end space-x-2 max-w-xs lg:max-w-md`}
                    >
                      {!isOwnMessage && (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {showAvatar ? (message.sender?.name || otherUser?.name || "U").charAt(0).toUpperCase() : ""}
                        </div>
                      )}
                      <div className={`${isOwnMessage ? "mr-2" : "ml-2"}`}>
                        {!isOwnMessage && showAvatar && (
                          <p className="text-xs text-gray-600 mb-1 ml-1">
                            {message.sender?.name || otherUser?.name || "Unknown"}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage ? "bg-blue-600 text-white" : "bg-white text-gray-900 border"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button type="button" className="text-gray-600 hover:text-gray-900">
            <Smile className="h-5 w-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default PersonalChat
