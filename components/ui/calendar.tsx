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
      className={cn("p-2 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-bold text-slate-800 capitalize",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-slate-50 border-slate-200 transition-all rounded-full"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full mb-1 border-b border-slate-100 pb-1",
        head_cell: "text-slate-400 rounded-md w-8 font-bold text-[0.65rem] uppercase tracking-wider flex-1 text-center",
        row: "flex w-full mt-1",
        cell: cn(
          "flex-1 relative p-0 text-center text-xs focus-within:relative focus-within:z-20",
          "first:text-red-400" 
        ),
        day: cn(
          "h-8 w-8 p-0 font-medium aria-selected:opacity-100 hover:bg-[#FF6B35]/10 rounded-full transition-all duration-200 mx-auto flex items-center justify-center text-xs",
          "text-slate-700"
        ),
        day_selected: "bg-[#FF6B35] text-white hover:bg-[#FF6B35] focus:bg-[#FF6B35] shadow-sm shadow-orange-200 font-bold",
        day_today: "text-[#FF6B35] font-extrabold bg-orange-50",
        day_outside: "text-slate-300 opacity-40",
        day_disabled: "text-slate-300 opacity-50 cursor-not-allowed bg-slate-50/50",
        day_range_middle: "aria-selected:bg-orange-50 aria-selected:text-orange-900 rounded-none first:rounded-l-full last:rounded-r-full",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5 text-slate-600" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5 text-slate-600" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
