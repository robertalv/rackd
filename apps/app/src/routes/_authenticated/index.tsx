import { createFileRoute } from '@tanstack/react-router';
import { FeedDashboard } from '@/components/feed/dashboard';

export const Route = createFileRoute('/_authenticated/')({
  component: IndexPage,
});

function IndexPage() {
  return <FeedDashboard />;
}
