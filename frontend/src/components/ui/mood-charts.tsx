"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type MoodChartProps = {
  dailyMoods?: Record<string, Record<string, number>>;
  allMoods?: Record<string, number>;
};

const COLORS = {
  admiration: "#9f7aea", // soft purple
  amusement: "#34d399", // bright teal green
  annoyance: "#ef4444", // red
  approval: "#10b981", // green
  caring: "#f87171", // soft red
  confusion: "#a78bfa", // lavender
  curiosity: "#06b6d4", // cyan
  desire: "#e11d48", // deep pink
  disappointment: "#94a3b8", // grey-blue
  disapproval: "#dc2626", // harsh red
  disgust: "#84cc16", // lime green
  embarrassment: "#fb7185", // blush pink
  excitement: "#facc15", // yellow
  fear: "#8b5cf6", // violet
  gratitude: "#22c55e", // rich green
  grief: "#4b5563", // dark gray
  joy: "#f59e0b", // orange-yellow
  love: "#e879f9", // bright pink
  nervousness: "#f97316", // orange
  optimism: "#60a5fa", // sky blue
  pride: "#c084fc", // light purple
  realization: "#3b82f6", // blue
  relief: "#5eead4", // mint
  remorse: "#7dd3fc", // pale blue
  sadness: "#6366f1", // indigo
  surprise: "#ec4899", // pink
  neutral: "#64748b", // gray
};

export function MoodChart({ dailyMoods, allMoods }: MoodChartProps) {
  console.log("dailyMoods", dailyMoods);
  if (dailyMoods) {
    const dates = Object.keys(dailyMoods).sort();
    const latestDate = dates[dates.length - 1];
    console.log(dailyMoods, allMoods);
    const moodData = Object.entries(dailyMoods[latestDate]).map(
      ([name, value]) => ({
        name,
        value: Number(value) * 100, // Convert to percentage
      }),
    );

    console.log(moodData);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={moodData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {moodData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[entry.name as keyof typeof COLORS] ||
                  `#${Math.floor(Math.random() * 16777215).toString(16)}`
                }
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (allMoods) {
    const moodData = Object.entries(allMoods).map(([name, value]) => ({
      name,
      value: Number(value),
    }));

    console.log(moodData);
    return (
      // <div>
      //     heloo
      // </div>
      //   <ResponsiveContainer width="100%" height="100%">
      <PieChart className="bg-red-800">
        {/* <Pie
            data={moodData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {moodData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[entry.name as keyof typeof COLORS] || `#${Math.floor(Math.random() * 16777215).toString(16)}`
                }
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${Number(value)} entries`} />
          <Legend /> */}
        <div>hello</div>
      </PieChart>
      //   </ResponsiveContainer>
    );
  }

  return null;
}
