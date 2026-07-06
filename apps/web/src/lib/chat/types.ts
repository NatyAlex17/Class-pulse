export interface ChatParticipant {
  userId: string;
  displayName: string;
  role: string;
  isCurrentUser: boolean;
}

export interface ChatMessage {
  id: string;
  senderUserId: string;
  senderRole: string;
  body: string;
  createdAt: string;
  isCurrentUser: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  preview: string;
  unreadCount: number;
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

export interface ChatCurrentUser {
  id: string;
  displayName: string;
  role: string;
}

export interface InboxSetupState {
  mode: 'supabase' | 'demo';
  statusMessage: string;
  isLoading: boolean;
  sendPending: boolean;
  errorMessage: string | null;
}

export interface MessagingContact {
  supabaseUserId: string;
  email: string;
  role: string;
}
