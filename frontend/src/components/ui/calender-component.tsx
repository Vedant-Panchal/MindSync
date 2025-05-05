import * as React from "react";
import { format, isAfter, isSameDay, isBefore } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import JournalCards from "./journal-card";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const today = new Date();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: today,
    to: today,
  });
  const [startDate, setStartDate] = useState<string>(
    format(today, "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState<string>(format(today, "yyyy-MM-dd"));

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    if (selectedDate?.to && isAfter(selectedDate.to, today)) {
      toast.error("Cannot select dates after today.");
      return;
    }
    if (
      selectedDate?.from &&
      selectedDate?.to &&
      isAfter(selectedDate.from, selectedDate.to)
    ) {
      toast.error("Start date cannot be after end date.");
      return;
    }
    setDate(selectedDate);
  };

  useEffect(() => {
    if (!date) return;

    const { from, to } = date;

    // Extra safety to avoid wrong ranges
    if (from && to && isAfter(from, to)) {
      toast.error("Start date cannot be after end date.");
      return;
    }

    const formattedSD = from
      ? format(from, "yyyy-MM-dd")
      : format(today, "yyyy-MM-dd");
    const formattedED = to ? format(to, "yyyy-MM-dd") : formattedSD;
    setStartDate(formattedSD);
    setEndDate(formattedED);
    refetch();
  }, [date]);

  const getJournalFunction = async () => {
    try {
      let queryUrl = `/api/v1/journals/get`;
      if (startDate)
        queryUrl = queryUrl + `?start_date=${startDate}&end_date=${endDate}`;
      const res = await api.get(queryUrl);
      return res as any;
    } catch (error) {
      throw new Error("Failed to fetch journal entries.");
    }
  };

  const { data, isError, refetch, isLoading, error } = useQuery({
    queryKey: ["RangeJournal", startDate, endDate],
    queryFn: getJournalFunction,
    enabled: !!startDate && !!endDate,
  });

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Failed to load journal entries.");
    }
  }, [isError, error, data]);

  const entries = data;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6 md:p-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Centered layout */}
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Date Picker */}
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-center text-3xl font-bold text-gray-800">
            Select Date Range
          </h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left text-base font-medium",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                {date?.from ? (
                  date.to && !isSameDay(date.from, date.to) ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              side="bottom"
              align="start"
              sideOffset={8}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                  disabled={{ after: today }}
                />
              </motion.div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Journal Entries */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center text-gray-600"
            >
              Loading...
            </motion.div>
          ) : entries.length > 0 ? (
            <motion.div
              key="entries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="mb-6 text-center text-xl font-semibold text-gray-700">
                Journal Entries for{" "}
                {date?.from && date?.to
                  ? isSameDay(date.from, date.to)
                    ? format(date.from, "MMMM d, yyyy")
                    : `${format(date.from, "MMMM d, yyyy")} - ${format(
                        date.to,
                        "MMMM d, yyyy",
                      )}`
                  : ""}
              </h2>
              <JournalCards entries={entries} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm"
            >
              <p className="text-gray-500">
                No journal entries for this date range.
              </p>
              <Button className="mt-4">Create New Entry</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
