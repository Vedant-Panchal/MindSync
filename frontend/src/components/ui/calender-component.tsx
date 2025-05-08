"use client";

import { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";
import { Spinner } from "./spinner";
import { Badge } from "@/components/ui/badge";
import JournalCard from "@/components/journals/journal-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPie } from "@/components/ui/pie-chart";
import { TagUsageChart } from "@/components/ui/tag-usage-charts";
import { motion } from "motion/react";

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
  const getAnalyticsData = async () => {
    const res = await api.get("/api/v1/journals/dashboard/analysis", {
      params: { start_date: startDate || null, end_date: endDate || null },
    });
    return res.data as any;
  };

  const {
    data: analysis,
    isError: analysisIsError,
    error: analysisError,
    isLoading: analysisLoading,
  } = useQuery({
    queryKey: ["NewDashBoardData"],
    queryFn: getAnalyticsData,
  });
  console.log("data", analysis?.all_mood_count);
  const chartData = analysis?.all_mood_count;
  console.log("data", chartData);
  const chartDataList: any[] = chartData
    ? Object.entries(chartData).map(([mood, count]) => ({
        mood,
        count,
      }))
    : [];
  console.log("start", startDate);
  if (analysisIsError) {
    toast.error(analysisError.message);
  }
  return (
    <>
      <div className="grid h-max grid-cols-1 gap-2 overflow-x-hidden p-5 md:grid-cols-2">
        {/* Calendar section */}
        <div className="bg-card rounded-lg border p-3 shadow-sm">
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
            numberOfMonths={2}
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
          <div className="bg-background flex items-center justify-center rounded-lg border shadow-sm">
            <Spinner />
          </div>
        ) : (
          <div className="bg-card rounded-lg border p-3 shadow-sm">
            <h2 className="text-card-foreground mb-4 text-xl font-semibold">
              Journal Entries
            </h2>

            {data?.length > 0 ? (
              <div className="relative w-full overflow-x-hidden">
                <div className="p-5">
                  <div
                    className="flex h-full w-full gap-2 transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${currentJournalIndex * 100}%)`,
                    }}
                  >
                    {filteredEntries.map((entry) => (
                      <div className="w-full flex-shrink-0" key={entry.id}>
                        <JournalCard
                          key={entry.id}
                          entry={entry}
                          viewMode="grid"
                        />
                      </div>
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
                    disabled={currentJournalIndex >= filteredEntries.length - 1}
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
        {/* <div className="grid h-max gap-6 p-5 md:grid-cols-2"> */}
        <Card className="h-max min-h-56 border shadow-sm">
          <CardHeader className="flex items-center justify-between pb-2">
            <div className="flex flex-col">
              <CardTitle>Mood Analysis</CardTitle>
              <CardDescription>
                Track your emotional patterns over time
              </CardDescription>
            </div>
            <Tabs defaultValue="daily">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Daily Moods</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily">
              <TabsContent value="daily">
                {analysisLoading ? (
                  <div className="bg-background flex h-full w-full items-center justify-center">
                    <Spinner />
                  </div>
                ) : (
                  <ChartPie chartData={chartDataList} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="h-max min-h-56 border shadow-sm">
          <CardHeader>
            <CardTitle>Tag Usage</CardTitle>
            <CardDescription>
              Most frequently used tags in your journals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              {analysisLoading ? (
                <div className="bg-background flex h-full w-full items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <TagUsageChart tagUsage={analysis?.tag_usage} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* </div> */}
    </>
  );
}
