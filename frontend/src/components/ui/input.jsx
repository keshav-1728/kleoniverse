import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-border bg-transparent px-4 py-2 text-base font-medium text-foreground ring-offset-background transition-all duration-200",
        "placeholder:text-muted-foreground/60",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
