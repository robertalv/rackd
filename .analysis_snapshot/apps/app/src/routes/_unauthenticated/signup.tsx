import { createFileRoute } from '@tanstack/react-router';
import { SignupForm } from '@/components/auth/signup-form';

export const Route = createFileRoute('/_unauthenticated/signup')({
  component: SignupPage,
});

function SignupPage() {
  return <SignupForm />;
}

