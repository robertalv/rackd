import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { z } from 'zod';

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/_unauthenticated')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, search }) => {
    if (context.userId) {
      throw redirect({
        to: search.redirect || '/',
      });
    }
  },
  component: () => (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Outlet />
      </div>
    </div>
  ),
});

