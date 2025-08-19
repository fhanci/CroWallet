import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";

const DebtPayPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [accounts, setAccounts] = useState([]);
  const [debts, setDebts] = useState([]);
  const { user } = useUser();
  const [selectedTransferAccount, setSelectedTransferAccount] = useState(null);
  const [selectedPayDebt, setSelectedPayDebt] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Hesapları çek
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/accounts/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setAccounts(res.data);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };

    fetchAccounts();
  }, [user.id]);

  // Borçları çek
  useEffect(() => {
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
        setDebts(res.data);
      } catch (err) {
        console.error("Borçlar alınamadı:", err);
      }
    };

    fetchDebts();
  }, [user.id]);

  const handlePayDebt = async () => {
    setError("");
    if (!selectedPayDebt || !selectedTransferAccount || !payAmount) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }

    if (selectedTransferAccount.currency !== selectedPayDebt.debtCurrency) {
      setError(t("currencyMismatch"));
      return;
    }

    if (parseFloat(selectedTransferAccount.balance) < parseFloat(payAmount)) {
      setError(t("balanceTooLow"));
      return;
    }

    try {
      const updatedDebtAmount =
        selectedPayDebt.debtAmount - parseFloat(payAmount);
      const updatedStatus = updatedDebtAmount <= 0 ? "odendi" : "odenmedi";
      const updatedBalance =
        selectedTransferAccount.balance - parseFloat(payAmount);
      const createDate = new Date().toISOString();

      // Borcu güncelle
      const debtResponse = await axios.put(
        `http://localhost:8082/api/debts/update/${selectedPayDebt.id}`,
        {
          ...selectedPayDebt,
          debtAmount: updatedDebtAmount > 0 ? updatedDebtAmount : 0,
          status: updatedStatus,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      // Hesap bakiyesini güncelle
      const accountResponse = await axios.put(
        `http://localhost:8082/api/accounts/update/${selectedTransferAccount.id}`,
        {
          ...selectedTransferAccount,
          balance: updatedBalance,
          updateDate: createDate,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      // Transfer kaydı oluştur
      const transferData = {
        amount: parseFloat(payAmount),
        category: "Borç Ödeme",
        details: "Borç ödeme",
        date: createDate,
        createDate,
        user: { id: parseInt(user.id) },
        account: { id: parseInt(selectedTransferAccount.id) },
        type: "outgoing",
        person: selectedPayDebt.toWhom,
        outputPreviousBalance: selectedTransferAccount.balance,
        outputNextBalance: updatedBalance,
      };

      const transferResponse = await axios.post(
        "http://localhost:8082/api/transfers/create",
        transferData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setOpenSnackbar(true);
      setTimeout(() => navigate("/debt"), 1500);
    } catch (error) {
      console.error("Borç ödeme sırasında hata:", error);
      setError("Bir hata oluştu, lütfen tekrar deneyiniz.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Borç Ödeme
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>{t("selectDebtToPay")}</InputLabel>
        <Select
          value={selectedPayDebt?.id || ""}
          onChange={(e) =>
            setSelectedPayDebt(debts.find((debt) => debt.id === e.target.value))
          }
          label={t("selectDebtToPay")}
        >
          {debts.map((debt) => (
            <MenuItem key={debt.id} value={debt.id}>
              {debt.toWhom} - {debt.debtAmount} {debt.debtCurrency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Hesap Seçin</InputLabel>
        <Select
          value={selectedTransferAccount?.id || ""}
          onChange={(e) =>
            setSelectedTransferAccount(
              accounts.find((acc) => acc.id === e.target.value)
            )
          }
          label={t("selectAccount")}
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.accountName} - {account.balance} {account.currency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label={t("payAmount")}
        type="number"
        value={payAmount}
        onChange={(e) => setPayAmount(e.target.value)}
        fullWidth
        margin="normal"
      />

      {error && (
        <Box sx={{ bgcolor: "#ffdddd", p: 2, borderRadius: 1, mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Box textAlign="center" mt={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PaymentIcon />}
          onClick={handlePayDebt}
          disabled={!selectedTransferAccount || !selectedPayDebt || !payAmount}
        >
          {t("pay")}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {t("debtPaidSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DebtPayPage;
