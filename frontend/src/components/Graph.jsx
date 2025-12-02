import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const getIncomeOrExpense = (transaction, accountId) => {
  if (transaction.type === "inter-account") {
    if (transaction.account.id.toString() === accountId.toString()) {
      return "expense";
    }
    if (transaction.receiverId.toString() === accountId.toString()) {
      return "income";
    }
    return "problem var";
  }

  return transaction.type === "incoming" ? "income" : "expense";
};

const Graph = ({ transactions, accountId }) => {
  let cumulativeTotal = 0;

  const chartData = transactions
    .sort((a, b) => new Date(a.createDate) - new Date(b.createDate))
    .map((t) => {
      const type = getIncomeOrExpense(t, accountId);
      const amount = parseFloat(t.amount);

      if (type === "income") {
        cumulativeTotal += amount;
      } else if (type === "expense") {
        cumulativeTotal -= amount;
      }

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
