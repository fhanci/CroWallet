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
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";

const DebtCreatePage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [accounts, setAccounts] = useState([]);

  const [debtAmount, setDebtAmount] = useState("");
  const [debtCurrency, setDebtCurrency] = useState("");
  const [toWhom, setToWhom] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [warningPeriod, setWarningPeriod] = useState("");
  const [selectedAddAccount, setSelectedAddAccount] = useState(null);

  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/accounts");
        if (!res.ok) throw new Error("Hesaplar alınamadı");
        const data = await res.json();
        const userAccounts = data.filter((a) => a.user?.id === parseInt(userId));
        setAccounts(userAccounts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, [userId]);

  const handleAddDebt = async () => {
    if (
      !debtAmount.trim() ||
      !debtCurrency.trim() ||
      !toWhom.trim() ||
      !dueDate.trim() ||
      !warningPeriod.toString().trim() ||
      !selectedAddAccount
    ) {
      setError("Lütfen tüm alanları eksiksiz doldurun!");
      return;
    }

    if (selectedAddAccount.currency !== debtCurrency) {
      setError("Seçilen hesabın para birimi ile borcun para birimi uyuşmuyor!");
      return;
    }

    try {
      const createDate = new Date().toISOString();

      const newDebt = {
        debtAmount: parseFloat(debtAmount),
        debtCurrency,
        toWhom,
        dueDate,
        warningPeriod,
        status: "odenmedi",
        user: { id: parseInt(userId) },
        account: { id: selectedAddAccount.id }, // Borca bağlı hesap burada atanıyor
      };

      // Borç kaydı oluştur
      const response = await fetch("http://localhost:8080/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDebt),
      });

      if (!response.ok) throw new Error("Borç işlemi başarısız!");

      // Hesap bakiyesini güncelle
      const updatedBalance = selectedAddAccount.balance + parseFloat(debtAmount);

      const accountResponse = await fetch(
        `http://localhost:8080/api/accounts/${selectedAddAccount.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...selectedAddAccount,
            balance: updatedBalance,
            updateDate: createDate,
          }),
        }
      );

      if (!accountResponse.ok) throw new Error("Hesap bakiyesi güncellenemedi!");

      // Transfer hareketi oluştur
      const transferData = {
        amount: parseFloat(debtAmount),
        category: "Borç Alma",
        details: "Borç alma",
        date: createDate,
        createDate,
        user: { id: parseInt(userId) },
        account: { id: selectedAddAccount.id },
        type: "incoming",
        person: toWhom,
        inputPreviousBalance: selectedAddAccount.balance,
        inputNextBalance: updatedBalance,
      };

      const transferResponse = await fetch("http://localhost:8080/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferData),
      });

      if (!transferResponse.ok) throw new Error("Transfer işlemi kaydedilemedi!");

      setOpenSnackbar(true);
      setError("");
      setTimeout(() => navigate("/debt"), 1000);
    } catch (err) {
      console.error(err);
      setError("Bir hata oluştu, tekrar deneyiniz.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Borç Ekle
      </Typography>

      <TextField
        label="Kime"
        placeholder="Borçlu olduğunuz kişiyi girin"
        value={toWhom}
        onChange={(e) => setToWhom(e.target.value)}
        fullWidth
        margin="normal"
        required
        autoComplete="new-password"
        inputProps={{ autoComplete: "new-password" }}
        spellCheck={false}
      />

      <TextField
        label="Miktar"
        type="number"
        value={debtAmount}
        onChange={(e) => setDebtAmount(e.target.value)}
        fullWidth
        margin="normal"
        required
        autoComplete="new-password"
        inputProps={{ autoComplete: "new-password" }}
        spellCheck={false}
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel id="currency-label">Para Birimi</InputLabel>
        <Select
          labelId="currency-label"
          id="currency-select"
          value={debtCurrency}
          onChange={(e) => setDebtCurrency(e.target.value)}
          label="Para Birimi"
          required
        >
          <MenuItem value="EUR">€ EUR</MenuItem>
          <MenuItem value="USD">$ USD</MenuItem>
          <MenuItem value="TRY">₺ TRY</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Son Ödeme Tarihi"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
        autoComplete="new-password"
        inputProps={{ autoComplete: "new-password" }}
        spellCheck={false}
      />

      <TextField
        label="Uyarılma Süresi (Gün)"
        type="number"
        placeholder="Son ödeme tarihinden kaç gün önce size hatırlatalım?"
        value={warningPeriod}
        onChange={(e) => setWarningPeriod(e.target.value)}
        fullWidth
        margin="normal"
        required
        autoComplete="new-password"
        inputProps={{ autoComplete: "new-password" }}
        spellCheck={false}
      />

      <FormControl fullWidth margin="normal" required>
        <InputLabel id="account-label">Hesap Seçin</InputLabel>
        <Select
          labelId="account-label"
          id="account-select"
          value={selectedAddAccount?.id || ""}
          onChange={(e) => setSelectedAddAccount(accounts.find((a) => a.id === e.target.value))}
          label="Hesap Seçin"
          required
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.accountName} - {account.balance} {account.currency}
            </MenuItem>
          ))}
        </Select>

        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, ml: 1 }}>
          Borcunuz seçtiğiniz hesaba gelir olarak eklenecektir.
        </Typography>

      </FormControl>

      {error && (
        <Box sx={{ bgcolor: "#ffdddd", p: 2, borderRadius: 1, mt: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Box textAlign="center" mt={3}>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleAddDebt}
          disabled={
            !debtAmount ||
            !debtCurrency ||
            !toWhom ||
            !dueDate ||
            !warningPeriod ||
            !selectedAddAccount
          }
        >
          Kaydet
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Borç başarıyla eklendi!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DebtCreatePage;
