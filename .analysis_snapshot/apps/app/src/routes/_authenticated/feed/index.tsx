import { createFileRoute } from '@tanstack/react-router';
import { FeedDashboard } from '@/components/feed/dashboard';
import type { Id } from '@rackd/backend/convex/_generated/dataModel';

export const Route = createFileRoute('/_authenticated/feed/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      postId: (search.postId as string) || undefined,
    };
  },
  component: Feed,
});

function Feed() {
  const search = Route.useSearch();
  const postId = search.postId as Id<"posts"> | undefined;
  
  return <FeedDashboard highlightPostId={postId} />;
}
