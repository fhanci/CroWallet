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
                        onClick={() => {
                          setPayingPayment(payment);
                          setPayDialogOpen(true);
                        }}
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

      {/* Pay Confirmation Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" disableScrollLock>
        <DialogTitle>Ödemeyi Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            {payingPayment?.debtToWhom} -{" "}
            {formatCurrency(payingPayment?.amount, payingPayment?.debtCurrency)} tutarındaki
            ödemeyi tamamlandı olarak işaretlemek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="success" onClick={handleMarkPaid}>
            Ödendi Olarak İşaretle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InstallmentsPage;

