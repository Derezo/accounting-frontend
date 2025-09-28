import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'default' | 'sm' | 'lg'
  mobileOptimized?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size = 'default', mobileOptimized = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Size variants
          size === 'default' && "h-9 text-sm",
          size === 'sm' && "h-8 text-xs px-2 py-1",
          size === 'lg' && "h-11 text-base",
          // Mobile optimizations - prevent zoom on iOS and better touch targets
          mobileOptimized && "md:h-9 md:text-sm min-h-[44px] text-base",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }