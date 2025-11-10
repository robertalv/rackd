import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@rackd/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@rackd/ui/components/card';
import { Input } from '@rackd/ui/components/input';
import { Label } from '@rackd/ui/components/label';

export const Route = createFileRoute('/_unauthenticated/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
        <CardDescription>Enter your email address and we'll send you a link to reset your password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="name@example.com" />
        </div>
        <Button className="w-full" asChild>
          <a href="#">Send Reset Link</a>
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground w-full">
          <Link to="/login" className="underline underline-offset-4 hover:text-primary">
            Back to sign in
          </Link>
        </div>
        <p className="text-center text-sm text-muted-foreground w-full">
          Don't have an account?{' '}
          <Link to="/signup" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

