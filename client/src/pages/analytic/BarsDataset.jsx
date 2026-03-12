import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts";

const chartSetting = {
  // Removed hardcoded width so it perfectly fits the Tailwind wrapper automatically
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-10px, 0)",
    },
    fontFamily: 'Urbanist',
  },
};

const dataset = [
  { Conversation: 59, Utility: 10, Service: 5, month: "Jan" },
  { Conversation: 50, Utility: 15, Service: 51, month: "Feb" },
  { Conversation: 47, Utility: 5, Service: 25, month: "Mar" },
  { Conversation: 54, Utility: 1, Service: 55, month: "Apr" },
  { Conversation: 57, Utility: 100, Service: 35, month: "May" },
  { Conversation: 60, Utility: 80, Service: 58, month: "Jun" },
  { Conversation: 59, Utility: 80, Service: 12, month: "Jul" },
  { Conversation: 65, Utility: 80, Service: 5, month: "Aug" },
  { Conversation: 51, Utility: 80, Service: 5, month: "Sep" },
  { Conversation: 60, Utility: 80, Service: 5, month: "Oct" },
  { Conversation: 67, Utility: 80, Service: 59, month: "Nov" },
  { Conversation: 61, Utility: 80, Service: 56, month: "Dec" },
];

const valueFormatter = (value) => `${value || 0}`;

export default function BarsDataset() {
  return (
    <BarChart
      dataset={dataset}
      xAxis={[{ scaleType: "band", dataKey: "month" }]}
      series={[
        { dataKey: "Conversation", label: "Marketing", valueFormatter, color: "#10B981" }, // Green
        { dataKey: "Utility", label: "Utility", valueFormatter, color: "#3B82F6" },      // Blue
        { dataKey: "Service", label: "Service", valueFormatter, color: "#F59E0B" },      // Yellow
      ]}
      borderRadius={6} // Modern rounded bars
      {...chartSetting}
    />
  );
}