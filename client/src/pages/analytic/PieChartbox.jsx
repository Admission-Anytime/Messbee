import { PieChart } from "@mui/x-charts/PieChart";

const data2 = [
  { id: 1, label: "Marketing", value: 4567 },
  { id: 2, label: "Utility", value: 2400 },
  { id: 3, label: "Service", value: 1398 },
  { id: 4, label: "Authentication", value: 800 },
];

export default function PieChartbox() {
  return (
    <PieChart
      colors={["#10B981", "#3B82F6", "#F59E0B", "#EF4444"]} // Fresh Modern Colors
      series={[
        {
          data: data2,
          innerRadius: 40,
          outerRadius: 110,
          paddingAngle: 4,
          cornerRadius: 6,
          startAngle: -90,
          cx: 140, // Centers the pie a bit better
        },
      ]}
      height={280} // Fixed height for responsive filling
      slotProps={{
        legend: {
          direction: 'column',
          position: { vertical: 'middle', horizontal: 'right' },
          labelStyle: {
            fontFamily: 'Urbanist',
            fontWeight: 600,
            fill: '#475569',
          }
        },
      }}
    />
  );
}