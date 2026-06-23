"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, placeholder, ...props }, ref) => {
    const inputId = id || React.useId()

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200 pointer-events-none",
              "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm",
              "peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-background peer-focus:px-1.5",
              "peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1.5",
              error && "text-destructive"
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          placeholder={placeholder || " "}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            label && "peer pt-4 pb-1",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
