import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const subtasks = await prisma.subtask.findMany({ take: 2 });
  if (subtasks.length < 2) {
    console.log("Not enough subtasks to create an overlap.");
    return;
  }

  // Set both to Monday, June 22, 2026 at 10 AM to 12 PM
  const start = new Date('2026-06-22T10:00:00');
  const end = new Date('2026-06-22T12:00:00');

  await prisma.subtask.update({
    where: { id: subtasks[0].id },
    data: { scheduledStart: start, scheduledEnd: end }
  });

  await prisma.subtask.update({
    where: { id: subtasks[1].id },
    data: { scheduledStart: start, scheduledEnd: end }
  });

  console.log(`Updated subtasks "${subtasks[0].title}" and "${subtasks[1].title}" to overlap on Monday, June 22 at 10 AM - 12 PM`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
