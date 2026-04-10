import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

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
  const chartData = useMemo(() => {
    let cumulativeTotal = 0;
    

    return [...transactions]
      .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))
      .map((t) => {
        const type = getIncomeOrExpense(t, accountId);
        const amount = parseFloat(t.amount) || 0;

        if (type === "income") {
          cumulativeTotal += amount;
        } else if (type === "expense") {
          cumulativeTotal -= amount;
        }

        return {
          date: new Date(t.transactionDateTime),
          total: cumulativeTotal,
          currency: t.currency
        };
      });
  }, [transactions, accountId]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date"  tickFormatter={(val) => val.toLocaleDateString("tr-TR")}/>
        <YAxis tickFormatter={(val) => val.toLocaleString("tr-TR")} />
        <Tooltip
          formatter={(val,name,props) => [val.toLocaleString("tr-TR") + " " + props.payload.currency, "Bakiye"]}
          labelFormatter={(label) => `İşlem Tarihi: ${label.toLocaleString("tr-TR")}`}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#1976d2"
          dot={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Graph;
