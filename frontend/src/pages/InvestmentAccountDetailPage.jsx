import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../config/ThemeContext";
import axios from "axios";
import { backendUrl } from "../utils/envVariables";

// Gold types for display
const GOLD_TYPES = {
  GRAM: { label: "Gram Altın", symbol: "gr" },
  CEYREK: { label: "Çeyrek Altın", symbol: "adet" },
  YARIM: { label: "Yarım Altın", symbol: "adet" },
  TAM: { label: "Tam Altın", symbol: "adet" },
  CUMHURIYET: { label: "Cumhuriyet Altını", symbol: "adet" },
};

const InvestmentAccountDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { accountId } = useParams();
  const token = localStorage.getItem("token");

  const [account, setAccount] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingHoldingId, setDeletingHoldingId] = useState(null);

  useEffect(() => {
    fetchAccountData();
  }, [accountId]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const [accountRes, holdingsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/accounts/${accountId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }),
        axios.get(`${backendUrl}/api/accounts/${accountId}/holdings`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }),
      ]);

      setAccount(accountRes.data);
      setHoldings(holdingsRes.data);
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError("Hesap bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (holding) => {
    setEditingHolding(holding);
    setEditQuantity(holding.quantity.toString());
    setEditPrice(holding.currentPrice.toString());
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `${backendUrl}/api/accounts/holdings/${editingHolding.id}`,
        {
          quantity: parseFloat(editQuantity),
          currentPrice: parseFloat(editPrice),
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setEditDialogOpen(false);
      fetchAccountData();
    } catch (err) {
      console.error("Error updating holding:", err);
      setError("Güncelleme sırasında bir hata oluştu.");
    }
  };

  const handleDeleteClick = (holdingId) => {
    setDeletingHoldingId(holdingId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `${backendUrl}/api/accounts/holdings/${deletingHoldingId}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );

      setDeleteDialogOpen(false);
      
      // If this was the last holding, go back to accounts page
      if (holdings.length === 1) {
        navigate("/account");
      } else {
        fetchAccountData();
      }
    } catch (err) {
      console.error("Error deleting holding:", err);
      setError("Silme sırasında bir hata oluştu.");
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "₺0,00";
    return `₺${parseFloat(value).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getHoldingDisplayName = (holding) => {
    if (account?.assetType === "GOLD") {
      return GOLD_TYPES[holding.assetSymbol]?.label || holding.assetSymbol;
    }
    return `${holding.assetSymbol} - ${holding.assetName}`;
  };

  const getQuantityUnit = (holding) => {
    if (account?.assetType === "GOLD") {
      return GOLD_TYPES[holding.assetSymbol]?.symbol || "adet";
    }
    return "adet";
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!account) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Hesap bulunamadı.</Alert>
      </Container>
    );
  }

  const isGold = account.assetType === "GOLD";
  const themeColor = isGold ? "#d4af37" : "#4caf50";
  const bgColor = isDarkMode 
    ? (isGold ? "rgba(212, 175, 55, 0.15)" : "rgba(76, 175, 80, 0.15)")
    : (isGold ? "#fef9e7" : "#e8f5e9");

  // Calculate totals
  const totalValue = holdings.reduce(
    (sum, h) => sum + parseFloat(h.totalValue || 0),
    0
  );
  const totalProfitLoss = holdings.reduce(
    (sum, h) => sum + parseFloat(h.profitLoss || 0),
    0
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate("/account")} sx={{ p: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {account.accountName}
          </Typography>
          <Chip
            icon={isGold ? <ViewInArIcon /> : <ShowChartIcon />}
            label={isGold ? "Altın Hesabı" : "Hisse Hesabı"}
            size="small"
            sx={{
              mt: 0.5,
              bgcolor: bgColor,
              color: themeColor,
              fontWeight: 500,
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Summary Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 3,
          border: `2px solid ${themeColor}`,
          bgcolor: bgColor,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Toplam Değer
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: themeColor }}
              >
                {formatCurrency(totalValue)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Kar/Zarar
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {totalProfitLoss >= 0 ? (
                  <TrendingUpIcon sx={{ color: "#4caf50" }} />
                ) : (
                  <TrendingDownIcon sx={{ color: "#f44336" }} />
                )}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: totalProfitLoss >= 0 ? "#4caf50" : "#f44336",
                  }}
                >
                  {totalProfitLoss >= 0 ? "+" : ""}
                  {formatCurrency(totalProfitLoss)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {holdings.length} farklı {isGold ? "altın türü" : "hisse senedi"}
          </Typography>
        </CardContent>
      </Card>

      {/* Holdings List */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          <Typography
            variant="h6"
            sx={{ px: 3, pt: 2, pb: 1, fontWeight: 600 }}
          >
            {isGold ? "Altın Varlıkları" : "Hisse Senetleri"}
          </Typography>
          <Divider />
          <List sx={{ p: 0 }}>
            {holdings.map((holding, index) => (
              <React.Fragment key={holding.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    "&:hover": { bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "grey.50" },
                  }}
                  secondaryAction={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(holding)}
                        sx={{ color: "primary.main" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(holding.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    {isGold ? (
                      <ViewInArIcon sx={{ color: themeColor, fontSize: 32 }} />
                    ) : (
                      <Chip
                        label={holding.assetSymbol}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: themeColor,
                          color: "white",
                        }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 500 }}>
                        {getHoldingDisplayName(holding)}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          mt: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Miktar:{" "}
                          <strong>
                            {parseFloat(holding.quantity).toLocaleString("tr-TR")}{" "}
                            {getQuantityUnit(holding)}
                          </strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Birim Fiyat:{" "}
                          <strong>{formatCurrency(holding.currentPrice)}</strong>
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ textAlign: "right", mr: 6 }}>
                    <Typography sx={{ fontWeight: 600, color: themeColor }}>
                      {formatCurrency(holding.totalValue)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          parseFloat(holding.profitLoss) >= 0
                            ? "#4caf50"
                            : "#f44336",
                      }}
                    >
                      {parseFloat(holding.profitLoss) >= 0 ? "+" : ""}
                      {formatCurrency(holding.profitLoss)}
                    </Typography>
                  </Box>
                </ListItem>
                {index < holdings.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        disableScrollLock
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingHolding && getHoldingDisplayName(editingHolding)} Düzenle
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Miktar"
              type="number"
              fullWidth
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              InputProps={{
                endAdornment: editingHolding && (
                  <InputAdornment position="end">
                    {getQuantityUnit(editingHolding)}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Birim Fiyat"
              type="number"
              fullWidth
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₺</InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            sx={{
              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        disableScrollLock
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Silmeyi Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            Bu yatırımı silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvestmentAccountDetailPage;

