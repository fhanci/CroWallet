import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Box } from "@mui/material";
import { t } from 'i18next';
const DebtPage = () => {
  const [debts, setDebts] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/debts");
        if (!response.ok) throw new Error("Borçlar alınamadı");
        const data = await response.json();
        const userDebts = data.filter((debt) => debt.user?.id === parseInt(userId));
        setDebts(userDebts);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDebts();
  }, [userId]);

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t("myDebts")}
      </Typography>

      <Box mt={3}>
        {debts.length === 0 ? (
          <Typography>{t("noDebtsYet")}</Typography>
        ) : (
          debts
            .filter((debt) => debt.status === "odenmedi")
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .map((debt) => (
              <Paper key={debt.id} sx={{ p: 2, mb: 2 }}>
                <Typography>
                  <strong>{t("debt")}:</strong> {debt.debtAmount} {debt.debtCurrency}
                </Typography>
                <Typography>
                  <strong>{t("toWhom")}:</strong> {debt.toWhom}
                </Typography>
                <Typography>
                  <strong>{t("dueDate")}:</strong>{" "}
                  {new Date(debt.dueDate).toLocaleDateString()}
                </Typography>
              </Paper>
            ))
        )}
      </Box>
    </Container>
  );
};

export default DebtPage;
