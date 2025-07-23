import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts";

const chartSetting = {
  width: 1200,
  height: 280,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-10px, 0)",
    },
  },
};
const dataset = [
  {
    Conversation: 59,
    Utility: 10,
    Service: 5,
    month: "Jan",
  },
  {
    Conversation: 50,
    Utility: 15,
    Service: 51,
    month: "Fev",
  },
  {
    Conversation: 47,
    Utility: 5,
    Service: 25,
    month: "Mar",
  },
  {
    Conversation: 54,
    Utility: 1,
    Service: 55,
    month: "Apr",
  },
  {
    Conversation: 57,
    Utility: 100,
    Service: 35,
    month: "May",
  },
  {
    Conversation: 60,
    Utility: 80,
    Service: 58,
    month: "June",
  },
  {
    Conversation: 59,
    Utility: 80,
    month: "July",
  },
  {
    Conversation: 65,
    Utility: 80,
    Service: 5,
    month: "Aug",
  },
  {
    Conversation: 51,
    Utility: 80,
    Service: 5,
    month: "Sept",
  },
  {
    Conversation: 60,
    Utility: 80,
    Service: 5,
    month: "Oct",
  },
  {
    Conversation: 67,
    Utility: 80,
    Service: 59,
    month: "Nov",
  },
  {
    Conversation: 61,
    Utility: 80,
    Service: 56,
    month: "Dec",
  },
];

const valueFormatter = (value) => `${value}.`;

export default function BarsDataset() {
  return (
    <BarChart
      borderRadious="5px"
      dataset={dataset}
      xAxis={[{ scaleType: "band", dataKey: "month" }]}
      series={[
        { dataKey: "Conversation", label: "Conversation", valueFormatter },
        { dataKey: "Utility", label: "Utility", valueFormatter },
        { dataKey: "Service", label: "Service", valueFormatter },
      ]}
      {...chartSetting}
    />
  );
}
