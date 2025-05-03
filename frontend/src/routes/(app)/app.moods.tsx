import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/(app)/app/moods")({
  component: RouteComponent,
});

function RouteComponent() {
  const userData = {
    message: "User analysis data generated successfully.",
    data: {
      journal_count: 2,
      tag_usage: { final: 1, app: 1, check: 2, testing: 2, second: 1 },
      current_streak: 0,
      longest_streak: 2,
      journal_dates: ["2025-04-30", "2025-05-01"],
      daily_moods: {
        "2025-04-30": {
          neutral: 0.9287,
          approval: 0.0759,
          realization: 0.0138,
        },
        "2025-05-01": { neutral: 0.9694, approval: 0.012, annoyance: 0.0069 },
      },
      all_mood_count: {
        neutral: 2,
        approval: 2,
        realization: 1,
        annoyance: 1,
        joy: 2,
        sad: 5,
      },
    },
  };

  const { journal_dates, daily_moods, all_mood_count, tag_usage } =
    userData.data;

  const allMoodData = Object.entries(all_mood_count).map(([name, value]) => ({
    name,
    value,
  }));
  const dailyMoodData = Object.entries(daily_moods).map(([date, moods]) => ({
    date,
    ...moods,
  }));
  const tagData = Object.entries(tag_usage).map(([name, count]) => ({
    name,
    count,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="mx-auto space-y-6 p-6">
      <ChartCard
        title="Overall Mood Distribution"
        description="All recorded moods across entries"
      >
        <PieChartComponent data={allMoodData} colors={COLORS} />
      </ChartCard>

      <ChartCard
        title="Daily Mood Intensity"
        description="Mood intensity by day"
      >
        <BarChartComponent data={dailyMoodData} formatDate={formatDate} />
      </ChartCard>

      <ChartCard
        title="Tag Usage"
        description="Frequency of tags in journal entries"
      >
        <TagUsageChart data={tagData} />
      </ChartCard>

      <RecentJournals
        journal_dates={journal_dates}
        daily_moods={daily_moods}
        formatDate={formatDate}
      />
    </div>
  );
}

const ChartCard = ({ title, description, children }) => (
  <Card className="shadow-md transition-all hover:shadow-lg">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const PieChartComponent = ({ data, colors }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => [value, "Count"]} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

const BarChartComponent = ({ data, formatDate }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" tickFormatter={formatDate} />
      <YAxis />
      <Tooltip
        formatter={(value) => [(value * 100).toFixed(1) + "%", "Intensity"]}
      />
      <Legend />
      <Bar dataKey="neutral" fill="#8884D8" />
      <Bar dataKey="approval" fill="#82CA9D" />
      <Bar dataKey="realization" fill="#FFC658" />
      <Bar dataKey="annoyance" fill="#FF7300" />
    </BarChart>
  </ResponsiveContainer>
);

const TagUsageChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={data}
      layout="vertical"
      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis dataKey="name" type="category" />
      <Tooltip formatter={(value) => [value, "Count"]} />
      <Legend />
      <Bar dataKey="count" fill="#8884D8" />
    </BarChart>
  </ResponsiveContainer>
);

const RecentJournals = ({ journal_dates, daily_moods, formatDate }) => (
  <ChartCard
    title="Recent Journal Entries"
    description={`Last ${journal_dates.length} journal dates`}
  >
    <div className="space-y-2">
      {journal_dates.map((date, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded border p-3 transition-all hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex gap-1">
            {Object.entries(daily_moods[date])
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([mood], i) => (
                <Badge key={i} variant="outline" className="capitalize">
                  {mood}
                </Badge>
              ))}
          </div>
        </div>
      ))}
    </div>
  </ChartCard>
);

export default RouteComponent;
