// pages/Chat.tsx

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useSocket } from "../contexts/SocketContext"
import api from "../services/api"

const Chat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>()
  const [message, setMessage] = useState("")
  const { connected, joinGroup, sendMessage, messages, setGroupMessages } = useSocket() // Updated import
  const [groupMessages, setGroupMessagesLocal] = useState<any[]>([])

  useEffect(() => {
    if (groupId && connected) {
      joinGroup(groupId)
      fetchMessages()
    }
  }, [groupId, connected, joinGroup])

  useEffect(() => {
    if (groupId) {
      setGroupMessagesLocal(messages[groupId] || [])
    }
  }, [messages, groupId])

  const fetchMessages = async () => {
    if (!groupId) return

    try {
      const response = await api.get(`/groups/${groupId}/messages`)
      console.log("Fetched messages from API:", response.data)
      if (response.data && Array.isArray(response.data)) {
        setGroupMessages(groupId, response.data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = () => {
    if (message && groupId) {
      sendMessage(groupId, message)
      setMessage("")
    }
  }

  return (
    <div>
      <h2>Chat Group: {groupId}</h2>
      <div>
        {groupMessages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  )
}

export default Chat
