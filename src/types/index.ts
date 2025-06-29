// types/index.ts
export interface User {
  id: string
  email: string
  name: string
  createdAt?: Date
}

export interface Group {
  id: string
  name: string
  description?: string
  inviteCode: string
  createdBy: string
  createdAt: Date
  creator: User
  members?: GroupMember[]
  _count?: {
    members: number
    messages: number
  }
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  joinedAt: Date
  user: User
}

export interface Message {
  id: string
  content: string
  userId: string
  groupId: string
  createdAt: Date
  user: User
}

export interface AuthResponse {
  token: string
  user: User
}

export interface DirectChat {
  id: string
  userAId: string
  userBId: string
  createdAt: Date
  inviteCodeA: string
  inviteCodeB: string
}

export interface DirectMessage {
  id: string
  content: string
  senderId: string
  chatId: string
  createdAt: Date
  sender: User
}

export interface DirectChatListItem {
  id: string
  otherUser: User
  lastMessage?: DirectMessage
}
