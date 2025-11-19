"use client";

import { cn } from "@rackd/ui/lib/utils";

interface AuthLayoutProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

export function AuthLayout({ children, className, ...props }: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)} {...props}>
      {/* Header with logo and brand name */}
      <div className="flex items-center justify-center gap-3 pt-8 pb-6">
        <img 
          src="/logo.png" 
          alt="Rackd logo" 
          className="h-16 w-16"
        />
        <span className="font-bold lowercase tracking-tighter md:block text-4xl">rackd</span>
      </div>

      {/* Main content area - centered and flexible */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        {children}
      </div>

      {/* Footer with copyright and links */}
      <div className="flex items-center justify-center gap-20 pb-8 text-xs text-muted-foreground">
        <span>© 2025 Rackd</span>
        <a 
          href="/privacy-policy" 
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Privacy Policy
        </a>
        <a 
          href="/support" 
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Support
        </a>
      </div>
    </div>
  );
}

