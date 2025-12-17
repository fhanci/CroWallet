import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Divider,
  Switch,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import useCurrencyRates from "../config/useCurrencyRates";
import { backendUrl } from "../utils/envVariables";

const InstallmentsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payingPayment, setPayingPayment] = useState(null);
  const { user } = useUser();
  const token = localStorage.getItem("token");

  // Account selection states
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountCategory, setAccountCategory] = useState("BANK"); // BANK or CASH
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [useRealTimeRate, setUseRealTimeRate] = useState(true);
  const [customExchangeRate, setCustomExchangeRate] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Currency rates hook
  const { rates, loading: ratesLoading, convert } = useCurrencyRates();

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
      // Fetch all debts to get all payments
      const response = await axios.get(
        `${backendUrl}/api/debts/summary/${user.id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );

      // Collect all payments from all debts
      const payments = [];
      if (response.data.upcomingPayments) {
        response.data.upcomingPayments.forEach((payment) => {
          payments.push({ ...payment, status: payment.status || "PENDING" });
        });
      }

      // Also fetch paid payments by getting all debt details
      if (response.data.debts) {
        for (const debt of response.data.debts) {
          try {
            const debtPaymentsRes = await axios.get(
              `${backendUrl}/api/debts/${debt.id}`,
              {
                headers: { Authorization: token ? `Bearer ${token}` : undefined },
              }
            );
            if (debtPaymentsRes.data.payments) {
              debtPaymentsRes.data.payments.forEach((p) => {
                // Avoid duplicates
                if (!payments.find((existing) => existing.id === p.id)) {
                  payments.push({
                    ...p,
                    debtToWhom: debt.toWhom,
                    debtCurrency: debt.debtCurrency,
                    accountName: debt.account?.accountName,
                  });
                }
              });
            }
          } catch (e) {
            console.error("Error fetching debt payments:", e);
          }
        }
      }

      setAllPayments(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, token]);

  useEffect(() => {
    let filtered = allPayments;

    // Filter by status
    if (statusFilter === "PENDING") {
      filtered = filtered.filter((p) => p.status === "PENDING");
    } else if (statusFilter === "PAID") {
      filtered = filtered.filter((p) => p.status === "PAID");
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.debtToWhom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.accountName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

    setFilteredPayments(filtered);
  }, [allPayments, statusFilter, searchQuery]);

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

  const handleMarkPaid = async () => {
    if (!selectedAccount) {
      setPaymentError("Lütfen bir hesap seçin");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const debtCurrency = payingPayment.debtCurrency;
      const accountCurrency = selectedAccount.currency;
      const needsConversion = debtCurrency !== accountCurrency;

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
      
      handleCloseDialog();
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

  const handleCloseDialog = () => {
    setPayDialogOpen(false);
    setPayingPayment(null);
    setSelectedAccount(null);
    setPaymentError("");
  };

  // Filter accounts by category (BANK or CASH)
  const filteredAccounts = accounts.filter(
    (acc) => acc.holdingType === accountCategory
  );

  // Calculate real-time exchange rate
  const calculateRealTimeRate = () => {
    if (!payingPayment || !selectedAccount) return null;
    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = selectedAccount.currency;
    if (debtCurrency === accountCurrency) return 1;

    // Get rates relative to EUR
    const debtRate = rates[debtCurrency];
    const accountRate = rates[accountCurrency];
    if (!debtRate || !accountRate) return null;

    // Convert: 1 unit of debt currency = ? units of account currency
    // Example: 1 USD = 30 TRY (if USD/EUR = 1.1 and TRY/EUR = 33)
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

  // Calculate amount to deduct from account
  const calculateDeductAmount = () => {
    if (!payingPayment || !selectedAccount) return null;
    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = selectedAccount.currency;

    if (debtCurrency === accountCurrency) {
      return payingPayment.amount;
    }

    const effectiveRate = getEffectiveExchangeRate();
    if (!effectiveRate || effectiveRate <= 0) return null;
    return payingPayment.amount * effectiveRate;
  };

  // Check if account has sufficient balance
  const hasSufficientBalance = (account) => {
    if (!payingPayment) return true;
    const debtCurrency = payingPayment.debtCurrency;
    const accountCurrency = account.currency;

    if (debtCurrency === accountCurrency) {
      return account.balance >= payingPayment.amount;
    }

    // For different currencies, check with real-time rate
    const debtRate = rates[debtCurrency];
    const accountRate = rates[accountCurrency];
    if (!debtRate || !accountRate) return true; // Can't determine, allow selection

    const requiredAmount = (payingPayment.amount * accountRate) / debtRate;
    return account.balance >= requiredAmount;
  };

  const pendingCount = allPayments.filter((p) => p.status === "PENDING").length;
  const paidCount = allPayments.filter((p) => p.status === "PAID").length;

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/debt")}
          sx={{ color: "text.secondary" }}
        >
          Borçlar
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Taksitler
        </Typography>
      </Box>

      {/* Filter Controls */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) setStatusFilter(newValue);
          }}
          sx={{
            "& .MuiToggleButton-root": {
              px: 3,
              py: 1,
              borderRadius: 2,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              },
            },
          }}
        >
          <ToggleButton value="PENDING">
            Bekleyen ({pendingCount})
          </ToggleButton>
          <ToggleButton value="PAID">
            Ödenen ({paidCount})
          </ToggleButton>
          <ToggleButton value="ALL">
            Tümü ({allPayments.length})
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          placeholder="Ara..."
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
      </Box>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {statusFilter === "PENDING"
            ? "Bekleyen taksit bulunmuyor."
            : statusFilter === "PAID"
            ? "Ödenen taksit bulunmuyor."
            : "Taksit bulunmuyor."}
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filteredPayments.map((payment) => {
            const daysUntil = getDaysUntil(payment.paymentDate);
            const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
            const isOverdue = daysUntil !== null && daysUntil < 0;
            const isPaid = payment.status === "PAID";

            return (
              <Card
                key={payment.id}
                sx={{
                  p: 2,
                  bgcolor: isPaid
                    ? "rgba(76, 175, 80, 0.08)"
                    : isOverdue
                    ? "rgba(244, 67, 54, 0.12)"
                    : isUrgent
                    ? "rgba(255, 152, 0, 0.12)"
                    : isDarkMode 
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(0,0,0,0.02)",
                  borderRadius: 2,
                  borderLeft: `4px solid ${
                    isPaid
                      ? "#4caf50"
                      : isOverdue
                      ? "#d32f2f"
                      : isUrgent
                      ? "#ff9800"
                      : isDarkMode ? "rgba(255, 255, 255, 0.3)" : "#9e9e9e"
                  }`,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {payment.debtToWhom}
                      {payment.paymentNumber && ` - Taksit ${payment.paymentNumber}`}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <EventIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(payment.paymentDate)}
                      </Typography>
                      {payment.accountName && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {payment.accountName}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: isPaid ? "#4caf50" : "#f44336" }}
                      >
                        {formatCurrency(payment.amount, payment.debtCurrency)}
                      </Typography>
                      {!isPaid && (
                        <Chip
                          label={
                            isOverdue
                              ? `${Math.abs(daysUntil)} gün geçti`
                              : daysUntil === 0
                              ? "Bugün"
                              : `${daysUntil} gün kaldı`
                          }
                          size="small"
                          color={isOverdue ? "error" : isUrgent ? "warning" : "default"}
                        />
                      )}
                      {isPaid && (
                        <Chip
                          label="Ödendi"
                          size="small"
                          color="success"
                          icon={<CheckCircleIcon />}
                        />
                      )}
                    </Box>
                    {!isPaid && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleOpenPayDialog(payment)}
                      >
                        Ödendi
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Pay Confirmation Dialog with Account Selection */}
      <Dialog 
        open={payDialogOpen} 
        onClose={handleCloseDialog} 
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
          {/* Payment Info */}
          <Box sx={{ 
            bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", 
            p: 2, 
            borderRadius: 2, 
            mb: 3 
          }}>
            <Typography variant="body2" color="text.secondary">
              Ödenecek Taksit
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {payingPayment?.debtToWhom} - Taksit #{payingPayment?.paymentNumber}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#f44336", mt: 1 }}>
              {formatCurrency(payingPayment?.amount, payingPayment?.debtCurrency)}
            </Typography>
          </Box>

          {/* Category Selection */}
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

          {/* Account Selection */}
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
                        border: selectedAccount?.id === account.id 
                          ? "2px solid" 
                          : "1px solid",
                        borderColor: selectedAccount?.id === account.id
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
                          "& .MuiFormControlLabel-label": { width: "100%" }
                        }}
                        label={
                          <Box sx={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            width: "100%"
                          }}>
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
                                  color: sufficient ? "success.main" : "error.main"
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

          {/* Currency Conversion Section */}
          {selectedAccount && 
            payingPayment?.debtCurrency !== selectedAccount.currency && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ 
                bgcolor: isDarkMode ? "rgba(255,152,0,0.1)" : "rgba(255,152,0,0.08)", 
                p: 2, 
                borderRadius: 2,
                border: "1px solid",
                borderColor: "warning.main"
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CurrencyExchangeIcon color="warning" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Döviz Kuru Dönüşümü
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Borç para birimi ({payingPayment?.debtCurrency}) ile hesap para birimi ({selectedAccount.currency}) farklı.
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="body2">
                    Anlık kuru kullan
                  </Typography>
                  <Switch
                    checked={useRealTimeRate}
                    onChange={(e) => setUseRealTimeRate(e.target.checked)}
                  />
                </Box>

                {useRealTimeRate ? (
                  <Box sx={{ 
                    bgcolor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", 
                    p: 1.5, 
                    borderRadius: 1 
                  }}>
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

                {/* Calculated Amount */}
                {calculateDeductAmount() && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 1.5, 
                    bgcolor: "success.main", 
                    color: "white",
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2">
                      Hesaptan düşülecek tutar
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(calculateDeductAmount(), selectedAccount.currency)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Same Currency Amount Display */}
          {selectedAccount && 
            payingPayment?.debtCurrency === selectedAccount.currency && (
            <Box sx={{ 
              mt: 2, 
              p: 1.5, 
              bgcolor: "success.main", 
              color: "white",
              borderRadius: 1 
            }}>
              <Typography variant="body2">
                Hesaptan düşülecek tutar
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(payingPayment?.amount, selectedAccount.currency)}
              </Typography>
            </Box>
          )}

          {/* Error Message */}
          {paymentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {paymentError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog} disabled={paymentLoading}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleMarkPaid}
            disabled={!selectedAccount || paymentLoading}
            startIcon={paymentLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          >
            {paymentLoading ? "İşleniyor..." : "Ödemeyi Onayla"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstallmentsPage;

