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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  InputAdornment,
  Switch,
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
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import useCurrencyRates from "../config/useCurrencyRates";
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

  // Account selection states for paying installments
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountCategory, setAccountCategory] = useState("BANK"); // BANK or CASH
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [useRealTimeRate, setUseRealTimeRate] = useState(true);
  const [customExchangeRate, setCustomExchangeRate] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { rates } = useCurrencyRates();

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8082/api/accounts/currency/${user.id}`,
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      setAccounts(response.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

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

  const calculateRealTimeRate = () => {
    if (!payingPayment || !selectedAccount) return null;
    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = selectedAccount.currency;
    if (!debtCurrency || !accountCurrency) return null;
    if (debtCurrency === accountCurrency) return 1;

    const debtRate = rates?.[debtCurrency];
    const accountRate = rates?.[accountCurrency];
    if (!debtRate || !accountRate) return null;
    return accountRate / debtRate;
  };

  const getRateDisplayConfig = () => {
    if (!payingPayment || !selectedAccount) return null;
    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = selectedAccount.currency;
    if (!debtCurrency || !accountCurrency) return null;

    if (debtCurrency === accountCurrency) {
      return { baseCurrency: debtCurrency, quoteCurrency: accountCurrency, invert: false };
    }

    const tryInvolved = debtCurrency === "TRY" || accountCurrency === "TRY";
    if (tryInvolved) {
      const baseCurrency = debtCurrency === "TRY" ? accountCurrency : debtCurrency;
      const quoteCurrency = "TRY";
      const invert = debtCurrency === "TRY" && accountCurrency !== "TRY";
      return { baseCurrency, quoteCurrency, invert };
    }

    return { baseCurrency: debtCurrency, quoteCurrency: accountCurrency, invert: false };
  };

  const getDisplayedRateFromEffective = (effectiveRate) => {
    const cfg = getRateDisplayConfig();
    if (!cfg || effectiveRate == null) return null;
    if (cfg.invert) return effectiveRate > 0 ? 1 / effectiveRate : null;
    return effectiveRate;
  };

  const getEffectiveRateFromDisplayed = (displayedRate) => {
    const cfg = getRateDisplayConfig();
    if (!cfg || displayedRate == null) return null;
    if (cfg.invert) return displayedRate > 0 ? 1 / displayedRate : null;
    return displayedRate;
  };

  const getEffectiveExchangeRate = () => {
    if (!payingPayment || !selectedAccount) return null;
    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = selectedAccount.currency;
    if (!debtCurrency || !accountCurrency) return null;

    if (debtCurrency === accountCurrency) return 1;
    if (useRealTimeRate) return calculateRealTimeRate();

    const displayed = parseFloat(customExchangeRate);
    if (!displayed || displayed <= 0) return null;
    return getEffectiveRateFromDisplayed(displayed);
  };

  const calculateDeductAmount = () => {
    if (!payingPayment || !selectedAccount) return null;
    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = selectedAccount.currency;
    if (!debtCurrency || !accountCurrency) return null;

    if (debtCurrency === accountCurrency) return payingPayment.amount;

    const effectiveRate = getEffectiveExchangeRate();
    if (!effectiveRate || effectiveRate <= 0) return null;
    return payingPayment.amount * effectiveRate;
  };

  const hasSufficientBalance = (account) => {
    if (!payingPayment) return true;
    if (!account) return false;

    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = account.currency;
    if (!debtCurrency || !accountCurrency) return true;

    if (debtCurrency === accountCurrency) {
      return account.balance >= payingPayment.amount;
    }

    const debtRate = rates?.[debtCurrency];
    const accountRate = rates?.[accountCurrency];
    if (!debtRate || !accountRate) return true;

    const requiredAmount = (payingPayment.amount * accountRate) / debtRate;
    return account.balance >= requiredAmount;
  };

  const filteredAccounts = accounts.filter(
    (acc) => acc.holdingType === accountCategory
  );

  const handleOpenPayDialog = (payment) => {
    setPayingPayment(payment);
    setSelectedAccount(null);
    setAccountCategory("BANK");
    setUseRealTimeRate(true);
    setCustomExchangeRate("");
    setPaymentError("");
    setPayDialogOpen(true);
    fetchAccounts();
  };

  const handleClosePayDialog = () => {
    setPayDialogOpen(false);
    setPayingPayment(null);
    setSelectedAccount(null);
    setPaymentError("");
  };

  const handleMarkPaid = async () => {
    if (!selectedAccount) {
      setPaymentError("Lütfen bir hesap seçin");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const debtCurrency = payingPayment?.debtCurrency;
      const accountCurrency = selectedAccount?.currency;
      const needsConversion = debtCurrency && accountCurrency && debtCurrency !== accountCurrency;

      let exchangeRate = null;
      if (needsConversion) {
        exchangeRate = getEffectiveExchangeRate();

        if (!exchangeRate || exchangeRate <= 0) {
          setPaymentError("Geçerli bir döviz kuru giriniz");
          setPaymentLoading(false);
          return;
        }
      }

      const payload = {
        accountId: selectedAccount.id,
        userId: user.id,
        amount: payingPayment.amount,
        exchangeRate: exchangeRate,
      };

      await axios.post(
        `${backendUrl}/api/debts/payment/${payingPayment.id}/pay`,
        payload,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );

      handleClosePayDialog();
      fetchData();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      setPaymentError(
        error.response?.data?.message ||
          error.response?.data ||
          "Ödeme işlemi başarısız oldu"
      );
    } finally {
      setPaymentLoading(false);
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
                          onClick={() =>
                            handleOpenPayDialog({
                              ...debt.nextPayment,
                              debtToWhom: debt.toWhom,
                              debtCurrency: debt.debtCurrency,
                            })
                          }
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

      {/* Pay Dialog with Account Selection */}
      <Dialog
        open={payDialogOpen}
        onClose={handleClosePayDialog}
        maxWidth="sm"
        fullWidth
        disableScrollLock
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PaymentIcon color="success" />
            Ödeme Yap
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              p: 2,
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Ödenecek Taksit
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {payingPayment?.debtToWhom}
              {payingPayment?.paymentNumber ? ` - Taksit #${payingPayment.paymentNumber}` : ""}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#f44336", mt: 1 }}>
              {formatCurrency(payingPayment?.amount, payingPayment?.debtCurrency)}
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Hesap Türü Seçin
          </Typography>
          <ToggleButtonGroup
            value={accountCategory}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setAccountCategory(newValue);
                setSelectedAccount(null);
              }
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton value="BANK" sx={{ py: 1.5 }}>
              <AccountBalanceIcon sx={{ mr: 1 }} />
              Banka Hesabı
            </ToggleButton>
            <ToggleButton value="CASH" sx={{ py: 1.5 }}>
              <LocalAtmIcon sx={{ mr: 1 }} />
              Nakit
            </ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Hesap Seçin
          </Typography>

          {accountsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredAccounts.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              {accountCategory === "BANK"
                ? "Banka hesabınız bulunmuyor"
                : "Nakit hesabınız bulunmuyor"}
            </Alert>
          ) : (
            <FormControl component="fieldset" sx={{ width: "100%", mb: 2 }}>
              <RadioGroup
                value={selectedAccount?.id || ""}
                onChange={(e) => {
                  const account = filteredAccounts.find(
                    (acc) => acc.id === parseInt(e.target.value)
                  );
                  setSelectedAccount(account);
                }}
              >
                {filteredAccounts.map((account) => {
                  const sufficient = hasSufficientBalance(account);
                  return (
                    <Card
                      key={account.id}
                      sx={{
                        mb: 1,
                        p: 0,
                        border:
                          selectedAccount?.id === account.id
                            ? "2px solid"
                            : "1px solid",
                        borderColor:
                          selectedAccount?.id === account.id
                            ? "primary.main"
                            : sufficient
                            ? "divider"
                            : "error.main",
                        bgcolor: !sufficient
                          ? "rgba(244, 67, 54, 0.08)"
                          : "transparent",
                        opacity: !sufficient ? 0.7 : 1,
                        cursor: sufficient ? "pointer" : "not-allowed",
                      }}
                      onClick={() => {
                        if (sufficient) setSelectedAccount(account);
                      }}
                    >
                      <FormControlLabel
                        value={account.id}
                        control={<Radio disabled={!sufficient} />}
                        disabled={!sufficient}
                        sx={{
                          m: 0,
                          p: 1.5,
                          width: "100%",
                          "& .MuiFormControlLabel-label": { width: "100%" },
                        }}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {account.accountName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {account.holdingType === "BANK" ? "Banka" : "Nakit"}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 600,
                                  color: sufficient ? "success.main" : "error.main",
                                }}
                              >
                                {formatCurrency(account.balance, account.currency)}
                              </Typography>
                              {!sufficient && (
                                <Typography variant="caption" color="error">
                                  Yetersiz bakiye
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </Card>
                  );
                })}
              </RadioGroup>
            </FormControl>
          )}

          {selectedAccount && payingPayment?.debtCurrency !== selectedAccount.currency && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  bgcolor: isDarkMode ? "rgba(255,152,0,0.1)" : "rgba(255,152,0,0.08)",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "warning.main",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CurrencyExchangeIcon color="warning" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Döviz Kuru Dönüşümü
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Borç para birimi ({payingPayment?.debtCurrency}) ile hesap para birimi ({selectedAccount.currency}) farklı.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">Anlık kuru kullan</Typography>
                  <Switch
                    checked={useRealTimeRate}
                    onChange={(e) => setUseRealTimeRate(e.target.checked)}
                  />
                </Box>

                {useRealTimeRate ? (
                  <Box
                    sx={{
                      bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Anlık Kur
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      1 {getRateDisplayConfig()?.baseCurrency || payingPayment?.debtCurrency} = {getDisplayedRateFromEffective(calculateRealTimeRate())?.toFixed(4) || "..."} {getRateDisplayConfig()?.quoteCurrency || selectedAccount.currency}
                    </Typography>
                  </Box>
                ) : (
                  <TextField
                    fullWidth
                    label="Döviz Kuru"
                    type="number"
                    value={customExchangeRate}
                    onChange={(e) => setCustomExchangeRate(e.target.value)}
                    placeholder={`1 ${getRateDisplayConfig()?.baseCurrency || payingPayment?.debtCurrency} = ? ${getRateDisplayConfig()?.quoteCurrency || selectedAccount.currency}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          1 {getRateDisplayConfig()?.baseCurrency || payingPayment?.debtCurrency} =
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getRateDisplayConfig()?.quoteCurrency || selectedAccount.currency}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1 }}
                  />
                )}

                {calculateDeductAmount() && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: "success.main",
                      color: "white",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">Hesaptan düşülecek tutar</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(calculateDeductAmount(), selectedAccount.currency)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {selectedAccount && payingPayment?.debtCurrency === selectedAccount.currency && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "success.main",
                color: "white",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">Hesaptan düşülecek tutar</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(payingPayment?.amount, selectedAccount.currency)}
              </Typography>
            </Box>
          )}

          {paymentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {paymentError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClosePayDialog} disabled={paymentLoading}>
            İptal
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleMarkPaid}
            disabled={!selectedAccount || paymentLoading}
            startIcon={
              paymentLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
          >
            {paymentLoading ? "İşleniyor..." : "Ödemeyi Onayla"}
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
