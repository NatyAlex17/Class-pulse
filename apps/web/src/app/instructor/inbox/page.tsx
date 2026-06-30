'use client';

import * as React from 'react';
import {
  IconPaperclip,
  IconPhoneCall,
  IconSearch,
  IconSend2,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { InstructorShell } from '@/components/instructor/instructor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = {
  from: 'student' | 'instructor';
  body: string;
  stamp: string;
};

type Conversation = {
  id: string;
  name: string;
  note: string;
  time: string;
  cohort?: string;
  placement?: string;
  messages: Message[];
};

const conversationsData: Conversation[] = [
  {
    id: '1',
    name: 'Alice Smith',
    note: 'Updated wound care checklist and sent questions.',
    time: '10:45 AM',
    cohort: 'CNA Cohort 12',
    placement: 'Sunrise Care',
    messages: [
      { from: 'student', body: 'Hi Dr. Chen, I uploaded the revised log and checklist. Can you confirm if I am cleared for Thursday?', stamp: '10:31 AM' },
      { from: 'instructor', body: 'I reviewed the upload. Your checklist is almost complete, but I still need one verified wound care observation.', stamp: '10:38 AM' },
      { from: 'student', body: 'Understood. I can complete that during tomorrow morning lab if there is an opening.', stamp: '10:42 AM' },
      { from: 'instructor', body: 'Perfect! I can supervise you tomorrow at 9 AM in Lab B. Please bring your documentation.', stamp: '10:45 AM' },
    ],
  },
  {
    id: '2',
    name: 'Marcus Chen',
    note: 'Concerned about missing verified hours this week.',
    time: '09:18 AM',
    cohort: 'CNA Cohort 12',
    placement: 'Oak Ridge Rehab',
    messages: [
      { from: 'student', body: 'Hey instructor, I was wondering if I can make up the missed hours from last week?', stamp: '09:05 AM' },
      { from: 'instructor', body: 'Hi Marcus, yes we can arrange that. What days work best for you?', stamp: '09:18 AM' },
      { from: 'student', body: 'Wednesday or Friday afternoons would work great for me.', stamp: '09:22 AM' },
      { from: 'instructor', body: 'Friday afternoon it is then. 2 PM at the facility. I\'ll notify your placement supervisor.', stamp: '09:25 AM' },
    ],
  },
  {
    id: '3',
    name: 'Placement Office',
    note: 'Site swap request for Friday morning rotation.',
    time: 'Yesterday',
    messages: [
      { from: 'student', body: 'Good morning, I have a request to swap my Friday rotation with another student.', stamp: 'Yesterday 3:15 PM' },
      { from: 'instructor', body: 'I received your swap request. I need to verify with both facilities first. I\'ll get back to you by EOD.', stamp: 'Yesterday 3:45 PM' },
      { from: 'student', body: 'Thank you so much! I really appreciate your help.', stamp: 'Today 8:30 AM' },
      { from: 'instructor', body: 'Update: Both sites approved. Your swap is confirmed for Friday. Details sent via email.', stamp: 'Today 9:00 AM' },
    ],
  },
];

export default function InstructorInboxPage() {
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation>(conversationsData[0]);
  const [messages, setMessages] = React.useState<Message[]>(selectedConversation.messages);
  const [messageInput, setMessageInput] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const filteredConversations = conversationsData.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      from: 'instructor',
      body: messageInput,
      stamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessageInput('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <InstructorShell
      title="Instructor Inbox"
      subtitle="Messages, escalations, and student follow-up in one workspace."
      topActions={<Button className="hidden rounded-full px-5 md:inline-flex">Check-in Session</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_280px] h-[calc(100vh-200px)]">
        {/* Conversations List - Fixed */}
        <section className="rounded-[20px] border border-border-subtle bg-surface shadow-soft flex flex-col overflow-hidden">
          <div className="border-b border-border-subtle p-5 shrink-0">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-[22px] font-semibold">Messages</h3>
              <Badge variant="primary">{conversationsData.length} conversations</Badge>
            </div>
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                placeholder="Search conversations..."
                className="h-11 rounded-[16px] pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full rounded-[18px] border p-4 text-left transition ${
                  selectedConversation.id === conversation.id
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-transparent hover:border-border-subtle hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{conversation.name}</p>
                    <p className="mt-1 text-sm leading-5 text-on-surface-variant line-clamp-2">{conversation.note}</p>
                  </div>
                  <span className="text-[11px] font-medium text-on-surface-variant whitespace-nowrap">{conversation.time}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Chat View */}
        <section className="flex min-h-[620px] flex-col rounded-[20px] border border-border-subtle bg-surface shadow-soft overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border-subtle p-5 shrink-0">
            <div>
              <h3 className="font-display text-[20px] font-semibold">{selectedConversation.name}</h3>
              {selectedConversation.cohort && (
                <p className="text-sm text-on-surface-variant">{selectedConversation.cohort} / {selectedConversation.placement}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <button className="rounded-full p-2 transition hover:bg-surface-muted hover:text-primary">
                <IconPhoneCall className="size-4" />
              </button>
              <button className="rounded-full p-2 transition hover:bg-surface-muted hover:text-primary">
                <IconVideo className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages - Scrollable Container */}
          <div className="flex-1 overflow-y-auto bg-surface-muted p-5 space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.stamp}-${index}`}
                className={`max-w-[78%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.from === 'instructor'
                    ? 'ml-auto rounded-br-md bg-primary text-white'
                    : 'rounded-bl-md bg-surface text-on-surface'
                }`}
              >
                <p>{message.body}</p>
                <p className={`mt-2 text-[11px] ${message.from === 'instructor' ? 'text-white/70' : 'text-on-surface-variant'}`}>
                  {message.stamp}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Sticky */}
          <div className="shrink-0 border-t border-border-subtle bg-surface p-4 sticky bottom-0">
            <div className="flex items-center gap-3 rounded-[18px] border border-border-subtle bg-surface-muted px-4 py-3">
              <button className="text-on-surface-variant transition hover:text-primary">
                <IconPaperclip className="size-4" />
              </button>
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-on-surface-variant"
                placeholder="Type a response..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="rounded-full bg-primary p-2 text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <IconSend2 className="size-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Conversation Context - Fixed */}
        <aside className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft overflow-y-auto">
          <h3 className="font-display text-[20px] font-semibold">Details</h3>
          <div className="mt-5 space-y-4">
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Messages</p>
              <p className="mt-2 text-lg font-semibold text-primary">{messages.length}</p>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Last message</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">{messages[messages.length - 1]?.stamp}</p>
            </div>
            <div className="rounded-[18px] border border-border-subtle bg-surface-muted p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">Status</p>
              <Badge variant="success" className="mt-3">
                Active conversation
              </Badge>
            </div>
          </div>
        </aside>
      </div>
    </InstructorShell>
  );
}
