import { getTasks } from '@/lib/actions';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const initialTasks = await getTasks();

  return <DashboardClient initialTasks={initialTasks} />;
}
