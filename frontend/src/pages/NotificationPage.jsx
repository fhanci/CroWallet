import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import PaymentIcon from "@mui/icons-material/Payment";
import EventIcon from "@mui/icons-material/Event";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const NotificationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [overduePayments, setOverduePayments] = useState([]);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payingPayment, setPayingPayment] = useState(null);
  const { user } = useUser();
  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8082/api/debts/upcoming/${user.id}?limit=50`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const overdue = [];
      const upcoming = [];
      
      res.data.forEach((payment) => {
        const paymentDate = new Date(payment.paymentDate);
        paymentDate.setHours(0, 0, 0, 0);
        
        if (paymentDate < today) {
          overdue.push(payment);
        } else {
          // Check if within warning period (default 7 days)
          const daysUntil = Math.ceil((paymentDate - today) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 30) { // Show payments within next 30 days
            upcoming.push(payment);
          }
        }
      });
      
      setOverduePayments(overdue);
      setUpcomingPayments(upcoming);
    } catch (error) {
      console.error("Bildirimler alınamadı:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user.id, token]);

  const formatCurrency = (amount, currency = "TRY") => {
    if (amount == null) return "0.00";
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " " + currency;
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
        `http://localhost:8082/api/debts/payment/${payingPayment.id}/pay`,
        {},
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
      setPayDialogOpen(false);
      fetchPayments();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
    }
  };

  const renderPaymentCard = (payment, isOverdue = false) => {
    const daysUntil = getDaysUntil(payment.paymentDate);
    const isUrgent = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7;
    const isToday = daysUntil === 0;

    return (
      <Card
        key={payment.id}
        sx={{
          mb: 2,
          borderRadius: 3,
          borderLeft: `5px solid ${isOverdue ? "#d32f2f" : isToday ? "#ff9800" : isUrgent ? "#ff9800" : "#2196F3"}`,
          bgcolor: isOverdue 
            ? "rgba(211, 47, 47, 0.08)" 
            : isUrgent 
              ? "rgba(255, 152, 0, 0.08)" 
              : isDarkMode
                ? "rgba(33, 150, 243, 0.08)"
                : "rgba(33, 150, 243, 0.05)",
          transition: "all 0.2s",
          "&:hover": {
            transform: "translateX(4px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              {isOverdue ? (
                <WarningAmberIcon sx={{ fontSize: 40, color: "#d32f2f" }} />
              ) : (
                <PaymentIcon sx={{ fontSize: 40, color: isUrgent ? "#ff9800" : "#2196F3" }} />
              )}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {payment.debtToWhom}
                </Typography>
                {payment.paymentNumber && (
                  <Chip
                    label={`Taksit ${payment.paymentNumber}`}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <EventIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(payment.paymentDate)}
                  </Typography>
                </Box>
                {payment.accountName && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalanceIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      {payment.accountName}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: isOverdue ? "#d32f2f" : "#f44336",
                  mb: 1 
                }}
              >
                {formatCurrency(payment.amount, payment.debtCurrency)}
              </Typography>
              
              <Chip
                label={
                  isOverdue 
                    ? `${Math.abs(daysUntil)} gün gecikti!` 
                    : isToday 
                      ? "BUGÜN!" 
                      : `${daysUntil} gün kaldı`
                }
                color={isOverdue ? "error" : isUrgent ? "warning" : "primary"}
                sx={{ fontWeight: 600, mb: 1 }}
              />
              
              <Box sx={{ mt: 1 }}>
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
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const totalNotifications = overduePayments.length + upcomingPayments.length;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <NotificationsActiveIcon sx={{ fontSize: 40, color: "#1C2B44" }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {t("upcomingDebts")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalNotifications > 0 
              ? `${totalNotifications} adet bildiriminiz var`
              : "Tüm ödemeleriniz güncel"}
          </Typography>
        </Box>
      </Box>

      {/* Overdue Payments */}
      {overduePayments.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              "& .MuiAlert-icon": { fontSize: 28 }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {overduePayments.length} adet gecikmiş ödemeniz var!
            </Typography>
          </Alert>
          
          {overduePayments.map((payment) => renderPaymentCard(payment, true))}
        </Box>
      )}

      {/* Divider between overdue and upcoming */}
      {overduePayments.length > 0 && upcomingPayments.length > 0 && (
        <Divider sx={{ my: 4 }} />
      )}

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <PaymentIcon color="primary" />
            Yaklaşan Ödemeler ({upcomingPayments.length})
          </Typography>
          
          {upcomingPayments.map((payment) => renderPaymentCard(payment, false))}
        </Box>
      )}

      {/* No Notifications */}
      {totalNotifications === 0 && (
        <Box 
          sx={{ 
            textAlign: "center", 
            py: 8,
            bgcolor: "rgba(76, 175, 80, 0.08)",
            borderRadius: 3,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#4caf50", mb: 1 }}>
            Harika!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("noUpcomingDebts")}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => navigate("/debt")}
          >
            Borçlarımı Görüntüle
          </Button>
        </Box>
      )}

      {/* View All Button */}
      {totalNotifications > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/debt")}
          >
            Tüm Borçları Görüntüle
          </Button>
        </Box>
      )}

      {/* Pay Confirmation Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" disableScrollLock>
        <DialogTitle sx={{ fontWeight: 600 }}>Ödemeyi Onayla</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{payingPayment?.debtToWhom}</strong> - {formatCurrency(payingPayment?.amount, payingPayment?.debtCurrency)} tutarındaki ödemeyi tamamlandı olarak işaretlemek istiyor musunuz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPayDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="success" onClick={handleMarkPaid}>
            Ödendi Olarak İşaretle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationPage;
