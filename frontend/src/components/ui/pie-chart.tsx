export type ChartDataItem = {
  mood: string;
  count: number;
  fill: string;
};

const chartConfig = {
  admiration: {
    label: "Admiration",
    color: "hsl(var(--chart-1))",
  },
  amusement: {
    label: "Amusement",
    color: "hsl(var(--chart-2))",
  },
  annoyance: {
    label: "Annoyance",
    color: "hsl(var(--chart-3))",
  },
  approval: {
    label: "Approval",
    color: "hsl(var(--chart-4))",
  },
  caring: {
    label: "Caring",
    color: "hsl(var(--chart-5))",
  },
  confusion: {
    label: "Confusion",
    color: "hsl(var(--chart-6))",
  },
  curiosity: {
    label: "Curiosity",
    color: "hsl(var(--chart-7))",
  },
  desire: {
    label: "Desire",
    color: "hsl(var(--chart-8))",
  },
  disappointment: {
    label: "Disappointment",
    color: "hsl(var(--chart-9))",
  },
  disapproval: {
    label: "Disapproval",
    color: "hsl(var(--chart-10))",
  },
  disgust: {
    label: "Disgust",
    color: "hsl(var(--chart-11))",
  },
  embarrassment: {
    label: "Embarrassment",
    color: "hsl(var(--chart-12))",
  },
  excitement: {
    label: "Excitement",
    color: "hsl(var(--chart-13))",
  },
  fear: {
    label: "Fear",
    color: "hsl(var(--chart-14))",
  },
  gratitude: {
    label: "Gratitude",
    color: "hsl(var(--chart-15))",
  },
  grief: {
    label: "Grief",
    color: "hsl(var(--chart-16))",
  },
  joy: {
    label: "Joy",
    color: "hsl(var(--chart-17))",
  },
  love: {
    label: "Love",
    color: "hsl(var(--chart-18))",
  },
  nervousness: {
    label: "Nervousness",
    color: "hsl(var(--chart-19))",
  },
  optimism: {
    label: "Optimism",
    color: "hsl(var(--chart-20))",
  },
  pride: {
    label: "Pride",
    color: "hsl(var(--chart-21))",
  },
  realization: {
    label: "Realization",
    color: "hsl(var(--chart-22))",
  },
  relief: {
    label: "Relief",
    color: "hsl(var(--chart-23))",
  },
  remorse: {
    label: "Remorse",
    color: "hsl(var(--chart-24))",
  },
  sadness: {
    label: "Sadness",
    color: "hsl(var(--chart-25))",
  },
  surprise: {
    label: "Surprise",
    color: "hsl(var(--chart-26))",
  },
  neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-27))",
  },
} satisfies ChartConfig;

// export function ChartPie({ chartData }: { chartData: ChartDataItem[] }) {
//   console.log("pie chart", chartData);
//   return (
//     <Card className="flex flex-col">
//       <CardHeader className="items-center pb-0">
//         <CardTitle>Mood Count Across All Journals</CardTitle>
//         <CardDescription>Moods</CardDescription>
//       </CardHeader>
//       <CardContent className="flex-1 pb-0">
//         <ChartContainer
//           config={chartConfig}
//           className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[450px]"
//         >
//           <PieChart>
//             <ChartTooltip
//               content={<ChartTooltipContent nameKey="count" hideLabel />}
//             />
//             <Pie data={chartData} dataKey="count">
//               <LabelList
//                 dataKey="mood"
//                 className="fill-background"
//                 stroke="none"
//                 fontSize={12}
//                 formatter={(value: keyof typeof chartConfig) =>
//                   chartConfig[value]?.label
//                 }
//               />
//             </Pie>
//           </PieChart>
//         </ChartContainer>
//       </CardContent>
//       {/* <CardFooter className="flex-col gap-2 text-sm">
//         <div className="flex items-center gap-2 font-medium leading-none">
//           Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
//         </div>
//         <div className="leading-none text-muted-foreground">
//           Showing total count for the last 6 months
//         </div>
//       </CardFooter> */}
//     </Card>
//   );
// }

import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function ChartPie({ chartData }: { chartData: ChartDataItem[] }) {
  const transformChartData = (
    apiData: { mood: string; count: number }[],
  ): ChartDataItem[] => {
    // Create a map of moods to their index in chartConfig
    const moodIndex = Object.keys(chartConfig).reduce(
      (acc, mood, index) => {
        acc[mood] = index + 1; // Adding 1 because chart colors start from 1
        return acc;
      },
      {} as Record<string, number>,
    );

    return apiData.map((item) => ({
      ...item,
      fill: `var(--chart-${moodIndex[item.mood]})`,
    }));
  };
  const newchartData = transformChartData(chartData);
  console.log(newchartData);
  return (
    <Card className="flex flex-col border-none shadow-none">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="count" hideLabel />}
            />
            <Pie data={newchartData} dataKey="count" nameKey={"mood"}></Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
