
import type React from "react"
import { useState, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ChatSidebar from "./ChatSidebar"
import GroupChat from "./GroupChat"
import PersonalChatView from "./PersonalChatView"
import WelcomeScreen from "./WelcomeScreen"
import type { Group } from "../types"
import api, { getDirectChats } from "../services/api"

const ChatLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [groups, setGroups] = useState<Group[]>([])
  const [directChats, setDirectChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsResponse, directChatsData] = await Promise.all([api.get<Group[]>("/groups"), getDirectChats()])
      setGroups(groupsResponse.data)
      setDirectChats(directChatsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshChats = () => {
    fetchData()
  }

  const isChatOpen = location.pathname !== "/chat"

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 fixed lg:relative z-50 lg:z-0
        w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isChatOpen ? "lg:flex" : "flex"}
      `}
      >
        <ChatSidebar
          user={user}
          groups={groups}
          directChats={directChats}
          onLogout={logout}
          onRefresh={refreshChats}
          loading={loading}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route path="/" element={<WelcomeScreen onOpenSidebar={() => setSidebarOpen(true)} />} />
          <Route path="/group/:groupId" element={<GroupChat onOpenSidebar={() => setSidebarOpen(true)} />} />
          <Route path="/personal/:chatId" element={<PersonalChatView onOpenSidebar={() => setSidebarOpen(true)} />} />
        </Routes>
      </div>
    </div>
  )
}

export default ChatLayout
