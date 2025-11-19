"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@rackd/ui/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-[10px] uppercase leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

type HeaderLabelSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

function HeaderLabel({
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof Label> & { size?: HeaderLabelSize }) {
  return (
    <Label className={cn(`font-bold tracking-tighter text-${size} capitalize`, className)} {...props} />
  )
}

export { Label, HeaderLabel }
