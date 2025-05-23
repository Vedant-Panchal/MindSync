import { createFileRoute } from "@tanstack/react-router";
import { Clock, FlameIcon as Fire } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoodChart } from "@/components/ui/mood-charts";
import { TagUsageChart } from "@/components/ui/tag-usage-charts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Spinner } from "@/components/ui/spinner";
import { ChartDataItem, ChartPie } from "@/components/ui/pie-chart";

export const Route = createFileRoute("/(app)/app/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const getAnalyticsData = async () => {
    const res = await api.get("/api/v1/journals/dashboard/analysis");
    return res.data as any;
  };

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["DashBoardData"],
    queryFn: getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="bg-background flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    toast.error(error?.message);
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Error loading data.
      </div>
    );
  }

  const hasData = data && data.journal_count > 0;
  // const hasData = false

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex min-h-screen flex-col items-center justify-center space-y-4"
      >
        <motion.img
          src="/empty-state.svg"
          alt="No Journals"
          className="h-48 w-48"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <h2 className="text-2xl font-semibold">No Journals Found</h2>
        <p className="text-muted-foreground max-w-xs text-center">
          Start writing your first journal to see your mood and tag analytics
          here.
        </p>
        <Button asChild>
          <a href="/app/create">Write Now</a>
        </Button>
      </motion.div>
    );
  }

  const chartData = data.all_mood_count;
  const chartDataList: any[] = chartData
    ? Object.entries(chartData).map(([mood, count]) => ({
        mood,
        count,
      }))
    : [];

  return (
    <main className="flex-1 overflow-auto sm:p-4">
      <div className="max-w-7xl space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total Journals</CardDescription>
              <CardTitle className="text-3xl">{data.journal_count}</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-muted-foreground text-xs">
                Last entry:{" "}
                {format(
                  parseISO(data.journal_dates[data.journal_dates.length - 1]),
                  "MMM d, yyyy",
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-3xl">
                {data.current_streak} days
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                Keep writing to increase your streak!
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Longest Streak</CardDescription>
              <CardTitle className="text-3xl">
                {data.longest_streak} days
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Fire className="h-3 w-3 text-orange-500" />
                Your best writing streak so far!
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border shadow-sm">
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
                <TabsContent value="daily" className="h-[300px]">
                  <ChartPie chartData={chartDataList} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Tag Usage</CardTitle>
              <CardDescription>
                Most frequently used tags in your journals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <TagUsageChart tagUsage={data.tag_usage} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
