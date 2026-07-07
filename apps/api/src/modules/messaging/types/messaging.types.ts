export interface CreateThreadDto {
  subject?: string;
  contextType?: 'general' | 'support' | 'course' | 'cohort' | 'clinical' | 'compliance';
  contextId?: string;
  participantSupabaseUserIds: string[];
}

export interface SendMessageDto {
  body: string;
}

export interface MarkThreadReadDto {
  readAt?: string;
}

export interface MessagingContact {
  supabaseUserId: string;
  email: string;
  role: string;
}

export interface MessagingThreadResponse {
  id: string;
  subject: string;
  contextType: string | null;
  contextId: string | null;
  updatedAt: string;
  participants: Array<{
    supabaseUserId: string;
    displayName: string;
    role: string;
    isCurrentUser: boolean;
  }>;
  messages: Array<{
    id: string;
    senderSupabaseUserId: string;
    senderRole: string;
    body: string;
    createdAt: string;
    isCurrentUser: boolean;
  }>;
  unreadCount: number;
}
