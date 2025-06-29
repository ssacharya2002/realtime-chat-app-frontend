import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  MessageCircle,
  Users,
  Plus,
  Search,
  MoreVertical,
  LogOut,
  UserPlus,
  Copy,
  Settings,
  Moon,
  Sun,
  Bell,
  Archive,
  X,
} from "lucide-react"
import type { Group, User as UserType } from "../types"
import { useTheme } from "../contexts/ThemeContext"
import api, { joinDirectChat } from "../services/api"
import toast from "react-hot-toast"
import CreateGroupModal from "./modals/CreateGroupModal"
import JoinGroupModal from "./modals/JoinGroupModal"
import JoinDirectChatModal from "./modals/JoinDirectChatModal"

interface ChatSidebarProps {
  user: UserType | null
  groups: Group[]
  directChats: any[]
  onLogout: () => void
  onRefresh: () => void
  loading: boolean
  onCloseSidebar: () => void
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  user,
  groups,
  directChats,
  onLogout,
  onRefresh,
  loading,
  onCloseSidebar,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showJoinDirectModal, setShowJoinDirectModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [joinDirectCode, setJoinDirectCode] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  console.log("user id "+user?.id);
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const allChats = [
    ...groups.map((group) => ({
      id: group.id,
      name: group.name,
      type: "group" as const,
      lastMessage: `${group._count?.members || 0} members`,
      time: new Date(group.createdAt).toLocaleDateString(),
      unread: 0,
      avatar: group.name.charAt(0).toUpperCase(),
      route: `/chat/group/${group.id}`,
      isOnline: true,
    })),
    ...directChats.map((chat) => ({
      id: chat.id,
      name: chat.otherUser?.name || "Unknown User",
      type: "direct" as const,
      lastMessage: chat.lastMessage?.content || "No messages yet",
      time: chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleDateString() : "",
      unread: 0,
      avatar: (chat.otherUser?.name || "U").charAt(0).toUpperCase(),
      route: `/chat/personal/${chat.id}`,
      isOnline: Math.random() > 0.5, // Mock online status
    })),
  ]

  const filteredChats = allChats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const isActive = (route: string) => location.pathname === route

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post("/groups", {
        name: newGroupName,
        description: newGroupDescription,
      })
      setNewGroupName("")
      setNewGroupDescription("")
      setShowCreateModal(false)
      toast.success("Group created successfully!")
      onRefresh()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create group")
    }
  }

  const joinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post(`/groups/join/${inviteCode}`)
      setInviteCode("")
      setShowJoinModal(false)
      toast.success("Joined group successfully!")
      onRefresh()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join group")
    }
  }



  const handleJoinDirectChat = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const chat = await joinDirectChat(joinDirectCode)
      setShowJoinDirectModal(false)
      setJoinDirectCode("")
      toast.success("Joined direct chat successfully!")
      onRefresh()
      navigate(`/chat/personal/${chat.id}`)
      onCloseSidebar()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join direct chat")
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Personal invite code copied!")
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white ring-opacity-30">
                <span className="text-white text-lg font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.name.slice(0, 10).toUpperCase()}..</h2>
              <p className="text-green-100 text-sm">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              // onClick={handleShowInviteModal}
              onClick={()=>copyInviteCode(user?.id || "")}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              // title="Share invite code"
            >
              <Copy className="h-5 w-5" />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-xl py-2 w-56 z-50 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowCreateModal(true)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>Create Group</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinModal(true)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    <span>Join Group</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinDirectModal(true)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                    <span>Join Direct Chat</span>
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={() => {
                      setShowSettingsModal(true)
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                  >
                    {isDark ? (
                      <Sun className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-indigo-600" />
                    )}
                    <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  <button
                    onClick={() => {
                      onLogout()
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Search className="h-4 w-4 text-white" />
          </div>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-blue-950 bg-opacity-20 backdrop-blur-sm text-white placeholder-green-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <MessageCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-medium">No chats found</p>
            <p className="text-sm mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredChats.map((chat) => (
              <div
                key={`${chat.type}-${chat.id}`}
                onClick={() => {
                  navigate(chat.route)
                  onCloseSidebar()
                }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 ${
                  isActive(chat.route)
                    ? "bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-r-4 border-r-green-600"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium shadow-md ${
                        chat.type === "group"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-green-500 to-emerald-600"
                      }`}
                    >
                      {chat.type === "group" ? (
                        <Users className="h-6 w-6" />
                      ) : (
                        <span className="text-lg font-semibold">{chat.avatar}</span>
                      )}
                    </div>
                    {chat.type === "direct" && chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">{chat.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {formatTime(chat.time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <div className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Components */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createGroup}
        groupName={newGroupName}
        groupDescription={newGroupDescription}
        onGroupNameChange={setNewGroupName}
        onGroupDescriptionChange={setNewGroupDescription}
      />

      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={joinGroup}
        inviteCode={inviteCode}
        onInviteCodeChange={setInviteCode}
      />

      <JoinDirectChatModal
        isOpen={showJoinDirectModal}
        onClose={() => setShowJoinDirectModal(false)}
        onSubmit={handleJoinDirectChat}
        joinDirectCode={joinDirectCode}
        onJoinDirectCodeChange={setJoinDirectCode}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
                  <span className="text-gray-900 dark:text-white">Dark Mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={isDark} onChange={toggleTheme} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Archive className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white">Archive Chats</span>
                </div>
                <button className="text-green-600 hover:text-green-700 font-medium">View</button>
              </div>
            </div>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatSidebar
