

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSocket } from "../contexts/SocketContext"
import { useAuth } from "../contexts/AuthContext"
import type { DirectMessage } from "../types"
import { ArrowLeft, Send, Smile, MoreVertical, Menu } from "lucide-react"
import { getDirectMessages } from "../services/api"

interface PersonalChatViewProps {
  onOpenSidebar: () => void
}

const PersonalChatView: React.FC<PersonalChatViewProps> = ({ onOpenSidebar }) => {
  const { chatId } = useParams<{ chatId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { joinDirectChat, sendDirectMessage, directMessages, directChats, connected, setDirectMessagesForChat } =
    useSocket()
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
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
    scrollToBottom()
  }, [directMessages[chatId || ""]])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && chatId) {
      sendDirectMessage(chatId, newMessage)
      setNewMessage("")
      inputRef.current?.focus()
      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100)
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
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Connecting to chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">{error}</h2>
          <button onClick={() => navigate("/chat")} className="text-green-600 hover:text-green-700">
            Back to Chats
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
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => navigate("/chat")} className="text-white hover:text-green-100 hidden lg:block">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white ring-opacity-30">
              {otherUser ? otherUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="font-semibold text-lg">{otherUser ? otherUser.name : "Personal Chat"}</h1>
            <p className="text-green-100 text-sm">
              {connected ? <span>Online</span> : <span className="text-red-300">Offline</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">


          <button className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f0f0f0' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {otherUser ? otherUser.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chat with {otherUser?.name || "User"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {Object.entries(messagesByDate).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-6">
                  <div className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                    {date}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const isOwnMessage = message.senderId === user?.id
                    const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${
                          showAvatar ? "mt-4" : "mt-1"
                        } message-bubble`}
                      >
                        <div
                          className={`flex ${
                            isOwnMessage ? "flex-row-reverse" : "flex-row"
                          } items-end space-x-2 max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg`}
                        >
                          {!isOwnMessage && (
                            <div
                              className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-md ${
                                showAvatar ? "opacity-100" : "opacity-0"
                              }`}
                            >
                              {showAvatar
                                ? (message.sender?.name || otherUser?.name || "U").charAt(0).toUpperCase()
                                : ""}
                            </div>
                          )}
                          <div className={`${isOwnMessage ? "mr-2" : "ml-2"} max-w-full`}>
                            {!isOwnMessage && showAvatar && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-3 font-medium">
                                {message.sender?.name || otherUser?.name || "Unknown"}
                              </p>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-md relative ${
                                isOwnMessage
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                              <p
                                className={`text-xs mt-2 ${
                                  isOwnMessage ? "text-green-100" : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatMessageTime(message.createdAt)}
                              </p>
                              {/* Message tail */}
                              <div
                                className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                                  isOwnMessage
                                    ? "-right-1 bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "-left-1 bg-white dark:bg-gray-700 border-l border-b border-gray-200 dark:border-gray-600"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <button
            type="button"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Smile className="h-6 w-6" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white dark:focus:bg-gray-600 transition-all resize-none"
              disabled={!connected}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || !connected}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-full hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default PersonalChatView
