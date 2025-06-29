import type React from "react"
import { MessageCircle, Users, Lock, Zap, Menu, Smartphone, Globe, Shield } from "lucide-react"

interface WelcomeScreenProps {
  onOpenSidebar: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenSidebar }) => {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="text-center max-w-xl mx-auto">
          <div className="mb-8 sm:mb-10">
            <div className="relative mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
              Welcome to ChatConnect
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              Connect, communicate, and collaborate with people around the world
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a chat from the sidebar to start messaging, or create a new conversation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Group Chats</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Create or join groups to chat with multiple people at once
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-3">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Direct Messages</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Start private conversations using personal invite codes
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Real-time Messaging</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Experience instant message delivery with live updates
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                Your conversations are protected with end-to-end security
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Mobile Responsive</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Global Access</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen
