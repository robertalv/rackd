import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/login-form';
import { useConvexAuth } from 'convex/react';

export const Route = createFileRoute('/_unauthenticated/login')({
  component: LoginPage,
});

function LoginPage() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <LoginForm />;
}

