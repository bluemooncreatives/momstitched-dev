import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-emerald-200 focus-visible:ring-2 focus-visible:ring-offset-1",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)] hover:from-emerald-500 hover:to-green-500 focus-visible:ring-emerald-200",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-emerald-500 bg-white text-emerald-700 shadow-[0_6px_20px_rgba(16,185,129,0.15)] hover:bg-emerald-50",
        secondary:
          "bg-slate-100 text-slate-700 shadow-none hover:bg-slate-200",
        ghost:
          "hover:bg-emerald-50 text-emerald-700",
        link: "text-emerald-700 underline-offset-4 hover:underline",
        custom: "bg-[#3E000D] text-[#FFECD1] text-md rounded-sm shadow-[0_18px_36px_rgba(15,118,75,0.35)] hover:bg-[#8E1616] ",
        customOutline: "border border-[#8E1616] bg-[#FFECD1] text-[#8E1616] text-md rounded-sm shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:bg-[#f9e8d8]",
      },
      size: {
        default: "h-11 px-6 has-[>svg]:px-5",
        sm: "h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-full px-7 has-[>svg]:px-5",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props} />
  );
}

export { Button, buttonVariants }
