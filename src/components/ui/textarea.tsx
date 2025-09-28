import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'default' | 'sm' | 'lg'
  mobileOptimized?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = 'default', mobileOptimized = true, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-vertical", // Allow vertical resize only
          // Size variants
          size === 'default' && "min-h-[80px] text-sm",
          size === 'sm' && "min-h-[60px] text-xs px-2 py-1",
          size === 'lg' && "min-h-[100px] text-base",
          // Mobile optimizations - prevent zoom on iOS and better touch targets
          mobileOptimized && "md:min-h-[80px] md:text-sm min-h-[100px] text-base",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }