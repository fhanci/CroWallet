import axios from "axios";
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
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { t } from "i18next";
import { useUser } from "../config/UserStore";

const NotificationPage = () => {
  const [debts, setDebts] = useState([]);
  const { user } = useUser();
  const token = localStorage.getItem("token");

  const fetchDebts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8082/api/debts/get/${user.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      const filtered = res.data
        .filter(
          (d) =>
            d.debtAmount > 0 &&
            new Date(d.dueDate) <=
              new Date(Date.now() + d.warningPeriod * 24 * 60 * 60 * 1000)
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setDebts(filtered);
    } catch (error) {
      console.error("Bildirimler alınamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8082/api/debts/delete/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      setDebts((prev) => prev.filter((debt) => debt.id !== id));
    } catch (error) {
      console.error("Borç silinemedi:", error);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [user.id]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {t("upcomingDebts")}
      </Typography>

      {debts.length > 0 ? (
        <Box display="flex" justifyContent="center">
          <Paper sx={{ width: "100%", maxWidth: 700 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("toWhom")}</TableCell>
                  <TableCell>{t("amount")}</TableCell>
                  <TableCell>{t("dueDateTwo")}</TableCell>
                  <TableCell>{t("actions")}</TableCell>
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
                      {new Date(debt.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(debt.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
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
