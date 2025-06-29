// pages/Dashboard.tsx

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import type { Group } from "../types"
import api, { getDirectChats } from "../services/api"
import toast from "react-hot-toast"
import { MessageCircle, Plus, Users, LogOut, Copy, UserPlus, Calendar } from "lucide-react"
import { getMyInviteCode, joinDirectChat } from "../services/api"

const Dashboard: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showJoinDirectModal, setShowJoinDirectModal] = useState(false)
  const [myInviteCode, setMyInviteCode] = useState("")
  const [joinDirectCode, setJoinDirectCode] = useState("")
  const [directChats, setDirectChats] = useState<any[]>([])
  const [directChatsLoading, setDirectChatsLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
    fetchMyInviteCode()
    fetchDirectChats()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await api.get<Group[]>("/groups")
      setGroups(response.data)
    } catch (error) {
      toast.error("Failed to fetch groups")
    } finally {
      setLoading(false)
    }
  }

  const fetchMyInviteCode = async () => {
    try {
      const code = await getMyInviteCode()
      setMyInviteCode(code)
    } catch (error) {
      console.error("Failed to fetch invite code:", error)
    }
  }

  const fetchDirectChats = async () => {
    try {
      setDirectChatsLoading(true)
      const chats = await getDirectChats()
      setDirectChats(chats)
    } catch (error) {
      console.error("Failed to fetch direct chats:", error)
      toast.error("Failed to load direct chats")
    } finally {
      setDirectChatsLoading(false)
    }
  }

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post<Group>("/groups", {
        name: newGroupName,
        description: newGroupDescription,
      })
      setGroups([...groups, response.data])
      setNewGroupName("")
      setNewGroupDescription("")
      setShowCreateModal(false)
      toast.success("Group created successfully!")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create group")
    }
  }

  const joinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post<Group>(`/groups/join/${inviteCode}`)
      const existingGroup = groups.find((g) => g.id === response.data.id)
      if (!existingGroup) {
        setGroups([...groups, response.data])
      }
      setInviteCode("")
      setShowJoinModal(false)
      toast.success("Joined group successfully!")
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
      // Refresh direct chats
      await fetchDirectChats()
      navigate(`/personal/${chat.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join direct chat")
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Invite code copied!")
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Chat Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button onClick={logout} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Chat Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Personal Chats</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Share My Code
              </button>
              <button
                onClick={() => setShowJoinDirectModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Join Chat
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            {directChatsLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading chats...</p>
              </div>
            ) : directChats.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No personal chats yet.</p>
                <p className="text-sm">Share your invite code or join someone else's chat to get started!</p>
              </div>
            ) : (
              <div className="divide-y">
                {directChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/personal/${chat.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                        {chat.otherUser?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{chat.otherUser?.name || "Unknown User"}</div>
                        {chat.lastMessage && (
                          <div className="text-sm text-gray-500 truncate">{chat.lastMessage.content}</div>
                        )}
                        {!chat.lastMessage && <div className="text-sm text-gray-400">No messages yet</div>}
                      </div>
                      <div className="text-xs text-gray-400">
                        {chat.lastMessage && formatDate(chat.lastMessage.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Group</span>
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            <span>Join Group</span>
          </button>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
            <p className="text-gray-600 mb-6">Create your first group or join an existing one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/chat/${group.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{group.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyInviteCode(group.inviteCode)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy invite code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  {group.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{group._count?.members || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{group._count?.messages || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(group.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">Created by {group.creator.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
            <form onSubmit={createGroup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter group description"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Join Group</h2>
            <form onSubmit={joinGroup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter invite code"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Invite Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Your Personal Invite Code</h2>
            <p className="text-gray-600 mb-4">Share this code with others to start a direct chat:</p>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 font-mono bg-gray-100 px-3 py-2 rounded border text-center">{myInviteCode}</div>
              <button
                onClick={() => {
                  copyInviteCode(myInviteCode)
                  setShowInviteModal(false)
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Join Direct Chat Modal */}
      {showJoinDirectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Join Personal Chat</h2>
            <p className="text-gray-600 mb-4">Enter someone's invite code to start chatting:</p>
            <form onSubmit={handleJoinDirectChat}>
              <input
                type="text"
                value={joinDirectCode}
                onChange={(e) => setJoinDirectCode(e.target.value)}
                placeholder="Enter invite code"
                className="w-full border border-gray-300 px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Join Chat
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinDirectModal(false)}
                  className="flex-1 text-gray-500 hover:text-gray-700 border border-gray-300 px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
