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
import { t } from "i18next";
import { useUser } from "../config/UserStore";
import axios from "axios";
const DebtCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const token = localStorage.getItem("token");
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
        const response = await axios.get(
          `http://localhost:8082/api/accounts/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setAccounts(response.data);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [user.id]);
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8082/api/accounts/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setAccounts(response.data);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [user.id]);

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
      setError(t("currencyMismatch"));
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
        user: { id: user.id },
        account: { id: selectedAddAccount.id }, // Borca bağlı hesap burada atanıyor
      };

      // Borç kaydı oluştur
      const response = await axios.post(
        "http://localhost:8082/api/debts/create",
        newDebt,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      // Hesap bakiyesini güncelle
      const updatedBalance =
        selectedAddAccount.balance + parseFloat(debtAmount);

      const accountResponse = await axios.put(
        `http://localhost:8082/api/accounts/update/${selectedAddAccount.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({
            ...selectedAddAccount,
            balance: updatedBalance,
            updateDate: createDate,
          }),
        }
      );

      // Transfer hareketi oluştur
      const transferData = {
        amount: parseFloat(debtAmount),
        category: "Borç Alma",
        details: "Borç alma",
        date: createDate,
        createDate,
        user: { id: parseInt(user.id) },
        account: { id: selectedAddAccount.id },
        type: "incoming",
        person: toWhom,
        inputPreviousBalance: selectedAddAccount.balance,
        inputNextBalance: updatedBalance,
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
        {t("addDebt")}
      </Typography>

      <TextField
        label={t("toWhom")}
        placeholder={t("toWhomPlaceholder")}
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
        label={t("amount")}
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
        <InputLabel id="currency-label">{t("currency")}</InputLabel>
        <Select
          labelId="currency-label"
          id="currency-select"
          value={debtCurrency}
          onChange={(e) => setDebtCurrency(e.target.value)}
          label={t("currency")}
          required
        >
          <MenuItem value="EUR">{t("eur")}</MenuItem>
          <MenuItem value="USD">{t("usd")}</MenuItem>
          <MenuItem value="TRY">{t("try")}</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label={t("dueDate")}
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
        label={t("warningPeriod")}
        type="number"
        placeholder={t("warningPeriodPlaceholder")}
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
        <InputLabel id="account-label">{t("selectAccount")}</InputLabel>
        <Select
          labelId="account-label"
          id="account-select"
          value={selectedAddAccount?.id || ""}
          onChange={(e) =>
            setSelectedAddAccount(accounts.find((a) => a.id === e.target.value))
          }
          label="Hesap Seçin"
          required
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.accountName} - {account.balance} {account.currency}
            </MenuItem>
          ))}
        </Select>

        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 0.5, ml: 1 }}
        >
          {t("accountNote")}
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
          {t("save")}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {t("debtAddedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DebtCreatePage;
