import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/app-layout';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    if (!context.userId) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});
