import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { PieChart, Pie, Tooltip, Cell, Legend } from "recharts";
import { useTranslation } from "react-i18next";

const AccountPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [debts, setDebts] = useState([]);
  const [yaklasanBorclar, setYaklasanBorclar] = useState(0);
  const [incomeSources, setIncomeSources] = useState([]);
  const [expenseSources, setExpenseSources] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A83279",
    "#6A89CC",
  ];

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:8082/api/accounts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.filter((a) => a.user.id === parseInt(userId)));
        }
      } catch (error) {
        console.error("Hata:", error);
      }
    };
    fetchAccounts();
  }, [userId]);

  useEffect(() => {
    const fetchTransfers = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:8082/api/transfers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setTransfers(data.filter((t) => t.user?.id === parseInt(userId)));
        }
      } catch (error) {
        console.error("Transfer alınamadı:", error);
      }
    };
    fetchTransfers();
  }, [userId]);

  useEffect(() => {
    const fetchDebts = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await fetch("http://localhost:8082/api/debts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter(
            (d) => d.user?.id === parseInt(userId) && d.debtAmount > 0
          );
          setDebts(filtered);
          const upcoming = filtered.filter(
            (borc) =>
              new Date(borc.dueDate) <=
              new Date(Date.now() + borc.warningPeriod * 24 * 60 * 60 * 1000)
          ).length;
          setYaklasanBorclar(upcoming);
        }
      } catch (error) {
        console.error("Borçlar alınırken hata:", error);
      }
    };
    fetchDebts();
  }, [userId]);

  useEffect(() => {
    setIncomeSources(
      JSON.parse(localStorage.getItem(`incomeSources_${userId}`)) || []
    );
    setExpenseSources(
      JSON.parse(localStorage.getItem(`expenseSources_${userId}`)) || []
    );
  }, [userId]);

  const handleOpenAccountDetails = (account) => {
    navigate(`/transactions/${account.id}`);
  };

  const renderAccount = accounts.map((item) => (
    <Card
      key={item.id}
      sx={{
        width: {
          xs: "90%",
          sm: 260,
          md: 300,
        },
        height: 130,
        p: 0.75,
        bgcolor: "rgba(159, 177, 240, 0.45)",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": { transform: "scale(1.05)" },
      }}
      onClick={() => handleOpenAccountDetails(item)}
    >
      <AccountBalanceIcon sx={{ fontSize: 55, color: "gray.main", mr: 2 }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <CardContent>
          <Typography variant="h6">{item.accountName}</Typography>
          <Typography variant="body1">
            {item.balance != null
              ? `${item.balance} ${item.currency || ""}`
              : "Bilinmiyor"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(item.updateDate).toLocaleString("tr-TR")}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  ));

  const getChartData = (sources, type, transfers) =>
    sources.map((source) => {
      const total = transfers
        .filter((t) => t.type === type && t.category === source)
        .reduce((sum, t) => sum + t.amount * (t.exchangeRate || 1), 0);
      return { name: source, value: total };
    });

  const incomeData = getChartData(incomeSources, "incoming", transfers);
  const expenseData = getChartData(expenseSources, "outgoing", transfers);

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "75vw",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          p: 2,
        }}
      >
        <Typography variant="h4">{t("accounts")}</Typography>
      </Box>

      {accounts.length === 0 && (
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {t("noAccounts")}
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 5,
          mt: 4,
          width: "100%",
          justifyItems: "center",
        }}
      >
        {renderAccount}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "75vw",
          mt: 10,
        }}
      >
        <Typography variant="h5" align="center">
          {t("sources")}
        </Typography>

        {incomeData.length === 0 && expenseData.length === 0 ? (
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            {t("noTransactions")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", gap: 5, mt: 3 }}>
            <Box>
              <Typography variant="h6">{t("incomeSources")}</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} TRY`} />
                <Legend />
              </PieChart>
            </Box>

            <Box>
              <Typography variant="h6">{t("expenseSources")}</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {expenseData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} TRY`} />
                <Legend />
              </PieChart>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AccountPage;
