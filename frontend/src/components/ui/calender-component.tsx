"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { Spinner } from "./spinner";

export default function CalendarJournal() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 0),
  });

  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const [currentJournalIndex, setCurrentJournalIndex] = useState(0);

  const handlePrevJournal = () => {
    setCurrentJournalIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextJournal = () => {
    setCurrentJournalIndex((prev) =>
      prev < filteredEntries.length - 1 ? prev + 1 : prev,
    );
  };

  useEffect(() => {
    if (dateRange?.from) {
      const formattedStartDate = format(dateRange.from, "yyyy-MM-dd");
      const formattedEndDate = format(
        dateRange.to || dateRange.from,
        "yyyy-MM-dd",
      );
      setStartDate(formattedStartDate);
      setEndDate(formattedEndDate);
    }
  }, [dateRange]);

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["getJournals", startDate, endDate],
    queryFn: async () => {
      let queryUrl = `/api/v1/journals/get`;
      if (startDate)
        queryUrl = queryUrl + `?start_date=${startDate}&end_date=${endDate}`;
      const res = await api.get(queryUrl);
      return res as any;
    },
  });

  const filteredEntries = data?.length ? data : [];

  console.log("start", startDate);
  if (isError) {
    toast.error(error.message);
  }

  console.log("data", data);

  return (
    <div className="bg-background min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-foreground mb-6 text-3xl font-bold">
          Journal Calendar
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Calendar section */}
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h2 className="text-card-foreground mb-4 text-xl font-semibold">
              Select Date Range
            </h2>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                setCurrentJournalIndex(0);
              }}
              className="rounded-md"
              numberOfMonths={1}
            />

            <div className="text-muted-foreground mt-4 text-sm">
              <p>
                <strong>Selected Range:</strong>{" "}
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "PPP")} -{" "}
                      {format(dateRange.to, "PPP")}
                    </>
                  ) : (
                    format(dateRange.from, "PPP")
                  )
                ) : (
                  "Please select a date range"
                )}
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="bg-background flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="bg-card rounded-lg border p-4 shadow-sm">
              <h2 className="text-card-foreground mb-4 text-xl font-semibold">
                Journal Entries
              </h2>

              {data?.length > 0 ? (
                <div className="relative">
                  <div className="overflow-hidden">
                    <div
                      className="flex w-full transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateX(-${currentJournalIndex * 100}%)`,
                      }}
                    >
                      {filteredEntries.map((entry) => (
                        <Card
                          key={entry.id}
                          className="border-border w-full min-w-full flex-shrink-0 shadow-sm"
                        >
                          <CardContent className="p-6">
                            <div className="text-muted-foreground mb-2 text-sm">
                              {format(entry.date, "yyyy-MM-dd")}
                            </div>
                            <h3 className="text-card-foreground mb-3 text-xl font-semibold">
                              {entry.title}
                            </h3>

                            <p className="text-card-foreground line-clamp-3 flex cursor-pointer flex-wrap whitespace-pre-line">
                              {entry.content.length > 150
                                ? `${entry.content.substring(0, 150)}...`
                                : entry.content}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevJournal}
                      disabled={currentJournalIndex === 0}
                      className={cn(
                        "border-border text-foreground",
                        currentJournalIndex === 0 &&
                          "cursor-not-allowed opacity-50",
                      )}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>

                    <div className="text-muted-foreground text-sm">
                      {filteredEntries.length > 0 ? (
                        <span>
                          {currentJournalIndex + 1} of {filteredEntries.length}
                        </span>
                      ) : null}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextJournal}
                      disabled={
                        currentJournalIndex >= filteredEntries.length - 1
                      }
                      className={cn(
                        "border-border text-foreground",
                        currentJournalIndex >= filteredEntries.length - 1 &&
                          "cursor-not-allowed opacity-50",
                      )}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground py-8 text-center">
                  No journal entries found for the selected date range.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
