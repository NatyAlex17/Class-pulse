import { ChatCurrentUser, ChatThread } from './types';

export const studentDemoUser: ChatCurrentUser = {
  id: 'student-demo-user',
  displayName: 'Amara Singh',
  role: 'student',
};

export const instructorDemoUser: ChatCurrentUser = {
  id: 'instructor-demo-user',
  displayName: 'Dr. Elaine Chen',
  role: 'instructor',
};

export const studentDemoThreads: ChatThread[] = [
  {
    id: 'student-thread-lisa-wong',
    title: 'Lisa Wong',
    subtitle: 'Senior Instructor / Clinical coaching',
    updatedAt: '2026-07-01T10:45:00.000Z',
    preview: "Great progress on your vital signs drill. I've left feedback on your charting.",
    unreadCount: 1,
    participants: [
      {
        userId: studentDemoUser.id,
        displayName: studentDemoUser.displayName,
        role: studentDemoUser.role,
        isCurrentUser: true,
      },
      {
        userId: 'lisa-wong',
        displayName: 'Lisa Wong',
        role: 'instructor',
        isCurrentUser: false,
      },
    ],
    messages: [
      {
        id: 'lw-1',
        senderUserId: 'lisa-wong',
        senderRole: 'instructor',
        body: "Great progress on your vital signs drill. I've left feedback on your charting.",
        createdAt: '2026-07-01T10:45:00.000Z',
        isCurrentUser: false,
      },
      {
        id: 'lw-2',
        senderUserId: studentDemoUser.id,
        senderRole: studentDemoUser.role,
        body: "Thank you. I'm updating the documentation section before lab tomorrow.",
        createdAt: '2026-07-01T11:02:00.000Z',
        isCurrentUser: true,
      },
    ],
  },
  {
    id: 'student-thread-james-miller',
    title: 'James Miller',
    subtitle: 'Clinical Supervisor / Skills lab',
    updatedAt: '2026-06-30T15:10:00.000Z',
    preview: 'Bring your updated clinical manual for Thursday lab.',
    unreadCount: 0,
    participants: [
      {
        userId: studentDemoUser.id,
        displayName: studentDemoUser.displayName,
        role: studentDemoUser.role,
        isCurrentUser: true,
      },
      {
        userId: 'james-miller',
        displayName: 'James Miller',
        role: 'instructor',
        isCurrentUser: false,
      },
    ],
    messages: [
      {
        id: 'jm-1',
        senderUserId: 'james-miller',
        senderRole: 'instructor',
        body: 'Bring your updated clinical manual for Thursday lab. We will review patient transfer technique first.',
        createdAt: '2026-06-30T15:10:00.000Z',
        isCurrentUser: false,
      },
    ],
  },
];

export const instructorDemoThreads: ChatThread[] = [
  {
    id: 'instructor-thread-alice-smith',
    title: 'Alice Smith',
    subtitle: 'CNA Cohort 12 / Sunrise Care',
    updatedAt: '2026-07-01T10:45:00.000Z',
    preview: 'I can complete that during tomorrow morning lab if there is an opening.',
    unreadCount: 0,
    participants: [
      {
        userId: instructorDemoUser.id,
        displayName: instructorDemoUser.displayName,
        role: instructorDemoUser.role,
        isCurrentUser: true,
      },
      {
        userId: 'alice-smith',
        displayName: 'Alice Smith',
        role: 'student',
        isCurrentUser: false,
      },
    ],
    messages: [
      {
        id: 'as-1',
        senderUserId: 'alice-smith',
        senderRole: 'student',
        body: 'Hi Dr. Chen, I uploaded the revised log and checklist. Can you confirm if I am cleared for Thursday?',
        createdAt: '2026-07-01T10:31:00.000Z',
        isCurrentUser: false,
      },
      {
        id: 'as-2',
        senderUserId: instructorDemoUser.id,
        senderRole: instructorDemoUser.role,
        body: 'I reviewed the upload. Your checklist is almost complete, but I still need one verified wound care observation.',
        createdAt: '2026-07-01T10:38:00.000Z',
        isCurrentUser: true,
      },
      {
        id: 'as-3',
        senderUserId: 'alice-smith',
        senderRole: 'student',
        body: 'I can complete that during tomorrow morning lab if there is an opening.',
        createdAt: '2026-07-01T10:42:00.000Z',
        isCurrentUser: false,
      },
    ],
  },
  {
    id: 'instructor-thread-marcus-chen',
    title: 'Marcus Chen',
    subtitle: 'CNA Cohort 12 / Oak Ridge Rehab',
    updatedAt: '2026-07-01T09:18:00.000Z',
    preview: 'Friday afternoon works for me if the facility can approve it.',
    unreadCount: 1,
    participants: [
      {
        userId: instructorDemoUser.id,
        displayName: instructorDemoUser.displayName,
        role: instructorDemoUser.role,
        isCurrentUser: true,
      },
      {
        userId: 'marcus-chen',
        displayName: 'Marcus Chen',
        role: 'student',
        isCurrentUser: false,
      },
    ],
    messages: [
      {
        id: 'mc-1',
        senderUserId: 'marcus-chen',
        senderRole: 'student',
        body: 'I was wondering if I can make up the missed hours from last week.',
        createdAt: '2026-07-01T09:05:00.000Z',
        isCurrentUser: false,
      },
      {
        id: 'mc-2',
        senderUserId: instructorDemoUser.id,
        senderRole: instructorDemoUser.role,
        body: 'Yes, we can arrange that. What days work best for you?',
        createdAt: '2026-07-01T09:18:00.000Z',
        isCurrentUser: true,
      },
    ],
  },
];
