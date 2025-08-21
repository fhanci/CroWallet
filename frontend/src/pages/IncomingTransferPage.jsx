import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Button,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useUser } from "../config/UserStore";

const IncomingTransferPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const now = new Date();
  const token = localStorage.getItem("token");
  const [accounts, setAccounts] = useState([]);
  const [selectedTransferAccount, setSelectedTransferAccount] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState({});
  const [incomeSources, setIncomeSources] = useState([]);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const currency = selectedTransferAccount?.currency || "USD";
  const hintText = t("exchangeRateHintTwo", {
    currency: currency,
  });
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

  useEffect(() => {
    const defaultIncome = t("defaultIncomeOptions", { returnObjects: true });

    const savedIncome =
      JSON.parse(localStorage.getItem(`incomeSources_${user.id}`)) || [];
    const merged = Array.from(new Set([...defaultIncome, ...savedIncome]));
    setIncomeSources(merged);
  }, [user.id]);

  const handleSubmit = async () => {
    if (
      !selectedTransferAccount ||
      !selectedTransfer.amount ||
      !selectedTransfer.category ||
      !selectedTransfer.date ||
      (selectedTransferAccount.currency !== "TRY" &&
        !selectedTransfer.exchangeRate)
    ) {
      setError(t("requiredFieldsError"));
      return;
    }

    const amount = parseFloat(selectedTransfer.amount);
    const createDate = new Date(
      now.getTime() + 3 * 60 * 60 * 1000
    ).toISOString();

    const transferPayload = {
      ...selectedTransfer,
      exchangeRate:
        selectedTransferAccount.currency === "TRY"
          ? 1
          : selectedTransfer.exchangeRate,
      user: { id: user.id },
      account: { id: parseInt(selectedTransferAccount.id) },
      amount,
      date: selectedTransfer.date,
      createDate,
    };

    try {
      await axios.post(
        "http://localhost:8082/api/transfers/add-money",
        transferPayload,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setOpenSnackbar(true);
      setTimeout(() => navigate("/account"), 1000);
    } catch (err) {
      console.error("Transfer hatası:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  const detailsOptions = t("incomeDetails", { returnObjects: true });

  const selectedCategory = selectedTransfer?.category || "";
  const selectedDetailsOptions = detailsOptions[selectedCategory] || [];

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" align="center" gutterBottom>
        {t("addMoney")}
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="account-label">{t("selectAccount")}</InputLabel>
        <Select
          labelId="account-label"
          id="account-select"
          value={selectedTransferAccount?.id || ""}
          label={t("chooseAccount")}
          onChange={(e) =>
            setSelectedTransferAccount(
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

      {selectedTransferAccount?.currency !== "TRY" && (
        <>
          <TextField
            label={t("exchangeRate")}
            type="number"
            value={selectedTransfer.exchangeRate || ""}
            onChange={(e) =>
              setSelectedTransfer({
                ...selectedTransfer,
                exchangeRate: e.target.value,
              })
            }
            fullWidth
            margin="normal"
          />
          <Typography variant="caption" sx={{ color: "gray", mt: 0.5 }}>
            {hintText}
          </Typography>
        </>
      )}

      <Box display="flex" alignItems="center" marginTop={2} marginBottom={1}>
        <TextField
          label={t("amount")}
          type="number"
          value={selectedTransfer.amount || ""}
          onChange={(e) =>
            setSelectedTransfer({ ...selectedTransfer, amount: e.target.value })
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
          {selectedTransferAccount?.currency}
        </Typography>
      </Box>

      <TextField
        label={t("date")}
        type="date"
        value={selectedTransfer.date || ""}
        onChange={(e) =>
          setSelectedTransfer({ ...selectedTransfer, date: e.target.value })
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
        }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="category-label">{t("category")}</InputLabel>
        <Select
          labelId="category-label"
          id="category-select"
          value={selectedTransfer.category || ""}
          label={t("category")}
          onChange={(e) =>
            setSelectedTransfer({
              ...selectedTransfer,
              category: e.target.value,
            })
          }
        >
          {incomeSources.map((source) => (
            <MenuItem key={source} value={source}>
              {source}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        freeSolo
        options={selectedDetailsOptions}
        value={selectedTransfer.details || ""}
        onChange={(e, newValue) =>
          setSelectedTransfer({ ...selectedTransfer, details: newValue })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("addMoney")}
            fullWidth
            margin="normal"
          />
        )}
      />
      <Typography variant="caption" sx={{ color: "gray", mt: 0.5 }}>
        {t("detailsHint")}
      </Typography>

      {error && (
        <Typography color="error" align="center" mt={1}>
          {error}
        </Typography>
      )}

      <TextField
        label={t("description")}
        value={selectedTransfer.description || ""}
        onChange={(e) =>
          setSelectedTransfer({
            ...selectedTransfer,
            description: e.target.value,
          })
        }
        fullWidth
        margin="normal"
      />

      <Box textAlign="center" mt={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
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
          {t("moneyAddedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IncomingTransferPage;
