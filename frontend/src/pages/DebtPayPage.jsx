import React, { useEffect, useState } from "react";
import {Container,Typography,Box,FormControl,InputLabel,Select,MenuItem,TextField,Button,Snackbar,Alert,} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";

const DebtPayPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [accounts, setAccounts] = useState([]);
  const [debts, setDebts] = useState([]);

  const [selectedTransferAccount, setSelectedTransferAccount] = useState(null);
  const [selectedPayDebt, setSelectedPayDebt] = useState(null);
  const [payAmount, setPayAmount] = useState("");

  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Hesapları çek
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://localhost:8082/api/accounts");
        if (res.ok) {
          const data = await res.json();
          const userAccounts = data.filter((acc) => acc.user.id === parseInt(userId));
          setAccounts(userAccounts);
        }
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };

    fetchAccounts();
  }, [userId]);

  // Borçları çek
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const res = await fetch("http://localhost:8082/api/debts");
        if (res.ok) {
          const data = await res.json();
          const userDebts = data.filter((debt) => debt.user.id === parseInt(userId) && debt.status === "odenmedi");
          setDebts(userDebts);
        }
      } catch (err) {
        console.error("Borçlar alınamadı:", err);
      }
    };

    fetchDebts();
  }, [userId]);

  const handlePayDebt = async () => {
    setError("");
    if (!selectedPayDebt || !selectedTransferAccount || !payAmount) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }

    if (selectedTransferAccount.currency !== selectedPayDebt.debtCurrency) {
      setError("Seçilen hesabın para birimi ile borcun para birimi uyuşmuyor!");
      return;
    }

    if (parseFloat(selectedTransferAccount.balance) < parseFloat(payAmount)) {
      setError("Bakiye yetersiz! Lütfen farklı bir hesap seçin veya miktarı azaltın.");
      return;
    }

    try {
      const updatedDebtAmount = selectedPayDebt.debtAmount - parseFloat(payAmount);
      const updatedStatus = updatedDebtAmount <= 0 ? "odendi" : "odenmedi";
      const updatedBalance = selectedTransferAccount.balance - parseFloat(payAmount);
      const createDate = new Date().toISOString();

      // Borcu güncelle
      const debtResponse = await fetch(`http://localhost:8082/api/debts/${selectedPayDebt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedPayDebt,
          debtAmount: updatedDebtAmount > 0 ? updatedDebtAmount : 0,
          status: updatedStatus,
        }),
      });

      if (!debtResponse.ok) throw new Error("Borç ödeme işlemi başarısız!");

      // Hesap bakiyesini güncelle
      const accountResponse = await fetch(`http://localhost:8082/api/accounts/${selectedTransferAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedTransferAccount,
          balance: updatedBalance,
          updateDate: createDate,
        }),
      });

      if (!accountResponse.ok) throw new Error("Hesap bakiyesi güncellenemedi!");

      // Transfer kaydı oluştur
      const transferData = {
        amount: parseFloat(payAmount),
        category: "Borç Ödeme",
        details: "Borç ödeme",
        date: createDate,
        createDate,
        user: { id: parseInt(userId) },
        account: { id: parseInt(selectedTransferAccount.id) },
        type: "outgoing",
        person: selectedPayDebt.toWhom,
        outputPreviousBalance: selectedTransferAccount.balance,
        outputNextBalance: updatedBalance,
      };

      const transferResponse = await fetch("http://localhost:8082/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      });

      if (!transferResponse.ok) throw new Error("Transfer işlemi kaydedilemedi!");

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
        <InputLabel>Ödenecek Borcu Seçin</InputLabel>
        <Select
          value={selectedPayDebt?.id || ""}
          onChange={(e) => setSelectedPayDebt(debts.find((debt) => debt.id === e.target.value))}
          label="Ödenecek Borcu Seçin"
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
          onChange={(e) => setSelectedTransferAccount(accounts.find((acc) => acc.id === e.target.value))}
          label="Hesap Seçin"
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.accountName} - {account.balance} {account.currency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Ödenecek Miktar"
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
          Öde
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Borç ödeme başarılı!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DebtPayPage;
