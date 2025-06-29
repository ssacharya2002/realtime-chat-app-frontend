
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ChatLayout from "./components/ChatLayout"
import { Toaster } from "react-hot-toast"

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/chat" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/chat" /> : <Register />} />
            <Route path="/chat/*" element={user ? <ChatLayout /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "dark:bg-gray-800 dark:text-white",
              duration: 3000,
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
