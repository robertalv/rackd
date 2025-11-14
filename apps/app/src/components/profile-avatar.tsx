"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { cn } from "@rackd/ui/lib/utils";
import { useState, useEffect } from "react";
import { hasFlag } from 'country-flag-icons';
import { getInitials } from "@/lib/utils";

interface ProfileAvatarProps {
  user: {
    displayName: string;
    image?: string;
    country?: string;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showShimmer?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base", 
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl"
};

export function ProfileAvatar({ user, size = "md", className, showShimmer = false }: ProfileAvatarProps) {
  const sizeClass = sizeClasses[size];
  const [FlagComponent, setFlagComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (user.country && hasFlag(user.country.toUpperCase())) {
      import('country-flag-icons/react/3x2')
        .then((flags) => {
          const FlagComp = flags[user.country!.toUpperCase() as keyof typeof flags];
          if (FlagComp) {
            setFlagComponent(() => FlagComp);
          }
        })
        .catch(() => {
          setFlagComponent(null);
        });
    }
  }, [user.country]);

  const renderFallback = () => {
    if (user.image) {
      return null;
    }

    if (FlagComponent) {
      return (
        <div className="w-full h-full overflow-hidden rounded-full">
          <FlagComponent className="w-full h-full object-cover scale-150" />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium">
        {getInitials(user.displayName)}
      </div>
    );
  };

  return (
    <Avatar
      className={cn(
        sizeClass,
        className,
        showShimmer ? "cursor-pointer transition-opacity relative overflow-hidden group" : "transition-opacity relative overflow-hidden group"
      )}
      style={{
        zIndex: 0
      }}
    >
      {showShimmer && (
        <>
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            block
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-200
            z-10
          "
          style={{
            background: "linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.60) 50%, rgba(255,255,255,0) 60%)",
            animation: "shimmer-slide 1.1s linear infinite",
            backgroundRepeat: "no-repeat"
          }}
        ></span>
        <style>{`
          @keyframes shimmer-slide {
            0% {
              transform: translateX(-80%);
            }
            100% {
              transform: translateX(120%);
            }
          }
          /* Ensure span overlays properly without eating pointer events */
          .group:hover > span[aria-hidden="true"] {
            opacity: 1;
          }
        `}</style>
        </>
      )}
      {user.image && <AvatarImage src={user.image} className="object-cover" />}
      <AvatarFallback className="p-0 object-cover bg-primary">
        {renderFallback()}
      </AvatarFallback>
    </Avatar>
  );
}