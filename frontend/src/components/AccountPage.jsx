import { useState, useEffect } from "react";
import { Container, Typography, Box, Card, Chip, Divider, Button, LinearProgress, CircularProgress, IconButton, Tooltip as MuiTooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PaymentIcon from "@mui/icons-material/Payment";
import EventIcon from "@mui/icons-material/Event";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EuroIcon from "@mui/icons-material/Euro";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CurrencyLiraIcon from "@mui/icons-material/CurrencyLira";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PieChart, Pie, Cell, Sector, Tooltip, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import useCurrencyRates from "../config/useCurrencyRates";
import axios from "axios";

// Currency Rates Display Component - Shows EUR/TRY, EUR/USD rates
const CurrencyRatesDisplay = ({ isDarkMode }) => {
  const { rates, loading, refresh } = useCurrencyRates(60000);
  
  const formatRate = (rate) => {
    if (!rate) return '-';
    return rate.toFixed(4);
  };

  const textColor = isDarkMode ? "#fff" : "#1a1a1a";
  const bgColor = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      {/* EUR/TRY Rate */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 0.5, 
        px: 1.5, 
        py: 0.5, 
        borderRadius: 2,
        bgcolor: bgColor,
        border: "1px solid",
        borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
      }}>
        <EuroIcon sx={{ fontSize: 18, color: "#2196F3" }} />
        <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>/</Typography>
        <CurrencyLiraIcon sx={{ fontSize: 18, color: "#E91E63" }} />
        <Typography variant="body2" sx={{ color: textColor, fontWeight: 600, ml: 0.5 }}>
          {loading || !rates.EUR ? "..." : formatRate(1 / rates.EUR)}
        </Typography>
      </Box>

      {/* USD/TRY Rate */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 0.5, 
        px: 1.5, 
        py: 0.5, 
        borderRadius: 2,
        bgcolor: bgColor,
        border: "1px solid",
        borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
      }}>
        <AttachMoneyIcon sx={{ fontSize: 18, color: "#4CAF50" }} />
        <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>/</Typography>
        <CurrencyLiraIcon sx={{ fontSize: 18, color: "#E91E63" }} />
        <Typography variant="body2" sx={{ color: textColor, fontWeight: 600, ml: 0.5 }}>
          {loading || !rates.USD ? "..." : formatRate(1 / rates.USD)}
        </Typography>
      </Box>

      {/* Refresh Button */}
      <MuiTooltip title="Kurları Güncelle">
        <IconButton 
          onClick={refresh} 
          size="small" 
          disabled={loading}
          sx={{ 
            color: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
            "&:hover": { color: "#2196F3" }
          }}
        >
          {loading ? <CircularProgress size={16} /> : <RefreshIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </MuiTooltip>
    </Box>
  );
};

const AccountPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [accountSummary, setAccountSummary] = useState(null);
  const [debtSummary, setDebtSummary] = useState(null);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [expenseSources, setExpenseSources] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const { user } = useUser();
  const token = localStorage.getItem("token");

  // Text colors based on theme
  const textPrimary = isDarkMode ? "#fff" : "#1a1a1a";
  const textSecondary = isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)";
  const borderColor = isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A83279",
    "#6A89CC",
  ];

  // Fetch user account summary
  useEffect(() => {
    const fetchAccountSummary = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/accounts/summary/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setAccountSummary(res.data);
      } catch (error) {
        console.error("Error fetching account summary:", error);
      }
    };
    fetchAccountSummary();
  }, [user.id, token]);

  // Fetch debt summary
  useEffect(() => {
    const fetchDebtSummary = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/debts/summary/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setDebtSummary(res.data);
      } catch (error) {
        console.error("Error fetching debt summary:", error);
      }
    };
    fetchDebtSummary();
  }, [user.id, token]);

  // Fetch upcoming payments (next 5)
  useEffect(() => {
    const fetchUpcomingPayments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/debts/upcoming/${user.id}?limit=5`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setUpcomingPayments(res.data);
      } catch (error) {
        console.error("Error fetching upcoming payments:", error);
      }
    };
    fetchUpcomingPayments();
  }, [user.id, token]);

  // Fetch user transfers
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/transfers/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setTransfers(res.data);
      } catch (error) {
        console.error("Transfer fetch error:", error);
      }
    };
    fetchTransfers();
  }, [user.id, token]);

  useEffect(() => {
    setIncomeSources(
      JSON.parse(localStorage.getItem(`incomeSources_${user.id}`)) || []
    );
    setExpenseSources(
      JSON.parse(localStorage.getItem(`expenseSources_${user.id}`)) || []
    );
  }, [user.id]);

  const handleOpenAccountDetails = (account) => {
    if (account.accountType === "INVESTMENT") {
      navigate(`/investment/${account.id}`);
    } else {
      navigate(`/transactions/${account.id}`);
    }
  };

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
      month: "short",
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (debt) => {
    if (!debt.totalInstallments || debt.totalInstallments === 0) {
      return debt.status === "COMPLETED" ? 100 : 0;
    }
    return ((debt.paidInstallments || 0) / debt.totalInstallments) * 100;
  };

  // Modern glassy card style
  const glassCardStyle = {
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${borderColor}`,
    boxShadow: isDarkMode ? "0 4px 24px rgba(0, 0, 0, 0.3)" : "0 4px 24px rgba(0, 0, 0, 0.12)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": { 
      transform: "translateY(-2px)", 
      boxShadow: isDarkMode ? "0 8px 32px rgba(0, 0, 0, 0.4)" : "0 8px 32px rgba(0, 0, 0, 0.18)",
    },
  };

  const renderCurrencyAccount = (item) => (
    <Card
      key={item.id}
      sx={{
        width: { xs: "90%", sm: 260, md: 300 },
        height: 130,
        p: 2,
        bgcolor: isDarkMode 
          ? (item.holdingType === "CASH" ? "rgba(76, 175, 80, 0.15)" : "rgba(33, 150, 243, 0.15)")
          : (item.holdingType === "CASH" ? "rgba(76, 175, 80, 0.12)" : "rgba(33, 150, 243, 0.12)"),
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        ...glassCardStyle,
      }}
      onClick={() => handleOpenAccountDetails(item)}
    >
      {item.holdingType === "CASH" ? (
        <SavingsIcon sx={{ fontSize: 44, color: "#4CAF50", mr: 2.5 }} />
      ) : (
        <AccountBalanceIcon sx={{ fontSize: 44, color: "#2196F3", mr: 2.5 }} />
      )}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.3px", mb: 0.5, color: textPrimary }}>
          {item.accountName}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.5px", color: textPrimary }}>
          {formatCurrency(item.balance, item.currency)}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            px: 1.5, 
            py: 0.25,
            bgcolor: item.holdingType === "CASH" ? "rgba(76, 175, 80, 0.2)" : "rgba(33, 150, 243, 0.2)",
            color: item.holdingType === "CASH" ? "#4CAF50" : "#2196F3",
            fontWeight: 600,
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {item.holdingType === "CASH" ? "Nakit" : "Banka"}
        </Typography>
      </Box>
    </Card>
  );

  const renderInvestmentAccount = (item) => (
    <Card
      key={item.id}
      sx={{
        width: { xs: "90%", sm: 260, md: 300 },
        minHeight: 150,
        p: 2,
        bgcolor: isDarkMode
          ? (item.assetType === "GOLD" ? "rgba(212, 175, 55, 0.15)" : "rgba(156, 39, 176, 0.15)")
          : (item.assetType === "GOLD" ? "rgba(212, 175, 55, 0.10)" : "rgba(156, 39, 176, 0.10)"),
        borderRadius: 0,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        ...glassCardStyle,
      }}
      onClick={() => handleOpenAccountDetails(item)}
    >
      {item.assetType === "GOLD" ? (
        <SavingsIcon sx={{ fontSize: 44, color: "#d4af37", mr: 2.5 }} />
      ) : (
        <ShowChartIcon sx={{ fontSize: 44, color: "#9C27B0", mr: 2.5 }} />
      )}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.3px", mb: 0.25, color: textPrimary }}>
          {item.accountName}
        </Typography>
        <Typography variant="caption" sx={{ color: textSecondary, mb: 0.5 }}>
          {item.holdingCount > 0 ? `${item.holdingCount} farklı yatırım` : "Detay için tıklayın"}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.5px", color: textPrimary }}>
          {formatCurrency(item.totalValue, "TRY")}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: item.profitLoss >= 0 ? "#4CAF50" : "#f44336",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          {item.profitLoss >= 0 ? "+" : ""}{formatCurrency(item.profitLoss, "TRY")}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            px: 1.5, 
            py: 0.25,
            bgcolor: item.assetType === "GOLD" ? "rgba(212, 175, 55, 0.25)" : "rgba(156, 39, 176, 0.20)",
            color: item.assetType === "GOLD" ? "#FFD700" : "#BA68C8",
            fontWeight: 600,
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {item.assetType === "GOLD" ? "Altın" : "Hisse"}
        </Typography>
      </Box>
    </Card>
  );

  // Render debt card (similar format to account cards)
  const renderDebtCard = (debt) => {
    const progress = getProgressPercentage(debt);
    const isCredit = debt.debtType === "ACCOUNT_DEBT";

    return (
      <Card
        key={debt.id}
        sx={{
          width: { xs: "90%", sm: 260, md: 300 },
          minHeight: 150,
          p: 2,
          bgcolor: isDarkMode
            ? (isCredit ? "rgba(244, 67, 54, 0.15)" : "rgba(255, 152, 0, 0.15)")
            : (isCredit ? "rgba(244, 67, 54, 0.08)" : "rgba(255, 152, 0, 0.08)"),
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          ...glassCardStyle,
        }}
        onClick={() => navigate("/debt")}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          {isCredit ? (
            <CreditCardIcon sx={{ fontSize: 36, color: "#f44336", mr: 1.5 }} />
          ) : (
            <PaymentIcon sx={{ fontSize: 36, color: "#ff9800", mr: 1.5 }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.3px", color: textPrimary }}>
              {debt.toWhom}
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary }}>
              {formatDate(debt.dueDate)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#f44336", fontSize: "1.25rem", letterSpacing: "-0.5px" }}>
              {formatCurrency(debt.remainingAmount, debt.debtCurrency)}
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary }}>
              Toplam: {formatCurrency(debt.debtAmount, debt.debtCurrency)}
            </Typography>
          </Box>
          
          {debt.paymentType === "PERIODIC" && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: textSecondary, fontSize: "0.7rem" }}>
                  Taksit: {debt.paidInstallments || 0}/{debt.totalInstallments}
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary, fontSize: "0.7rem" }}>
                  %{progress.toFixed(0)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 3,
                  borderRadius: 0,
                  bgcolor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: progress === 100 ? "#4caf50" : "#f44336",
                    borderRadius: 0,
                  },
                }}
              />
            </Box>
          )}
          
          <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1.5, 
                py: 0.25,
                bgcolor: isCredit ? "rgba(244, 67, 54, 0.2)" : "rgba(255, 152, 0, 0.2)",
                color: isCredit ? "#f44336" : "#ff9800",
                fontWeight: 600,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {isCredit ? "Kredi" : "Nakit Borç"}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 1.5, 
                py: 0.25,
                bgcolor: "rgba(0, 0, 0, 0.05)",
                color: "text.secondary",
                fontWeight: 500,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {debt.paymentType === "PERIODIC" ? "Taksitli" : "Tek Ödeme"}
            </Typography>
          </Box>
        </Box>
      </Card>
    );
  };

  const getChartData = (sources, type, transfers) =>
    sources.map((source) => {
      const total = transfers
        .filter((t) => t.type === type && t.category === source)
        .reduce((sum, t) => sum + t.amount * (t.exchangeRate || 1), 0);
      return { name: source, value: total };
    });

  const incomeData = getChartData(incomeSources, "incoming", transfers);
  const expenseData = getChartData(expenseSources, "outgoing", transfers);

  // Calculate net balance (assets - debts)
  const totalAssets = accountSummary?.totalBalanceTRY || 0;
  const totalDebts = debtSummary?.totalRemainingAmount || 0;
  const netBalance = totalAssets - totalDebts;

  // Active debts for the debt section
  const activeDebts = debtSummary?.debts?.filter((d) => d.status !== "COMPLETED") || [];

  // Calculate pie chart data by account type
  const calculatePieData = () => {
    if (!accountSummary) return [];
    
    // Calculate currency accounts total (Para)
    const currencyTotal = accountSummary.currencyTotals 
      ? Object.values(accountSummary.currencyTotals).reduce((sum, val) => sum + (val || 0), 0)
      : 0;
    
    // Calculate gold and stock totals from investment accounts
    let goldTotal = 0;
    let stockTotal = 0;
    
    if (accountSummary.investmentAccounts) {
      accountSummary.investmentAccounts.forEach((acc) => {
        if (acc.holdings) {
          acc.holdings.forEach((holding) => {
            const value = (holding.quantity || 0) * (holding.currentPrice || 0);
            if (holding.assetType === "GOLD") {
              goldTotal += value;
            } else if (holding.assetType === "STOCK") {
              stockTotal += value;
            }
          });
        }
      });
    }
    
    // Get debt total
    const debtTotal = debtSummary?.totalRemainingAmount || 0;
    
    const data = [];
    if (stockTotal > 0) data.push({ name: "Hisse Yatırımları", value: stockTotal, color: "#9C27B0" });
    if (goldTotal > 0) data.push({ name: "Altın Yatırımları", value: goldTotal, color: "#FFD700" });
    if (currencyTotal > 0) data.push({ name: "Para Hesapları", value: currencyTotal, color: "#4CAF50" });
    if (debtTotal > 0) data.push({ name: "Borçlar", value: debtTotal, color: "#f44336" });
    
    return data;
  };

  const pieData = calculatePieData();

  // Custom active shape for pie chart with external label
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 14}
          fill={fill}
        />
        {/* External label */}
        <text
          x={cx}
          y={cy - outerRadius - 30}
          textAnchor="middle"
          fill={fill}
          style={{ fontWeight: 700, fontSize: 14 }}
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy - outerRadius - 14}
          textAnchor="middle"
          fill={fill}
          style={{ fontWeight: 600, fontSize: 13 }}
        >
          {formatCurrency(value, "TRY")}
        </text>
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "75vw",
        overflow: "hidden",
      }}
    >
      {/* Financial Overview Card with Pie Chart */}
      {accountSummary && (
        <Card
          sx={{
            width: "100%",
            maxWidth: 1200,
            p: 4,
            mt: 2,
            background: "linear-gradient(145deg, #1a2332 0%, #1e2a3a 50%, #162029 100%)",
            borderRadius: 0,
            color: "#fff",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: "center", opacity: 0.9 }}>
            Finansal Özet
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              minHeight: 260,
            }}
          >
            {/* Left Side - Total Balance Info */}
            <Box sx={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", justifyContent: "flex-start", pt: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5, color: "#fff" }}>
                Toplam Varlık
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "#4CAF50" }}>
                {formatCurrency(accountSummary.totalBalanceTRY, "TRY")}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {accountSummary.currencyTotals &&
                  Object.entries(accountSummary.currencyTotals).map(([currency, total]) => (
                    <Box key={currency} sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        {currency}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(total, currency)}
                      </Typography>
                    </Box>
                  ))}

                {accountSummary.totalInvestmentValue > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Yatırımlar
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(accountSummary.totalInvestmentValue, "TRY")}
                    </Typography>
                  </Box>
                )}

                {debtSummary?.totalRemainingAmount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Net Bakiye
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: netBalance >= 0 ? "#4CAF50" : "#f44336" }}>
                      {formatCurrency(netBalance, "TRY")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Center - Pie Chart */}
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minWidth: 300, position: "relative" }}>
              <PieChart width={300} height={300}>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={pieData.length > 1 ? 3 : 0}
                  dataKey="value"
                  stroke="none"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              {/* Center Text - positioned in the hollow center */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "0.65rem" }}>
                  Toplam Varlık
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                >
                  {formatCurrency(totalAssets, "TRY")}
                </Typography>
              </Box>
            </Box>

            {/* Right Side - Debt Info */}
            <Box sx={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", justifyContent: "flex-start", pt: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5, color: "#fff" }}>
                Toplam Borç
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>
                {formatCurrency(debtSummary?.totalRemainingAmount || 0, "TRY")}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {debtSummary?.debtsByCurrency &&
                  Object.entries(debtSummary.debtsByCurrency).map(([currency, total]) => (
                    <Box key={currency} sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ opacity: 0.7, color: "#f44336" }}>
                        {currency}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#f44336" }}>
                        {formatCurrency(total, currency)}
                      </Typography>
                    </Box>
                  ))}

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ opacity: 0.7, color: "#f44336" }}>
                    Aktif Borç
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#f44336" }}>
                    {debtSummary?.activeDebts || 0} adet
                  </Typography>
                </Box>

                {debtSummary?.totalPaidAmount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ opacity: 0.7, color: "#f44336" }}>
                      Ödenen
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#f44336" }}>
                      {formatCurrency(debtSummary.totalPaidAmount, "TRY")}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mt: 3, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: "#9C27B0" }} />
              <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.8 }}>Hisse</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: "#FFD700" }} />
              <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.8 }}>Altın</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: "#4CAF50" }} />
              <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.8 }}>Para</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: "#f44336" }} />
              <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.8 }}>Borç</Typography>
            </Box>
          </Box>
        </Card>
      )}

      {/* Currency Accounts Section */}
      <Divider sx={{ width: "100%", my: 4, borderColor: borderColor }} />
      
      <Box sx={{ width: "100%", mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AccountBalanceIcon sx={{ fontSize: 30, color: "#2196F3" }} />
            <Typography variant="h5" sx={{ color: textPrimary, fontWeight: 600 }}>Para Hesapları</Typography>
            <Chip 
              label={accountSummary?.currencyAccountCount || 0} 
              size="small" 
              color="primary" 
            />
          </Box>
          
          {/* Real-time Currency Rates */}
          <CurrencyRatesDisplay isDarkMode={isDarkMode} />
        </Box>

        {accountSummary?.currencyAccounts?.length === 0 ? (
          <Typography variant="body1" sx={{ ml: 5, color: textSecondary }}>
            Henüz para hesabı eklenmemiş.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 3,
              justifyItems: "center",
            }}
          >
            {accountSummary?.currencyAccounts?.map(renderCurrencyAccount)}
          </Box>
        )}
      </Box>

      <Divider sx={{ width: "100%", my: 4, borderColor: borderColor }} />

      {/* Investment Accounts Section */}
      <Box sx={{ width: "100%", mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <TrendingUpIcon sx={{ fontSize: 30, color: "#9C27B0" }} />
          <Typography variant="h5" sx={{ color: textPrimary, fontWeight: 600 }}>Yatırım Hesapları</Typography>
          <Chip 
            label={accountSummary?.investmentAccountCount || 0} 
            size="small" 
            color="secondary" 
          />
        </Box>

        {accountSummary?.investmentAccounts?.length === 0 ? (
          <Typography variant="body1" sx={{ ml: 5, color: textSecondary }}>
            Henüz yatırım hesabı eklenmemiş.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 3,
              justifyItems: "center",
            }}
          >
            {accountSummary?.investmentAccounts?.map(renderInvestmentAccount)}
          </Box>
        )}
      </Box>

      {/* Debts Section (same format as accounts) */}
      <Divider sx={{ width: "100%", my: 4, borderColor: borderColor }} />
      
      <Box sx={{ width: "100%", mt: 2 }}>
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2, 
            mb: 2,
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
          onClick={() => navigate("/debt")}
        >
          <CreditCardIcon sx={{ fontSize: 30, color: "#f44336" }} />
          <Typography variant="h5" sx={{ color: textPrimary, fontWeight: 600 }}>Borçlar</Typography>
          <Chip 
            label={debtSummary?.activeDebts || 0} 
            size="small" 
            color="error" 
          />
          <ArrowForwardIosIcon sx={{ fontSize: 18, color: textSecondary, ml: "auto" }} />
        </Box>

        {activeDebts.length === 0 ? (
          <Typography variant="body1" sx={{ ml: 5, color: textSecondary }}>
            Aktif borç bulunmuyor.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 3,
              justifyItems: "center",
            }}
          >
            {activeDebts.slice(0, 6).map(renderDebtCard)}
          </Box>
        )}

        {activeDebts.length > 6 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => navigate("/debt")}
              startIcon={<ArrowForwardIosIcon />}
              sx={{ 
                borderRadius: 0, 
                textTransform: "none", 
                fontWeight: 600,
                px: 3,
              }}
            >
              Tüm Borçları Gör ({activeDebts.length})
            </Button>
          </Box>
        )}
      </Box>

      {/* Recent Transactions Section */}
      <Divider sx={{ width: "100%", my: 4, borderColor: borderColor }} />
      
      <Box sx={{ width: "100%", mt: 2 }}>
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 2, 
            mb: 2,
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
          onClick={() => navigate("/all-transactions")}
        >
          <HistoryIcon sx={{ fontSize: 30, color: "#FF9800" }} />
          <Typography variant="h5" sx={{ color: textPrimary, fontWeight: 600 }}>Son Hesap Hareketleri</Typography>
          <ArrowForwardIosIcon sx={{ fontSize: 18, color: textSecondary, ml: "auto" }} />
        </Box>

        {transfers.length === 0 ? (
          <Typography variant="body1" sx={{ ml: 5, color: textSecondary }}>
            Henüz hesap hareketi yok.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {transfers
              .sort((a, b) => new Date(b.createDate) - new Date(a.createDate))
              .slice(0, 4)
              .map((transaction) => {
                const isIncome = transaction.type === "incoming" || 
                  (transaction.type === "inter-account" && transaction.inputPreviousBalance !== null);
                
                return (
                  <Card
                    key={transaction.id}
                    sx={{
                      p: 2,
                      bgcolor: isDarkMode 
                        ? (isIncome ? "rgba(76, 175, 80, 0.12)" : "rgba(244, 67, 54, 0.12)")
                        : (isIncome ? "rgba(76, 175, 80, 0.06)" : "rgba(244, 67, 54, 0.06)"),
                      borderRadius: 0,
                      cursor: "pointer",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: `1px solid ${borderColor}`,
                      borderLeftWidth: "3px",
                      borderLeftStyle: "solid",
                      borderLeftColor: isIncome ? "#4CAF50" : "#f44336",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { 
                        transform: "translateX(4px)", 
                        bgcolor: isDarkMode
                          ? (isIncome ? "rgba(76, 175, 80, 0.18)" : "rgba(244, 67, 54, 0.18)")
                          : (isIncome ? "rgba(76, 175, 80, 0.10)" : "rgba(244, 67, 54, 0.10)"),
                      },
                    }}
                    onClick={() => navigate(`/transactions/${transaction.account?.id}`)}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.3px", color: textPrimary }}>
                          {transaction.category || "Hesaplar Arası Transfer"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: textSecondary }}>
                          {transaction.account?.accountName} • {transaction.date}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          color: isIncome ? "#4CAF50" : "#f44336",
                          fontSize: "1.1rem",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {isIncome ? "+" : "-"}{Math.abs(transaction.amount)} {transaction.account?.currency}
                      </Typography>
                    </Box>
                  </Card>
                );
              })}
          </Box>
        )}

        {transfers.length > 4 && (
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "center", 
              mt: 2 
            }}
          >
            <Button 
              variant="text"
              onClick={() => navigate("/all-transactions")}
              sx={{ 
                textTransform: "none",
                fontWeight: 600,
                color: "#FF9800",
                fontSize: "0.85rem",
                "&:hover": { bgcolor: "rgba(255, 152, 0, 0.08)" }
              }}
            >
              Tümünü Gör →
            </Button>
          </Box>
        )}
      </Box>

      {/* Upcoming Debt Payments Section */}
      {upcomingPayments.length > 0 && (
        <>
          <Divider sx={{ width: "100%", my: 4 }} />
          
          <Box sx={{ width: "100%", mt: 2 }}>
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 2, 
                mb: 2,
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
              onClick={() => navigate("/debt")}
            >
              <PaymentIcon sx={{ fontSize: 30, color: "#f44336" }} />
              <Typography variant="h5">Yaklaşan Borç Ödemeleri</Typography>
              <Chip label={upcomingPayments.length} size="small" color="error" />
              <ArrowForwardIosIcon sx={{ fontSize: 18, color: "text.secondary", ml: "auto" }} />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {upcomingPayments.slice(0, 5).map((payment) => {
                const daysUntil = getDaysUntil(payment.paymentDate);
                const isUrgent = daysUntil !== null && daysUntil <= 7;
                const isOverdue = daysUntil !== null && daysUntil < 0;

                return (
                  <Card
                    key={payment.id}
                    sx={{
                      p: 2,
                      bgcolor: isOverdue 
                        ? "rgba(244, 67, 54, 0.08)" 
                        : isUrgent 
                          ? "rgba(255, 152, 0, 0.08)" 
                          : "rgba(244, 67, 54, 0.04)",
                      borderRadius: 0,
                      borderLeft: `3px solid ${isOverdue ? "#d32f2f" : isUrgent ? "#ff9800" : "#f44336"}`,
                      cursor: "pointer",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderLeftWidth: "3px",
                      borderLeftStyle: "solid",
                      borderLeftColor: isOverdue ? "#d32f2f" : isUrgent ? "#ff9800" : "#f44336",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": { 
                        transform: "translateX(4px)", 
                        bgcolor: isOverdue 
                          ? "rgba(244, 67, 54, 0.12)" 
                          : isUrgent 
                            ? "rgba(255, 152, 0, 0.12)" 
                            : "rgba(244, 67, 54, 0.08)",
                      },
                    }}
                    onClick={() => navigate("/debt")}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {(isOverdue || isUrgent) && (
                          <WarningAmberIcon sx={{ color: isOverdue ? "#d32f2f" : "#ff9800", fontSize: 22 }} />
                        )}
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.3px" }}>
                            {payment.debtToWhom}
                            {payment.paymentNumber && ` - Taksit ${payment.paymentNumber}`}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <EventIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {formatDate(payment.paymentDate)}
                            </Typography>
                            {payment.accountName && (
                              <>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>•</Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  {payment.accountName}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography 
                          variant="h6" 
                          sx={{ fontWeight: 700, color: "#f44336", fontSize: "1.1rem", letterSpacing: "-0.5px" }}
                        >
                          {formatCurrency(payment.amount, payment.debtCurrency)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1.5,
                            py: 0.25,
                            bgcolor: isOverdue 
                              ? "rgba(211, 47, 47, 0.12)" 
                              : isUrgent 
                                ? "rgba(255, 152, 0, 0.12)" 
                                : "rgba(0, 0, 0, 0.05)",
                            color: isOverdue ? "#c62828" : isUrgent ? "#e65100" : "text.secondary",
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {isOverdue 
                            ? `${Math.abs(daysUntil)} gün geçti` 
                            : daysUntil === 0 
                              ? "Bugün" 
                              : `${daysUntil} gün kaldı`
                          }
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => navigate("/debt")}
                startIcon={<ArrowForwardIosIcon />}
                sx={{ 
                  borderRadius: 0, 
                  textTransform: "none", 
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Tüm Borçları Gör
              </Button>
            </Box>
          </Box>
        </>
      )}

      {/* Income/Expense Charts */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "75vw",
          mt: 10,
        }}
      >
        <Typography variant="h5" align="center">
          {t("sources")}
        </Typography>

        {incomeData.length === 0 && expenseData.length === 0 ? (
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            {t("noTransactions")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", gap: 5, mt: 3, flexWrap: "wrap", justifyContent: "center" }}>
            <Box>
              <Typography variant="h6">{t("incomeSources")}</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} TRY`} />
                <Legend />
              </PieChart>
            </Box>

            <Box>
              <Typography variant="h6">{t("expenseSources")}</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  dataKey="value"
                >
                  {expenseData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} TRY`} />
                <Legend />
              </PieChart>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AccountPage;
