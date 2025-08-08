import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useUser } from "../config/UserStore";
import axios from "axios";

const AccountToAccountTransferPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const now = new Date();
  const token = localStorage.getItem("token");
  const [accounts, setAccounts] = useState([]);
  const [selectedSenderAccount, setSelectedSenderAccount] = useState(null);
  const [selectedReceiverAccount, setSelectedReceiverAccount] = useState(null);
  const [transferData, setTransferData] = useState({});
  const [error, setError] = useState(null);
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

  const handleSubmit = async () => {
    if (
      !selectedSenderAccount ||
      !selectedReceiverAccount ||
      !transferData.amount ||
      !transferData.date ||
      (selectedSenderAccount.currency !== selectedReceiverAccount.currency &&
        !transferData.exchangeRate)
    ) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (selectedSenderAccount.id === selectedReceiverAccount.id) {
      setError(t("sameAccountError"));
      return;
    }

    const amount = parseFloat(transferData.amount);
    const senderBalance = parseFloat(selectedSenderAccount.balance);

    if (senderBalance < amount) {
      setError(t("insufficientBalance"));
      return;
    }

    const createDate = new Date(
      now.getTime() + 3 * 60 * 60 * 1000
    ).toISOString();
    const exchangeRate =
      selectedSenderAccount.currency === selectedReceiverAccount.currency
        ? 1
        : parseFloat(transferData.exchangeRate);

    const convertedAmount = amount * exchangeRate;

    const outgoingTransfer = {
      amount,
      user: { id: user.id },
      account: { id: selectedSenderAccount.id },
      type: "inter-account",
      createDate,
      date: transferData.date,
      exchangeRate,
      person: selectedReceiverAccount.accountName,
      description: transferData.description,
      outputPreviousBalance: senderBalance,
      outputNextBalance: senderBalance - amount,
    };

    const incomingTransfer = {
      amount: convertedAmount,
      user: { id: user.id },
      account: { id: selectedReceiverAccount.id },
      type: "inter-account",
      createDate,
      date: transferData.date,
      exchangeRate,
      person: selectedSenderAccount.accountName,
      description: transferData.description,
      inputPreviousBalance: selectedReceiverAccount.balance,
      inputNextBalance: selectedReceiverAccount.balance + convertedAmount,
    };

    const updatedSender = {
      ...selectedSenderAccount,
      balance: senderBalance - amount,
      updateDate: createDate,
    };

    const updatedReceiver = {
      ...selectedReceiverAccount,
      balance: selectedReceiverAccount.balance + convertedAmount,
      updateDate: createDate,
    };

    try {
      const [res1, res2, res3, res4] = await Promise.all([
        axios.post(
          "http://localhost:8082/api/transfers/create",
          outgoingTransfer,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        ),
        axios.post(
          "http://localhost:8082/api/transfers/create",
          incomingTransfer,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        ),
        axios.put(
          `http://localhost:8082/api/accounts/update/${selectedSenderAccount.id}`,
          updatedSender,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        ),
        axios.put(
          `http://localhost:8082/api/accounts/update/${selectedReceiverAccount.id}`,
          updatedReceiver,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        ),
      ]);
      setOpenSnackbar(true);
      setTimeout(() => navigate("/account"), 1000);
    } catch (err) {
      console.error("Transfer hatası:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" align="center" gutterBottom>
        {t("interAccount")} Transfer
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="sender-label">{t("senderAccount")}</InputLabel>
        <Select
          labelId="sender-label"
          id="sender-select"
          value={selectedSenderAccount?.id || ""}
          label={t("senderAccount")}
          onChange={(e) =>
            setSelectedSenderAccount(
              accounts.find((acc) => acc.id === e.target.value)
            )
          }
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.accountName} - {account.balance} {account.currency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="receiver-label">{t("receiverAccount")}</InputLabel>
        <Select
          labelId="receiver-label"
          id="receiver-select"
          value={selectedReceiverAccount?.id || ""}
          label={t("receiverAccount")}
          onChange={(e) =>
            setSelectedReceiverAccount(
              accounts.find((acc) => acc.id === e.target.value)
            )
          }
        >
          {accounts
            .filter((acc) => acc.id !== selectedSenderAccount?.id) // Burada filtreleme yapıyoruz
            .map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.accountName} - {account.balance} {account.currency}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Box display="flex" alignItems="center" marginTop={2} marginBottom={1}>
        <TextField
          label={t("amount")}
          type="number"
          value={transferData.amount || ""}
          onChange={(e) =>
            setTransferData({ ...transferData, amount: e.target.value })
          }
          fullWidth
        />
        <Typography
          sx={{
            marginLeft: 1,
            whiteSpace: "nowrap",
            lineHeight: "40px",
            fontSize: "1rem",
            color: "gray",
          }}
        >
          {selectedSenderAccount?.currency}
        </Typography>
      </Box>

      {selectedSenderAccount &&
        selectedReceiverAccount &&
        selectedSenderAccount.currency !== selectedReceiverAccount.currency && (
          <>
            <TextField
              label={t("exchangeRate")}
              type="number"
              value={transferData.exchangeRate || ""}
              onChange={(e) =>
                setTransferData({
                  ...transferData,
                  exchangeRate: e.target.value,
                })
              }
              fullWidth
              margin="normal"
              placeholder={`1 ${selectedSenderAccount?.currency} = ? ${selectedReceiverAccount?.currency}`}
            />

            <Typography variant="caption" sx={{ color: "gray", mt: 0.5 }}>
              {t("exchangeRateHint")}
            </Typography>
          </>
        )}

      <TextField
        label={t("date")}
        type="date"
        value={transferData.date || ""}
        onChange={(e) =>
          setTransferData({ ...transferData, date: e.target.value })
        }
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        InputProps={{
          sx: {
            "& input::-webkit-calendar-picker-indicator": {
              cursor: "pointer",
              display: "block",
              position: "relative",
              right: 0,
              filter: "none",
            },
          },
          // KLAVYEDEN MANUEL GİRİŞ İZNİ VERİYORUZ, ONKEYDOWN KALDIRILDI
        }}
      />

      <TextField
        label={t("description")}
        value={transferData.description || ""}
        onChange={(e) =>
          setTransferData({ ...transferData, description: e.target.value })
        }
        fullWidth
        margin="normal"
      />

      {error && (
        <Typography color="error" align="center" mt={1}>
          {error}
        </Typography>
      )}

      <Box textAlign="center" mt={2}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Transfer Yap
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {t("transferSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountToAccountTransferPage;
