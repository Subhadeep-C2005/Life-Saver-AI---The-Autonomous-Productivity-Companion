export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  dueTime?: string;
  tag: string;
  urgent?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const urgentTasks: Task[] = [
  {
    id: 'u1',
    title: 'Submit hackathon project demo',
    description: 'Final submission to DevPost due in 2 hours. Upload video + code link.',
    priority: 'high',
    status: 'in-progress',
    dueDate: 'Today',
    dueTime: '11:59 PM',
    tag: 'Hackathon',
    urgent: true,
  },
  {
    id: 'u2',
    title: 'Fix critical auth bug in production',
    description: 'Users cannot log in — JWT expiry mismatch in refresh flow.',
    priority: 'high',
    status: 'todo',
    dueDate: 'Today',
    dueTime: '6:00 PM',
    tag: 'Engineering',
    urgent: true,
  },
  {
    id: 'u3',
    title: 'Review investor pitch deck',
    description: 'Sarah needs feedback on slides 8–14 before the morning call.',
    priority: 'high',
    status: 'todo',
    dueDate: 'Today',
    dueTime: '9:00 AM',
    tag: 'Business',
    urgent: true,
  },
];

export const allTasks: Task[] = [
  // High Priority
  {
    id: 't1',
    title: 'Write unit tests for API endpoints',
    description: 'Cover /tasks, /auth, and /ai-chat with Jest and Supertest.',
    priority: 'high',
    status: 'in-progress',
    dueDate: 'Tomorrow',
    tag: 'Engineering',
  },
  {
    id: 't2',
    title: 'Deploy staging environment',
    description: 'Push latest build to Vercel staging branch and run smoke tests.',
    priority: 'high',
    status: 'todo',
    dueDate: 'Today',
    tag: 'DevOps',
  },
  // Medium Priority
  {
    id: 't3',
    title: 'Design onboarding flow screens',
    description: 'Create Figma mockups for 5-step user onboarding experience.',
    priority: 'medium',
    status: 'in-progress',
    dueDate: 'Jun 25',
    tag: 'Design',
  },
  {
    id: 't4',
    title: 'Update project README',
    description: 'Add setup instructions, screenshots, and architecture overview.',
    priority: 'medium',
    status: 'todo',
    dueDate: 'Jun 26',
    tag: 'Docs',
  },
  {
    id: 't5',
    title: 'Integrate Stripe payment flow',
    description: 'Add subscription billing support for Pro tier users.',
    priority: 'medium',
    status: 'todo',
    dueDate: 'Jun 28',
    tag: 'Engineering',
  },
  // Low Priority
  {
    id: 't6',
    title: 'Research competitor features',
    description: 'Analyze Notion, Linear, and Asana for unique differentiators.',
    priority: 'low',
    status: 'todo',
    dueDate: 'Jul 1',
    tag: 'Research',
  },
  {
    id: 't7',
    title: 'Add dark mode toggle',
    description: 'Persist user theme preference in localStorage.',
    priority: 'low',
    status: 'done',
    dueDate: 'Jun 20',
    tag: 'UI',
  },
  {
    id: 't8',
    title: 'Write blog post on AI productivity',
    description: 'Draft a 1500-word article about using AI agents to manage tasks.',
    priority: 'low',
    status: 'todo',
    dueDate: 'Jul 5',
    tag: 'Marketing',
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    content:
      "👋 Hey! I'm your **Productivity Agent**. I've analyzed your schedule and I see you have **3 urgent tasks** due today. Want me to help you prioritize and create a battle plan?",
    timestamp: '9:02 AM',
  },
  {
    id: 'm2',
    role: 'user',
    content: "Yes, what should I tackle first?",
    timestamp: '9:04 AM',
  },
  {
    id: 'm3',
    role: 'assistant',
    content:
      "Based on deadlines and impact, here's your optimal order:\n\n1. 🔴 **Review investor pitch deck** — due at 9 AM, highest business impact.\n2. 🔴 **Fix auth bug in production** — blocking users, due 6 PM.\n3. 🔴 **Submit hackathon demo** — due 11:59 PM, don't leave this last!\n\nI've already blocked 90-minute focus windows for each. Ready to start a Pomodoro session?",
    timestamp: '9:04 AM',
  },
  {
    id: 'm4',
    role: 'user',
    content: "Can you draft a quick summary of my day?",
    timestamp: '9:06 AM',
  },
  {
    id: 'm5',
    role: 'assistant',
    content:
      "📋 **Your Day at a Glance — June 23**\n\n• **3 urgent tasks** need same-day completion\n• **2 tasks** in progress across Engineering & Design\n• **5 upcoming tasks** in the next week\n• 🧠 Estimated deep work needed: **~5.5 hours**\n\nYou've got this. I'll remind you 30 min before each deadline! 🚀",
    timestamp: '9:06 AM',
  },
];

export const aiResponses: string[] = [
  "Great question! Based on your current workload, I'd suggest breaking that into two 45-minute focus blocks. Want me to schedule them?",
  "I've analyzed your task backlog. You have 8 open tasks — 3 are actually low-effort wins you can knock out in under 20 minutes each. Want the list?",
  "Productivity tip: Your most cognitively demanding tasks should be tackled between 9–11 AM when energy is peak. Should I reschedule your task order accordingly?",
  "I notice you have overlapping deadlines on Jun 26. Let me flag those and suggest which ones can be delegated or deferred. Give me a moment... 🤔",
  "Done! I've reorganized your task priorities for the week. The critical path is now: Auth bug → Hackathon demo → Pitch deck review. You've got 6.5 hours of buffer time. Nice!",
  "That sounds like a complex task. Let me break it down into subtasks for you:\n\n1. Research phase (30 min)\n2. Draft outline (20 min)\n3. Execution (90 min)\n4. Review & polish (30 min)\n\nTotal: ~2.5 hours. Shall I add this to your calendar?",
];
