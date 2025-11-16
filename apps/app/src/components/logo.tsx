import { Link } from "@tanstack/react-router";
import { cn } from "@rackd/ui/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Link to="/" search={{ postId: undefined }} aria-label="go home">
      <img 
        src="/logo.png" 
        alt="rackd" 
        className={cn("h-10 w-10", className)}
      />
    </Link>
  );
}


