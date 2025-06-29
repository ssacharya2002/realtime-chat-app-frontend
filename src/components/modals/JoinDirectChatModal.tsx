import type React from "react"
import { X } from "lucide-react"

interface JoinDirectChatModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  joinDirectCode: string
  onJoinDirectCodeChange: (value: string) => void
}

const JoinDirectChatModal: React.FC<JoinDirectChatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  joinDirectCode,
  onJoinDirectCodeChange,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Join Personal Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Enter someone's invite code to start chatting:</p>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={joinDirectCode}
            onChange={(e) => onJoinDirectCodeChange(e.target.value)}
            placeholder="Enter invite code"
            className="w-full border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white transition-colors"
            required
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Join Chat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinDirectChatModal 