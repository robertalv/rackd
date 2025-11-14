import * as React from "react"

import { cn } from "@rackd/ui/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-11 rounded-md px-8 has-[>svg]:px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type InputProps = Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>;

function Input({
  className,
  type = "text",
  size = "default",
  variant = "default",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, variant, className }))}
      {...props}
    />
  )
}

export { Input }
