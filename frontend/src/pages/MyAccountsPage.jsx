import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const MyAccountsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("token");

  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, BANK, CASH
  const [filterCurrency, setFilterCurrency] = useState("ALL"); // ALL, TRY, USD, EUR
  const [loading, setLoading] = useState(true);

  // Edit Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editAccountName, setEditAccountName] = useState("");
  const [editBalance, setEditBalance] = useState("");
  const [editCurrency, setEditCurrency] = useState("");

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch currency accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8082/api/accounts/currency/${user.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      setAccounts(response.data);
      setFilteredAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user.id, token]);

  // Filter accounts
  useEffect(() => {
    let filtered = accounts;

    // Filter by type
    if (filterType !== "ALL") {
      filtered = filtered.filter((acc) => acc.holdingType === filterType);
    }

    // Filter by currency
    if (filterCurrency !== "ALL") {
      filtered = filtered.filter((acc) => acc.currency === filterCurrency);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((acc) =>
        acc.accountName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAccounts(filtered);
  }, [accounts, filterType, filterCurrency, searchQuery]);

  const formatCurrency = (amount, currency = "TRY") => {
    if (amount == null) return "0.00";
    return (
      new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) +
      " " +
      currency
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = { TRY: 0, USD: 0, EUR: 0 };
    accounts.forEach((acc) => {
      if (acc.currency && totals.hasOwnProperty(acc.currency)) {
        totals[acc.currency] += acc.balance || 0;
      }
    });
    return totals;
  };

  const totals = calculateTotals();
  const bankAccounts = accounts.filter((acc) => acc.holdingType === "BANK");
  const cashAccounts = accounts.filter((acc) => acc.holdingType === "CASH");

  const getCurrencySymbol = (currency) => {
    const symbols = { TRY: "₺", USD: "$", EUR: "€" };
    return symbols[currency] || currency;
  };

  const handleAccountClick = (account) => {
    navigate(`/transactions/${account.id}`);
  };

  // Edit Functions
  const handleOpenEdit = (account, e) => {
    e.stopPropagation();
    setEditingAccount(account);
    setEditAccountName(account.accountName || "");
    setEditBalance(account.balance?.toString() || "");
    setEditCurrency(account.currency || "TRY");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editAccountName || !editBalance || !editCurrency) {
      setSnackbar({ open: true, message: "Lütfen tüm alanları doldurun!", severity: "error" });
      return;
    }

    try {
      const updateDate = new Date().toISOString();
      await axios.put(
        `http://localhost:8082/api/accounts/update/${editingAccount.id}`,
        {
          ...editingAccount,
          accountName: editAccountName,
          balance: parseFloat(editBalance),
          currency: editCurrency,
          updateDate,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setEditDialogOpen(false);
      setSnackbar({ open: true, message: "Hesap başarıyla güncellendi!", severity: "success" });
      fetchAccounts();
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      setSnackbar({ open: true, message: "Bir hata oluştu, tekrar deneyiniz.", severity: "error" });
    }
  };

  // Delete Functions
  const handleOpenDelete = (account, e) => {
    e.stopPropagation();
    setDeletingAccount(account);
    setDeletePassword("");
    setDeleteError("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Verify password first
      const verifyRes = await axios.post(
        `http://localhost:8082/api/users/verify-password/${user.id}`,
        { password: deletePassword },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (verifyRes.status === 200) {
        // Delete the account
        await axios.delete(
          `http://localhost:8082/api/accounts/delete/${deletingAccount.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );

        setDeleteDialogOpen(false);
        setSnackbar({ open: true, message: "Hesap başarıyla silindi!", severity: "success" });
        fetchAccounts();
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      if (err.response?.status === 401 || err.response?.status === 400) {
        setDeleteError("Şifre yanlış!");
      } else {
        setDeleteError("Bir hata oluştu, lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Hesaplarım
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {/* Total TRY */}
        <Card
          sx={{
            flex: 1,
            minWidth: 180,
            p: 2,
            background: "linear-gradient(135deg, #1C2B44 0%, #2a4a5e 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Toplam TRY
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            ₺{totals.TRY.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
          </Typography>
        </Card>

        {/* Total USD */}
        {totals.USD > 0 && (
          <Card
            sx={{
              flex: 1,
              minWidth: 180,
              p: 2,
              background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Toplam USD
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              ${totals.USD.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </Typography>
          </Card>
        )}

        {/* Total EUR */}
        {totals.EUR > 0 && (
          <Card
            sx={{
              flex: 1,
              minWidth: 180,
              p: 2,
              background: "linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Toplam EUR
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              €{totals.EUR.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </Typography>
          </Card>
        )}

        {/* Account Count */}
        <Card
          sx={{
            flex: 1,
            minWidth: 180,
            p: 2,
            bgcolor: isDarkMode ? "rgba(30, 42, 58, 0.90)" : "#fff",
            borderRadius: 3,
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Hesap Sayısı
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccountBalanceIcon sx={{ color: "#2196F3", fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "inherit" }}>
                {bankAccounts.length}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <SavingsIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? "#fff" : "inherit" }}>
                {cashAccounts.length}
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <TextField
          placeholder="Hesap ara..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />

        {/* Type Filter */}
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setFilterType(newValue);
          }}
          size="small"
          sx={{
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            },
          }}
        >
          <ToggleButton value="ALL">Tümü</ToggleButton>
          <ToggleButton value="BANK">Banka</ToggleButton>
          <ToggleButton value="CASH">Nakit</ToggleButton>
        </ToggleButtonGroup>

        {/* Currency Filter */}
        <ToggleButtonGroup
          value={filterCurrency}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setFilterCurrency(newValue);
          }}
          size="small"
          sx={{
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: "#f57c00",
              color: "white",
              "&:hover": { bgcolor: "#ef6c00" },
            },
          }}
        >
          <ToggleButton value="ALL">Tümü</ToggleButton>
          <ToggleButton value="TRY">₺ TRY</ToggleButton>
          <ToggleButton value="USD">$ USD</ToggleButton>
          <ToggleButton value="EUR">€ EUR</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Accounts List */}
      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : filteredAccounts.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {accounts.length === 0
            ? "Henüz hesap bulunmamaktadır. Yeni bir hesap ekleyin."
            : "Filtrelere uygun hesap bulunamadı."}
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredAccounts.map((account) => (
            <Card
              key={account.id}
              onClick={() => handleAccountClick(account)}
              sx={{
                borderRadius: 3,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateX(8px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                },
                borderLeft: `4px solid ${
                  account.holdingType === "BANK" ? "#2196F3" : "#4CAF50"
                }`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {account.holdingType === "BANK" ? (
                      <AccountBalanceIcon
                        sx={{ fontSize: 40, color: "#2196F3" }}
                      />
                    ) : (
                      <SavingsIcon sx={{ fontSize: 40, color: "#4CAF50" }} />
                    )}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {account.accountName}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                        <Chip
                          label={
                            account.holdingType === "BANK" ? "Banka" : "Nakit"
                          }
                          size="small"
                          color={
                            account.holdingType === "BANK"
                              ? "primary"
                              : "success"
                          }
                          variant="outlined"
                        />
                        <Chip
                          label={account.currency}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ textAlign: "right", mr: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color:
                            account.balance >= 0 ? "#2e7d32" : "#d32f2f",
                        }}
                      >
                        {getCurrencySymbol(account.currency)}
                        {Math.abs(account.balance || 0).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                      {account.updateDate && (
                        <Typography variant="caption" color="text.secondary">
                          Son güncelleme:{" "}
                          {new Date(account.updateDate).toLocaleDateString(
                            "tr-TR"
                          )}
                        </Typography>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => handleOpenEdit(account, e)}
                      sx={{
                        bgcolor: "rgba(25, 118, 210, 0.1)",
                        "&:hover": { bgcolor: "rgba(25, 118, 210, 0.2)" },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => handleOpenDelete(account, e)}
                      sx={{
                        bgcolor: "rgba(211, 47, 47, 0.1)",
                        "&:hover": { bgcolor: "rgba(211, 47, 47, 0.2)" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <ArrowForwardIosIcon sx={{ color: "#9e9e9e", ml: 1 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Summary by Type */}
      {accounts.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tür Bazında Özet
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {/* Bank Accounts Summary */}
            <Card sx={{ flex: 1, minWidth: 280, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <AccountBalanceIcon sx={{ color: "#2196F3" }} />
                  <Typography variant="h6">Banka Hesapları</Typography>
                </Box>
                {bankAccounts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Banka hesabı bulunmuyor
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {["TRY", "USD", "EUR"].map((currency) => {
                      const total = bankAccounts
                        .filter((acc) => acc.currency === currency)
                        .reduce((sum, acc) => sum + (acc.balance || 0), 0);
                      if (total === 0 && !bankAccounts.some((acc) => acc.currency === currency)) return null;
                      return (
                        <Box
                          key={currency}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {currency}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {getCurrencySymbol(currency)}
                            {total.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Cash Accounts Summary */}
            <Card sx={{ flex: 1, minWidth: 280, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <SavingsIcon sx={{ color: "#4CAF50" }} />
                  <Typography variant="h6">Nakit Hesaplar</Typography>
                </Box>
                {cashAccounts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nakit hesap bulunmuyor
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {["TRY", "USD", "EUR"].map((currency) => {
                      const total = cashAccounts
                        .filter((acc) => acc.currency === currency)
                        .reduce((sum, acc) => sum + (acc.balance || 0), 0);
                      if (total === 0 && !cashAccounts.some((acc) => acc.currency === currency)) return null;
                      return (
                        <Box
                          key={currency}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {currency}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {getCurrencySymbol(currency)}
                            {total.toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle>Hesap Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Hesap Adı"
              value={editAccountName}
              onChange={(e) => setEditAccountName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Bakiye"
              type="number"
              value={editBalance}
              onChange={(e) => setEditBalance(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">{editCurrency}</InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Para Birimi</InputLabel>
              <Select
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                label="Para Birimi"
              >
                <MenuItem value="TRY">TRY - Türk Lirası</MenuItem>
                <MenuItem value="USD">USD - Amerikan Doları</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth disableScrollLock>
        <DialogTitle sx={{ color: "#d32f2f" }}>Hesap Sil</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            <strong>{deletingAccount?.accountName}</strong> hesabını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
          <TextField
            label="Şifrenizi Girin"
            type="password"
            value={deletePassword}
            onChange={(e) => {
              setDeletePassword(e.target.value);
              setDeleteError("");
            }}
            fullWidth
            error={!!deleteError}
            helperText={deleteError}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={!deletePassword}
            startIcon={<DeleteIcon />}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyAccountsPage;
