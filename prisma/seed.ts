import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper: combine a display date string + optional time string into a Date
function toDate(dateStr: string, timeStr?: string): Date {
  const today = new Date();
  const map: Record<string, Date> = {
    Today: today,
    Tomorrow: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    'Jun 25': new Date(today.getFullYear(), 5, 25),
    'Jun 26': new Date(today.getFullYear(), 5, 26),
    'Jun 28': new Date(today.getFullYear(), 5, 28),
    'Jun 20': new Date(today.getFullYear(), 5, 20),
    'Jul 1': new Date(today.getFullYear(), 6, 1),
    'Jul 5': new Date(today.getFullYear(), 6, 5),
  };

  const base = map[dateStr] ?? today;

  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    base.setHours(h, m, 0, 0);
  }

  return base;
}

async function main() {
  // Clear existing data
  await prisma.task.deleteMany();

  const tasksData = [
    // Urgent tasks
    {
      title: 'Submit hackathon project demo',
      description: 'Final submission to DevPost due in 2 hours. Upload video + code link.',
      deadline: toDate('Today', '23:59'),
      estimated_hours: 2,
      priority_score: 95,
      status: 'in-progress',
      tag: 'Hackathon',
      subtasks: [
        'Record 2-minute demo video showing core AI features',
        'Upload project code and write up DevPost text content',
        'Submit demo URL to DevPost submission portal'
      ]
    },
    {
      title: 'Fix critical auth bug in production',
      description: 'Users cannot log in — JWT expiry mismatch in refresh flow.',
      deadline: toDate('Today', '18:00'),
      estimated_hours: 3,
      priority_score: 90,
      status: 'pending',
      tag: 'Engineering',
      subtasks: [
        'Locate the refresh flow logic in src/lib/auth.ts',
        'Fix the mismatch of token expiration settings',
        'Verify login works by writing local integration tests',
        'Deploy authentication hotfix to production server'
      ]
    },
    {
      title: 'Review investor pitch deck',
      description: 'Sarah needs feedback on slides 8–14 before the morning call.',
      deadline: toDate('Today', '09:00'),
      estimated_hours: 1,
      priority_score: 88,
      status: 'pending',
      tag: 'Business',
      subtasks: [
        'Read pitch deck slides 8-14 carefully',
        'Leave annotations on slide layout and data points',
        'Email feedback comments back to Sarah'
      ]
    },
    // Regular tasks
    {
      title: 'Write unit tests for API endpoints',
      description: 'Cover /tasks, /auth, and /ai-chat with Jest and Supertest.',
      deadline: toDate('Tomorrow'),
      estimated_hours: 4,
      priority_score: 75,
      status: 'in-progress',
      tag: 'Engineering',
      subtasks: [
        'Setup Jest test suite and Supertest client configurations',
        'Write test cases for the /tasks API endpoints',
        'Write test cases for the /auth login/logout flow',
        'Verify test suite coverage report meets 80% threshold'
      ]
    },
    {
      title: 'Deploy staging environment',
      description: 'Push latest build to Vercel staging branch and run smoke tests.',
      deadline: toDate('Today'),
      estimated_hours: 2,
      priority_score: 72,
      status: 'pending',
      tag: 'DevOps',
      subtasks: [
        'Trigger staging pipeline run on Github Actions',
        'Verify deployment succeeded on Vercel dashboard',
        'Perform manual smoke testing on live environment'
      ]
    },
    {
      title: 'Design onboarding flow screens',
      description: 'Create Figma mockups for 5-step user onboarding experience.',
      deadline: toDate('Jun 25'),
      estimated_hours: 6,
      priority_score: 55,
      status: 'in-progress',
      tag: 'Design',
      subtasks: [
        'Brainstorm step-by-step user onboarding content',
        'Sketch layout wireframes in Figma',
        'Create high-fidelity UI mockups with interactive prototypes'
      ]
    },
    {
      title: 'Update project README',
      description: 'Add setup instructions, screenshots, and architecture overview.',
      deadline: toDate('Jun 26'),
      estimated_hours: 1.5,
      priority_score: 45,
      status: 'pending',
      tag: 'Docs',
      subtasks: [
        'Document installation steps and system prerequisites',
        'Add architectural diagram to repository docs',
        'Commit updated README to main branch'
      ]
    },
    {
      title: 'Integrate Stripe payment flow',
      description: 'Add subscription billing support for Pro tier users.',
      deadline: toDate('Jun 28'),
      estimated_hours: 8,
      priority_score: 50,
      status: 'pending',
      tag: 'Engineering',
      subtasks: [
        'Setup Stripe webhook endpoint in Next.js',
        'Implement UI subscription plan checkout buttons',
        'Handle billing success and cancel webhook payloads'
      ]
    },
    {
      title: 'Research competitor features',
      description: 'Analyze Notion, Linear, and Asana for unique differentiators.',
      deadline: toDate('Jul 1'),
      estimated_hours: 3,
      priority_score: 25,
      status: 'pending',
      tag: 'Research',
      subtasks: [
        'List out key feature categories for Linear, Asana, Notion',
        'Identify 3 clear gaps our product can solve',
        'Draft competitor analysis research document'
      ]
    },
    {
      title: 'Add dark mode toggle',
      description: 'Persist user theme preference in localStorage.',
      deadline: toDate('Jun 20'),
      estimated_hours: 2,
      priority_score: 20,
      status: 'completed',
      tag: 'UI',
      subtasks: [
        'Create dark theme CSS styles and variable overrides',
        'Implement Client-side ThemeProvider context',
        'Add toggle switch component to navbar'
      ]
    },
    {
      title: 'Write blog post on AI productivity',
      description: 'Draft a 1500-word article about using AI agents to manage tasks.',
      deadline: toDate('Jul 5'),
      estimated_hours: 4,
      priority_score: 15,
      status: 'pending',
      tag: 'Marketing',
      subtasks: [
        'Research key keywords and outline the outline structure',
        'Draft 1500-word article focusing on agent workflows',
        'Review post readability and publish to website blog'
      ]
    }
  ];

  for (const t of tasksData) {
    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        estimated_hours: t.estimated_hours,
        priority_score: t.priority_score,
        status: t.status,
        tag: t.tag,
        subtasks: {
          create: t.subtasks.map(title => ({ title }))
        }
      }
    });
  }

  const count = await prisma.task.count();
  const subCount = await prisma.subtask.count();
  console.log(`✅ Seeded ${count} tasks and ${subCount} subtasks into SQLite`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

