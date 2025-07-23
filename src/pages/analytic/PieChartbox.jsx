import { PieChart } from "@mui/x-charts/PieChart";

const data2 = [
  { id: 1, label: "Group A", value: 2400 },
  { id: 2, label: "Group B", value: 4567 },
  { id: 3, label: "Group C", value: 1398 },
  { id: 4, label: "Group D", value: 1398 },
  { id: 5, label: "Group E", value: 1398 },
];

export default function PieChartbox() {
  return (
    <PieChart
      colors={["#ba2525", "#610404", "#f0b429", "#423d33", "#faf9f7"]}
      series={[
        {
          data: data2,
          innerRadius: 30,
          outerRadius: 100,
          paddingAngle: 5,
          cornerRadius: 5,
          startAngle: -90,
        },
      ]}
      width={400}
      height={200}
    />
  );
}
