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
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
const OutgoingTransferPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const now = new Date();

  const [accounts, setAccounts] = useState([]);
  const [selectedTransferAccount, setSelectedTransferAccount] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState({});
  const [expenseSources, setExpenseSources] = useState([]);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const hintText = t("exchangeRateHintTwo", {
    currency: selectedTransferAccount?.currency || "TRY",
  });
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/accounts");
        const data = await response.json();
        const userAccounts = data.filter(
          (acc) => acc.user.id === parseInt(userId)
        );
        setAccounts(userAccounts);
      } catch (error) {
        console.error("Hesaplar alınamadı:", error);
      }
    };

    fetchAccounts();
  }, [userId]);

  useEffect(() => {
    // Burada default expense kaynakları da ekleyebiliriz
    const defaultExpense = [
      "Kira",
      "Fatura",
      "Market Alışverişi",
      "Ulaşım",
      "Eğitim",
      "Eğlence",
      "Sağlık",
    ];
    const savedExpense =
      JSON.parse(localStorage.getItem(`expenseSources_${userId}`)) || [];
    const merged = Array.from(new Set([...defaultExpense, ...savedExpense]));
    setExpenseSources(merged);
  }, [userId]);

  const handleSubmit = async () => {
    // Detay zorunluluğunu kaldırdık, o yüzden details kontrolü kaldırıldı
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
    const currentBalance = parseFloat(selectedTransferAccount.balance);

    if (currentBalance < amount) {
      setError(t("insufficientBalance"));
      return;
    }

    const createDate = new Date(
      now.getTime() + 3 * 60 * 60 * 1000
    ).toISOString();

    const updatedTransfer = {
      ...selectedTransfer,
      exchangeRate:
        selectedTransferAccount.currency === "TRY"
          ? 1
          : selectedTransfer.exchangeRate,
      type: "outgoing",
      createDate,
      user: { id: parseInt(userId) },
      account: { id: parseInt(selectedTransferAccount.id) },
      outputPreviousBalance: currentBalance,
      outputNextBalance: currentBalance - amount,
    };

    const updatedAccount = {
      ...selectedTransferAccount,
      balance: currentBalance - amount,
      updateDate: createDate,
    };

    try {
      const response = await fetch("http://localhost:8082/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTransfer),
      });

      const response2 = await fetch(
        `http://localhost:8082/api/accounts/${selectedTransferAccount.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAccount),
        }
      );

      if (response.ok && response2.ok) {
        setOpenSnackbar(true);
        setTimeout(() => navigate("/account"), 1000);
      } else {
        setError(t("transferFailed"));
      }
    } catch (err) {
      console.error("Transfer hatası:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  const detailsOptions = {
    Kira: ["Ev Kirası", "Ofis Kirası", "Dükkan Kirası", "Depo Kirası"],
    Fatura: [
      "Elektrik Faturası",
      "Su Faturası",
      "İnternet Faturası",
      "Doğalgaz Faturası",
      "Telefon Faturası",
    ],
    "Market Alışverişi": [
      "Gıda Ürünleri",
      "İçecekler",
      "Kişisel Bakım Ürünleri",
      "Temizlik Malzemeleri",
    ],
    Ulaşım: [
      "Toplu Taşıma",
      "Benzin ve Mazot",
      "Araç Bakımı",
      "Sigorta ve Muayene",
      "Araç Kiralama",
    ],
    Eğitim: [
      "Okul Ücreti",
      "Kurs Ücreti",
      "Kitap ve Kırtasiye",
      "Online Eğitim Platformları",
    ],
    Eğlence: [
      "Sinema ve Tiyatro",
      "Konser ve Etkinlikler",
      "Online Abonelikler",
      "Tatiller ve Geziler",
    ],
    Sağlık: [
      "Hastane Masrafı",
      "Eczane Alışverişi",
      "Diş Tedavisi",
      "Göz Muayenesi",
      "Özel Sağlık Sigortası",
    ],
  };

  const selectedCategory = selectedTransfer?.category || "";
  const selectedDetailsOptions = detailsOptions[selectedCategory] || [];

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" align="center" gutterBottom>
        Para Çıkar
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel id="account-label">{t("selectAccount")}</InputLabel>
        <Select
          labelId="account-label"
          id="account-select"
          value={selectedTransferAccount?.id || ""}
          label="Hesap Seçin*"
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

      <FormControl fullWidth margin="normal">
        <Autocomplete
          freeSolo
          options={expenseSources}
          value={selectedTransfer.category || ""}
          onChange={(e, newValue) =>
            setSelectedTransfer({ ...selectedTransfer, category: newValue })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("category")}
              fullWidth
              margin="normal"
            />
          )}
        />
      </FormControl>

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
          Para çıkışı kaydedildi!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OutgoingTransferPage;
