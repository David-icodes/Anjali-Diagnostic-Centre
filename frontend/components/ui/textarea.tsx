"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, placeholder, ...props }, ref) => {
    const textareaId = id || React.useId()

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "absolute left-3 top-3 text-sm text-muted-foreground transition-all duration-200 pointer-events-none",
              "peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm",
              "peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-background peer-focus:px-1.5",
              "peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1.5",
              error && "text-destructive"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          placeholder={placeholder || " "}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            label && "peer pt-5 pb-2",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
