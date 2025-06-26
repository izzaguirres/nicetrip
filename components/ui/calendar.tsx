"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: "text-slate-500 rounded-md w-full font-normal text-[0.8rem] flex-1 text-center",
        row: "flex w-full",
        cell: cn(
          "flex-1 h-9 text-center text-sm p-0 relative",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "h-9 w-full p-0 font-normal hover:bg-slate-100 rounded-md transition-colors",
          "aria-selected:opacity-100 disabled:text-slate-400 disabled:opacity-50"
        ),
        day_selected: "bg-[#EE7215] text-white hover:bg-[#E65100] focus:bg-[#E65100]",
        day_today: "bg-slate-100 text-slate-900 font-semibold",
        day_outside: "text-slate-400 opacity-50",
        day_disabled: "text-slate-400 opacity-30 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
