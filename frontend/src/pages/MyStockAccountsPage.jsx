import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Divider,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const MyStockAccountsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("token");

  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editAccountName, setEditAccountName] = useState("");

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch investment accounts with STOCK holdings
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8082/api/accounts/investment/${user.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      // Filter accounts that have STOCK holdings
      const stockAccounts = response.data.filter((acc) =>
        acc.holdings?.some((h) => h.assetType === "STOCK")
      );

      setAccounts(stockAccounts);
      setFilteredAccounts(stockAccounts);
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

    if (searchQuery) {
      filtered = filtered.filter(
        (acc) =>
          acc.accountName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.holdings?.some((h) =>
            h.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.assetSymbol?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    setFilteredAccounts(filtered);
  }, [accounts, searchQuery]);

  const formatCurrency = (amount) => {
    if (amount == null) return "₺0,00";
    return "₺" + amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalValue = 0;
    let totalCost = 0;
    let totalStocks = 0;

    accounts.forEach((acc) => {
      acc.holdings?.filter((h) => h.assetType === "STOCK").forEach((holding) => {
        const value = (holding.quantity || 0) * (holding.currentPrice || 0);
        const cost = (holding.quantity || 0) * (holding.purchasePrice || 0);
        totalValue += value;
        totalCost += cost;
        totalStocks++;
      });
    });

    return {
      totalValue,
      totalCost,
      totalProfit: totalValue - totalCost,
      totalStocks,
      accountCount: accounts.length,
    };
  };

  const totals = calculateTotals();

  const handleAccountClick = (account) => {
    navigate(`/investment/${account.id}`);
  };

  // Edit Functions
  const handleOpenEdit = (account, e) => {
    e.stopPropagation();
    setEditingAccount(account);
    setEditAccountName(account.accountName || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editAccountName) {
      setSnackbar({ open: true, message: "Lütfen hesap adını girin!", severity: "error" });
      return;
    }

    try {
      await axios.put(
        `http://localhost:8082/api/accounts/update/${editingAccount.id}`,
        {
          ...editingAccount,
          accountName: editAccountName,
          updateDate: new Date().toISOString(),
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

  const getStockHoldings = (account) => {
    return account.holdings?.filter((h) => h.assetType === "STOCK") || [];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <ShowChartIcon sx={{ fontSize: 36, color: "#2196F3" }} />
        Hisse Hesaplarım
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
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
            Toplam Değer
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatCurrency(totals.totalValue)}
          </Typography>
        </Card>

        <Card
          sx={{
            flex: 1,
            minWidth: 180,
            p: 2,
            background: totals.totalProfit >= 0
              ? "linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)"
              : "linear-gradient(135deg, #c62828 0%, #d32f2f 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Toplam Kar/Zarar
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {totals.totalProfit >= 0 ? (
              <TrendingUpIcon />
            ) : (
              <TrendingDownIcon />
            )}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {totals.totalProfit >= 0 ? "+" : ""}{formatCurrency(totals.totalProfit)}
            </Typography>
          </Box>
        </Card>

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
            Hisse Sayısı / Hesap
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? "#fff" : "inherit" }}>
            {totals.totalStocks} / {totals.accountCount}
          </Typography>
        </Card>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Hesap veya hisse ara..."
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
          sx={{ minWidth: 300 }}
        />
      </Box>

      {/* Accounts List */}
      {loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : filteredAccounts.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {accounts.length === 0
            ? "Henüz hisse hesabı bulunmamaktadır."
            : "Aramaya uygun hesap bulunamadı."}
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filteredAccounts.map((account) => {
            const stockHoldings = getStockHoldings(account);
            const accountValue = stockHoldings.reduce(
              (sum, h) => sum + (h.quantity || 0) * (h.currentPrice || 0),
              0
            );
            const accountCost = stockHoldings.reduce(
              (sum, h) => sum + (h.quantity || 0) * (h.purchasePrice || 0),
              0
            );
            const accountProfit = accountValue - accountCost;

            return (
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
                  borderLeft: "4px solid #2196F3",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ShowChartIcon sx={{ fontSize: 40, color: "#2196F3" }} />
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {account.accountName}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                          {stockHoldings.slice(0, 3).map((holding) => (
                            <Chip
                              key={holding.id}
                              label={holding.assetSymbol}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                          {stockHoldings.length > 3 && (
                            <Chip
                              label={`+${stockHoldings.length - 3}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ textAlign: "right", mr: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>
                          {formatCurrency(accountValue)}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                          {accountProfit >= 0 ? (
                            <TrendingUpIcon sx={{ fontSize: 16, color: "#4caf50" }} />
                          ) : (
                            <TrendingDownIcon sx={{ fontSize: 16, color: "#f44336" }} />
                          )}
                          <Typography
                            variant="body2"
                            sx={{ color: accountProfit >= 0 ? "#4caf50" : "#f44336", fontWeight: 600 }}
                          >
                            {accountProfit >= 0 ? "+" : ""}{formatCurrency(accountProfit)}
                          </Typography>
                        </Box>
                      </Box>

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

                  {/* Holdings Preview */}
                  <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {stockHoldings.slice(0, 4).map((holding) => {
                      const value = (holding.quantity || 0) * (holding.currentPrice || 0);
                      const profit = value - (holding.quantity || 0) * (holding.purchasePrice || 0);

                      return (
                        <Box
                          key={holding.id}
                          sx={{
                            p: 1.5,
                            bgcolor: profit >= 0 ? "rgba(76, 175, 80, 0.08)" : "rgba(244, 67, 54, 0.08)",
                            borderRadius: 2,
                            minWidth: 150,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {holding.assetSymbol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {holding.quantity} lot • {formatCurrency(holding.currentPrice)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle>Hesap Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            label="Hesap Adı"
            value={editAccountName}
            onChange={(e) => setEditAccountName(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth disableScrollLock>
        <DialogTitle sx={{ color: "#d32f2f" }}>Hesap Sil</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            <strong>{deletingAccount?.accountName}</strong> hesabını ve tüm hisse varlıklarını silmek istediğinizden emin misiniz?
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

export default MyStockAccountsPage;

