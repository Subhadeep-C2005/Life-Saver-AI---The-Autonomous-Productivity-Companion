import { getTasks } from '@/lib/actions';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const initialTasks = await getTasks();

  return <DashboardClient initialTasks={initialTasks} />;
}
