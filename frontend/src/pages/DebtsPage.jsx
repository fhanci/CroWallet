import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import { getCardStyles } from "../config/cardStyles";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PaymentIcon from "@mui/icons-material/Payment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import { backendUrl } from "../utils/envVariables";

const DebtsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const styles = getCardStyles(isDarkMode);
  
  const [debtSummary, setDebtSummary] = useState(null);
  const [viewMode, setViewMode] = useState("active"); // "active" or "completed"
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDebtId, setDeletingDebtId] = useState(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payingPayment, setPayingPayment] = useState(null);
  
  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [editToWhom, setEditToWhom] = useState("");
  const [editDebtAmount, setEditDebtAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editWarningPeriod, setEditWarningPeriod] = useState("");
  
  const { user } = useUser();
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/debts/summary/${user.id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      setDebtSummary(response.data);
    } catch (error) {
      console.error("Error fetching debts:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, token]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(dateStr);
    paymentDate.setHours(0, 0, 0, 0);
    const diffTime = paymentDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDeleteDebt = async () => {
    try {
      await axios.delete(
        `${backendUrl}/api/debts/delete/${deletingDebtId}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting debt:", error);
    }
  };

  const handleMarkPaid = async () => {
    try {
      await axios.post(
        `${backendUrl}/api/debts/payment/${payingPayment.id}/pay`,
        {},
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      setPayDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
    }
  };

  const handleOpenEdit = (debt) => {
    setEditingDebt(debt);
    setEditToWhom(debt.toWhom || "");
    setEditDebtAmount(debt.debtAmount?.toString() || "");
    setEditDueDate(debt.dueDate || "");
    setEditDescription(debt.description || "");
    setEditWarningPeriod(debt.warningPeriod?.toString() || "7");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const newAmount = parseFloat(editDebtAmount);
      const amountDiff = newAmount - (editingDebt.debtAmount || 0);
      const newRemainingAmount = (editingDebt.remainingAmount || 0) + amountDiff;

      await axios.put(
        `${backendUrl}/api/debts/update/${editingDebt.id}`,
        {
          ...editingDebt,
          toWhom: editToWhom,
          debtAmount: newAmount,
          remainingAmount: newRemainingAmount > 0 ? newRemainingAmount : 0,
          dueDate: editDueDate,
          description: editDescription,
          warningPeriod: parseInt(editWarningPeriod) || 7,
        },
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating debt:", error);
    }
  };

  const getProgressPercentage = (debt) => {
    if (!debt.totalInstallments || debt.totalInstallments === 0) {
      return debt.status === "COMPLETED" ? 100 : 0;
    }
    return ((debt.paidInstallments || 0) / debt.totalInstallments) * 100;
  };

  const activeDebts =
    debtSummary?.debts?.filter((d) => d.status !== "COMPLETED") || [];
  const completedDebts =
    debtSummary?.debts?.filter((d) => d.status === "COMPLETED") || [];

  const displayedDebts = viewMode === "active" ? activeDebts : completedDebts;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {t("myDebts")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ListAltIcon />}
            onClick={() => navigate("/debt/installments")}
            sx={{ borderRadius: 2 }}
          >
            Taksitler
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/debt/create")}
            sx={{
              background: "linear-gradient(135deg, #1C2B44 0%, #2a4a5e 100%)",
              borderRadius: 2,
            }}
          >
            Yeni Borç Ekle
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      {debtSummary && (
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <Card
            sx={{
              flex: 1,
              minWidth: 200,
              p: 2,
              background: "linear-gradient(135deg, #b71c1c 0%, #c62828 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Toplam Kalan Borç
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatCurrency(debtSummary.totalRemainingAmount, "TRY")}
            </Typography>
          </Card>
          <Card
            sx={{
              flex: 1,
              minWidth: 200,
              p: 2,
              background: "linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Toplam Ödenen
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatCurrency(debtSummary.totalPaidAmount, "TRY")}
            </Typography>
          </Card>
        <Card
          sx={{
            flex: 1,
            minWidth: 200,
            p: 2,
            bgcolor: isDarkMode ? "rgba(30, 42, 58, 0.90)" : "#fff",
            borderRadius: 3,
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Aktif / Tamamlanan
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: isDarkMode ? "#fff" : "inherit" }}>
            {debtSummary.activeDebts} / {debtSummary.completedDebts}
          </Typography>
        </Card>
        </Box>
      )}

      {/* View Mode Toggle */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setViewMode(newValue);
          }}
          sx={{
            "& .MuiToggleButton-root": {
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              },
            },
          }}
        >
          <ToggleButton value="active">
            Aktif Borçlar ({activeDebts.length})
          </ToggleButton>
          <ToggleButton value="completed">
            Tamamlanan Borçlar ({completedDebts.length})
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Debts List */}
      {viewMode === "active" && activeDebts.length === 0 && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Harika! Aktif borcunuz bulunmuyor.
        </Alert>
      )}

      {viewMode === "completed" && completedDebts.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Tamamlanmış borcunuz bulunmuyor.
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {displayedDebts
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .map((debt) => {
            const progress = getProgressPercentage(debt);
            const daysUntil = getDaysUntil(
              debt.nextPayment?.paymentDate || debt.dueDate
            );
            const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
            const isCompleted = debt.status === "COMPLETED";

            return (
              <Card
                key={debt.id}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: isCompleted 
                    ? "rgba(76, 175, 80, 0.08)" 
                    : isDarkMode 
                      ? "rgba(30, 42, 58, 0.90)" 
                      : "white",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ fontSize: 40, color: "#4caf50" }} />
                      ) : debt.debtType === "ACCOUNT_DEBT" ? (
                        <AccountBalanceIcon sx={{ fontSize: 40, color: "#2196F3" }} />
                      ) : (
                        <SavingsIcon sx={{ fontSize: 40, color: "#4CAF50" }} />
                      )}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {debt.toWhom}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          <Chip
                            label={
                              debt.debtType === "ACCOUNT_DEBT"
                                ? "Hesap Borcu"
                                : "Nakit Borç"
                            }
                            size="small"
                            color={
                              debt.debtType === "ACCOUNT_DEBT" ? "primary" : "success"
                            }
                            variant="outlined"
                          />
                          <Chip
                            label={
                              debt.paymentType === "PERIODIC" ? "Taksitli" : "Tek Ödeme"
                            }
                            size="small"
                            variant="outlined"
                          />
                          {isCompleted && (
                            <Chip label="Tamamlandı" size="small" color="success" />
                          )}
                          {!isCompleted && isUrgent && (
                            <Chip
                              icon={<WarningAmberIcon />}
                              label="Yaklaşıyor"
                              size="small"
                              color="warning"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    {!isCompleted && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton color="primary" onClick={() => handleOpenEdit(debt)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setDeletingDebtId(debt.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Borç
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(debt.debtAmount, debt.debtCurrency)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Kalan Borç
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: isCompleted ? "#4caf50" : "#f44336",
                        }}
                      >
                        {formatCurrency(debt.remainingAmount, debt.debtCurrency)}
                      </Typography>
                    </Box>
                    {debt.paymentType === "PERIODIC" && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Taksit
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {debt.paidInstallments || 0} / {debt.totalInstallments}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Son Ödeme
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(debt.dueDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Ödeme İlerlemesi
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        %{progress.toFixed(0)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "rgba(0,0,0,0.1)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: progress === 100 ? "#4caf50" : "#2196F3",
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  {/* Next Payment - only for active debts */}
                  {!isCompleted && debt.nextPayment && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: "rgba(244, 67, 54, 0.08)",
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Sonraki Ödeme
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(debt.nextPayment.paymentDate)}
                          {debt.nextPayment.paymentNumber &&
                            ` (Taksit ${debt.nextPayment.paymentNumber})`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "#f44336" }}
                        >
                          {formatCurrency(debt.nextPayment.amount, debt.debtCurrency)}
                        </Typography>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            setPayingPayment(debt.nextPayment);
                            setPayDialogOpen(true);
                          }}
                        >
                          Ödendi
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {debt.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {debt.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        disableScrollLock
      >
        <DialogTitle>Borcu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu borcu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleDeleteDebt}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pay Confirmation Dialog */}
      <Dialog
        open={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        maxWidth="xs"
        disableScrollLock
      >
        <DialogTitle>Ödemeyi Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            {payingPayment?.debtToWhom} -{" "}
            {formatCurrency(payingPayment?.amount, payingPayment?.debtCurrency)}{" "}
            tutarındaki ödemeyi tamamlandı olarak işaretlemek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="success" onClick={handleMarkPaid}>
            Ödendi Olarak İşaretle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Debt Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock
      >
        <DialogTitle>Borcu Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Kime Borç"
              value={editToWhom}
              onChange={(e) => setEditToWhom(e.target.value)}
              fullWidth
            />
            <TextField
              label="Borç Miktarı"
              type="number"
              value={editDebtAmount}
              onChange={(e) => setEditDebtAmount(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <Typography variant="body2" color="text.secondary">
                    {editingDebt?.debtCurrency || "TRY"}
                  </Typography>
                ),
              }}
            />
            <TextField
              label="Son Ödeme Tarihi"
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Açıklama"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Hatırlatma (Kaç gün önce)"
              type="number"
              value={editWarningPeriod}
              onChange={(e) => setEditWarningPeriod(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DebtsPage;
