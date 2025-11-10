import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Header } from '@/components/layout/header';

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
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex flex-1 flex-col overflow-auto">
        <Outlet />
      </main>
    </div>
  ),
});
