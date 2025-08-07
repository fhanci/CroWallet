import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { t } from "i18next";
const NotificationPage = () => {
  const [debts, setDebts] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchDebts = async () => {
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
          const filtered = data
            .filter(
              (d) =>
                d.user?.id === parseInt(userId) &&
                d.debtAmount > 0 &&
                new Date(d.dueDate) <=
                  new Date(Date.now() + d.warningPeriod * 24 * 60 * 60 * 1000)
            )
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
          setDebts(filtered);
        }
      } catch (error) {
        console.error("Bildirimler alınamadı:", error);
      }
    };

    fetchDebts();
  }, [userId]);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Başlık */}
      <Typography variant="h4" align="center" gutterBottom>
        {t("upcomingDebts")}
      </Typography>

      {/* Borçlar Tablosu */}
      {debts.length > 0 ? (
        <Box display="flex" justifyContent="center">
          <Paper sx={{ width: "100%", maxWidth: 700 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("toWhom")}</TableCell>
                  <TableCell>{t("amount")} </TableCell>
                  <TableCell>{t("dueDateTwo")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {debts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell
                      sx={{
                        color:
                          new Date(debt.dueDate) < new Date()
                            ? "error.main"
                            : "inherit",
                      }}
                    >
                      {debt.toWhom}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          new Date(debt.dueDate) < new Date()
                            ? "error.main"
                            : "inherit",
                      }}
                    >
                      {debt.debtAmount} {debt.debtCurrency}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          new Date(debt.dueDate) < new Date()
                            ? "error.main"
                            : "inherit",
                      }}
                    >
                      {new Date(debt.dueDate).toLocaleDateString("tr-TR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ) : (
        <Typography
          align="center"
          color="text.secondary"
          sx={{ fontSize: "1rem" }}
        >
          {t("noUpcomingDebts")}
        </Typography>
      )}
    </Container>
  );
};

export default NotificationPage;
