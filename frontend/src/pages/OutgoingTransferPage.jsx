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
  Card,
  CardContent,
  Chip,
  Collapse,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";

const OutgoingTransferPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const now = new Date();
  const token = localStorage.getItem("token");
  const [accounts, setAccounts] = useState([]);
  const [selectedTransferAccount, setSelectedTransferAccount] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState({});
  const [expenseSources, setExpenseSources] = useState([]);
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "TRY": return "₺";
      case "USD": return "$";
      case "EUR": return "€";
      default: return currency;
    }
  };

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
        // Only show CURRENCY type accounts
        const currencyAccounts = res.data.filter(
          acc => !acc.accountType || acc.accountType === "CURRENCY"
        );
        setAccounts(currencyAccounts);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [user.id]);

  useEffect(() => {
    const defaultExpense = [
      "Kira",
      "Fatura",
      "Market Alışverişi",
      "Ulaşım",
      "Eğitim",
      "Eğlence",
      "Sağlık",
      "Diğer",
    ];
    const savedExpense =
      JSON.parse(localStorage.getItem(`expenseSources_${user.id}`)) || [];
    const merged = Array.from(new Set([...defaultExpense, ...savedExpense]));
    // Ensure "Diğer" is always at the end
    const filtered = merged.filter(item => item !== "Diğer");
    filtered.push("Diğer");
    setExpenseSources(filtered);
  }, [user.id]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedTransfer({
      ...selectedTransfer,
      category: value,
    });
    // Reset custom category when switching away from "Diğer"
    if (value !== "Diğer") {
      setCustomCategory("");
    }
  };

  const handleSubmit = async () => {
    // Determine final category
    const finalCategory = selectedTransfer.category === "Diğer" 
      ? customCategory 
      : selectedTransfer.category;

    if (
      !selectedTransferAccount ||
      !selectedTransfer.amount ||
      !finalCategory ||
      !selectedTransfer.date
    ) {
      setError(t("requiredFieldsError"));
      return;
    }

    if (selectedTransfer.category === "Diğer" && !customCategory.trim()) {
      setError("Lütfen özel kategori adı girin.");
      return;
    }

    const amount = parseFloat(selectedTransfer.amount);
    const currentBalance = parseFloat(selectedTransferAccount.balance);

    if (amount <= 0) {
      setError("Tutar 0'dan büyük olmalıdır.");
      return;
    }

    if (currentBalance < amount) {
      setError(t("insufficientBalance"));
      return;
    }

    const createDate = new Date(
      now.getTime() + 3 * 60 * 60 * 1000
    ).toISOString();

    const updatedTransfer = {
      ...selectedTransfer,
      category: finalCategory,
      exchangeRate: 1,
      type: "outgoing",
      createDate,
      user: { id: parseInt(user.id) },
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
      await axios.post(
        "http://localhost:8082/api/transfers/create",
        updatedTransfer,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      await axios.put(
        `http://localhost:8082/api/accounts/update/${selectedTransferAccount.id}`,
        updatedAccount,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      // Save custom category for future use
      if (selectedTransfer.category === "Diğer" && customCategory.trim()) {
        const savedExpense = JSON.parse(localStorage.getItem(`expenseSources_${user.id}`)) || [];
        if (!savedExpense.includes(customCategory.trim())) {
          savedExpense.push(customCategory.trim());
          localStorage.setItem(`expenseSources_${user.id}`, JSON.stringify(savedExpense));
        }
      }

      setOpenSnackbar(true);
      setTimeout(() => navigate("/account"), 1000);
    } catch (err) {
      console.error("Transfer hatası:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  // Details options for each category
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

  // Calculate new balance preview
  const newBalance = selectedTransferAccount && selectedTransfer.amount
    ? selectedTransferAccount.balance - parseFloat(selectedTransfer.amount || 0)
    : null;

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <RemoveIcon sx={{ color: "error.main", fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Para Çıkar
            </Typography>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel id="account-label">{t("selectAccount")}</InputLabel>
            <Select
              labelId="account-label"
              id="account-select"
              value={selectedTransferAccount?.id || ""}
              label={t("selectAccount")}
              onChange={(e) =>
                setSelectedTransferAccount(
                  accounts.find((acc) => acc.id === e.target.value)
                )
              }
              sx={{ borderRadius: 2 }}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                    <span>{account.accountName}</span>
                    <Chip 
                      label={`${account.balance} ${account.currency}`} 
                      size="small" 
                      sx={{ ml: "auto" }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Currency info badge */}
          {selectedTransferAccount && (
            <Alert severity="info" sx={{ mt: 1, mb: 2, borderRadius: 2 }}>
              Bu hesaptan yalnızca <strong>{selectedTransferAccount.currency}</strong> para birimi çıkarılabilir.
            </Alert>
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
              InputProps={{
                startAdornment: selectedTransferAccount && (
                  <Typography sx={{ mr: 1, color: "text.secondary", fontWeight: 600 }}>
                    {getCurrencySymbol(selectedTransferAccount.currency)}
                  </Typography>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          {/* Balance preview */}
          {newBalance !== null && selectedTransfer.amount && (
            <Box sx={{ 
              bgcolor: newBalance >= 0 ? "warning.light" : "error.light", 
              p: 2, 
              borderRadius: 2, 
              mb: 2,
              opacity: 0.9
            }}>
              <Typography variant="body2" color={newBalance >= 0 ? "warning.dark" : "error.dark"}>
                İşlem sonrası bakiye: <strong>{newBalance.toFixed(2)} {selectedTransferAccount.currency}</strong>
                {newBalance < 0 && " (Yetersiz bakiye!)"}
              </Typography>
            </Box>
          )}

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
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">{t("category")}</InputLabel>
            <Select
              labelId="category-label"
              id="category-select"
              value={selectedTransfer.category || ""}
              label={t("category")}
              onChange={handleCategoryChange}
              sx={{ borderRadius: 2 }}
            >
              {expenseSources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Custom category input - shows when "Diğer" is selected */}
          <Collapse in={selectedTransfer.category === "Diğer"}>
            <TextField
              label="Özel Kategori Adı"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Kategori adını yazın..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Collapse>

          {/* Details field */}
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
                label={t("details")}
                fullWidth
                margin="normal"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
          />

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
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" gap={2} mt={3}>
            <Button 
              variant="outlined" 
              onClick={() => navigate("/account")}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              {t("save")}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ borderRadius: 2 }}>
          Para çıkışı kaydedildi!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OutgoingTransferPage;
