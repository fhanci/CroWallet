import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Graph = ({ transactions }) => {
  let cumulativeTotal = 0;

  const chartData = transactions
    .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
    .map((t) => {
      cumulativeTotal += parseFloat(t.amount);
      return {
        date: new Date(t.createDate).toLocaleDateString("tr-TR"),
        total: cumulativeTotal,
      };
    });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#1976d2" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Graph;
