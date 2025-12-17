import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Fade,
  Divider,
  InputAdornment,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SavingsIcon from "@mui/icons-material/Savings";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import EventIcon from "@mui/icons-material/Event";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import axios from "axios";
import { backendUrl } from "../utils/envVariables";

const CURRENCIES = [
  { value: "TRY", label: "₺ Türk Lirası", symbol: "₺" },
  { value: "USD", label: "$ Amerikan Doları", symbol: "$" },
  { value: "EUR", label: "€ Euro", symbol: "€" },
];

const PAYMENT_FREQUENCIES = [
  { value: "WEEKLY", label: "Haftalık" },
  { value: "MONTHLY", label: "Aylık" },
  { value: "QUARTERLY", label: "3 Aylık" },
  { value: "YEARLY", label: "Yıllık" },
];

const DebtCreatePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("token");

  // Accounts
  const [accounts, setAccounts] = useState([]);

  // Debt type: ACCOUNT_DEBT or CASH_DEBT
  const [debtType, setDebtType] = useState("");

  // Payment type: SINGLE_DATE or PERIODIC
  const [paymentType, setPaymentType] = useState("");

  // Common fields
  const [debtAmount, setDebtAmount] = useState("");
  const [debtCurrency, setDebtCurrency] = useState("");
  const [toWhom, setToWhom] = useState("");
  const [description, setDescription] = useState("");
  const [warningPeriod, setWarningPeriod] = useState("7");

  // Account selection (for ACCOUNT_DEBT/Kredi)
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Single date payment fields
  const [dueDate, setDueDate] = useState("");

  // Periodic payment fields
  const [startDate, setStartDate] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("MONTHLY");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");

  // Exchange rate for foreign currencies (Nakit Borç only)
  const [exchangeRate, setExchangeRate] = useState("");

  const [error, setError] = useState();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch currency accounts (only BANK accounts for Kredi)
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/accounts/currency/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setAccounts(response.data);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [user.id, token]);

  // Auto-calculate installment amount when total amount or installments change
  useEffect(() => {
    if (paymentType === "PERIODIC" && debtAmount && totalInstallments) {
      const amount = parseFloat(debtAmount) / parseInt(totalInstallments);
      setInstallmentAmount(amount.toFixed(2));
    }
  }, [debtAmount, totalInstallments, paymentType]);

  // For Kredi, only show BANK accounts
  const bankAccounts = accounts.filter((acc) => acc.holdingType === "BANK");

  // For Nakit Borç, filter by selected currency
  const filteredAccounts = accounts.filter(
    (acc) => !debtCurrency || acc.currency === debtCurrency
  );

  const handleDebtTypeChange = (event, newType) => {
    if (newType !== null) {
      setDebtType(newType);
      setSelectedAccount(null);
      setDebtCurrency("");
      if (newType === "CASH_DEBT") {
        setSelectedAccount(null);
      }
    }
  };

  // When account is selected for Kredi, auto-set currency and reset exchange rate
  const handleAccountChange = (accountId) => {
    const account = bankAccounts.find((a) => a.id === accountId);
    setSelectedAccount(account);
    setExchangeRate(""); // Reset exchange rate when account changes
    if (account) {
      setDebtCurrency(account.currency);
    }
  };

  const handlePaymentTypeChange = (event, newType) => {
    if (newType !== null) {
      setPaymentType(newType);
      // Reset fields
      setDueDate("");
      setStartDate("");
      setTotalInstallments("");
      setInstallmentAmount("");
    }
  };

  const getCurrencySymbol = (currency) => {
    const curr = CURRENCIES.find((c) => c.value === currency);
    return curr ? curr.symbol : "";
  };

  // Check if exchange rate is needed (for foreign currency - USD or EUR)
  const currentCurrency = debtType === "ACCOUNT_DEBT" ? selectedAccount?.currency : debtCurrency;
  const needsExchangeRate = currentCurrency === "USD" || currentCurrency === "EUR";

  // Calculate TRY equivalent
  const getTRYEquivalent = () => {
    if (!needsExchangeRate || !debtAmount || !exchangeRate) return null;
    return parseFloat(debtAmount) * parseFloat(exchangeRate);
  };

  const tryEquivalent = getTRYEquivalent();

  const isFormValid = () => {
    if (!debtType || !paymentType || !debtAmount) {
      return false;
    }
    
    // For Kredi (ACCOUNT_DEBT), account is required, toWhom is optional
    if (debtType === "ACCOUNT_DEBT") {
      if (!selectedAccount) return false;
      // Exchange rate required for foreign currencies
      if ((selectedAccount.currency === "USD" || selectedAccount.currency === "EUR") && !exchangeRate) {
        return false;
      }
    } else {
      // For Nakit Borç, currency and toWhom are required
      if (!debtCurrency || !toWhom) return false;
      // Exchange rate required for foreign currencies
      if ((debtCurrency === "USD" || debtCurrency === "EUR") && !exchangeRate) {
        return false;
      }
    }
    
    if (paymentType === "SINGLE_DATE" && !dueDate) {
      return false;
    }
    if (paymentType === "PERIODIC" && (!startDate || !totalInstallments)) {
      return false;
    }
    return true;
  };

  const handleAddDebt = async () => {
    if (!isFormValid()) {
      setError("Lütfen tüm alanları eksiksiz doldurun!");
      return;
    }

    try {
      // For Kredi, if toWhom is empty, use account name + " Kredi"
      const finalToWhom = debtType === "ACCOUNT_DEBT" && !toWhom.trim()
        ? `${selectedAccount.accountName} Kredi`
        : toWhom;

      // Calculate description with exchange rate info if applicable
      let finalDescription = description;
      if (needsExchangeRate && exchangeRate && debtAmount) {
        const tryValue = parseFloat(debtAmount) * parseFloat(exchangeRate);
        const rateInfo = `[Kur: 1 ${currentCurrency} = ${parseFloat(exchangeRate).toLocaleString("tr-TR")} TRY, TRY Karşılığı: ₺${tryValue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}]`;
        finalDescription = description ? `${description} ${rateInfo}` : rateInfo;
      }

      const newDebt = {
        debtAmount: parseFloat(debtAmount),
        debtCurrency: debtType === "ACCOUNT_DEBT" ? selectedAccount.currency : debtCurrency,
        toWhom: finalToWhom,
        description: finalDescription,
        warningPeriod: parseInt(warningPeriod) || 7,
        status: "ACTIVE",
        debtType,
        paymentType,
        user: { id: user.id },
      };

      // Set account for ACCOUNT_DEBT
      if (debtType === "ACCOUNT_DEBT" && selectedAccount) {
        newDebt.account = { id: selectedAccount.id };
      }

      // Set payment-specific fields
      if (paymentType === "SINGLE_DATE") {
        newDebt.dueDate = dueDate;
      } else if (paymentType === "PERIODIC") {
        newDebt.startDate = startDate;
        newDebt.paymentFrequency = paymentFrequency;
        newDebt.totalInstallments = parseInt(totalInstallments);
        newDebt.installmentAmount = parseFloat(installmentAmount);
        // Calculate due date based on frequency and installments
        let endDate = new Date(startDate);
        for (let i = 0; i < parseInt(totalInstallments); i++) {
          switch (paymentFrequency) {
            case "WEEKLY":
              endDate.setDate(endDate.getDate() + 7);
              break;
            case "MONTHLY":
              endDate.setMonth(endDate.getMonth() + 1);
              break;
            case "QUARTERLY":
              endDate.setMonth(endDate.getMonth() + 3);
              break;
            case "YEARLY":
              endDate.setFullYear(endDate.getFullYear() + 1);
              break;
          }
        }
        newDebt.dueDate = endDate.toISOString().split("T")[0];
      }

      // Create debt
      await axios.post(
        `${backendUrl}/api/debts/create`,
        newDebt,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      // If ACCOUNT_DEBT, increase account balance
      if (debtType === "ACCOUNT_DEBT" && selectedAccount) {
        const createDate = new Date().toISOString();
        const updatedBalance = selectedAccount.balance + parseFloat(debtAmount);

        // Update account balance
        await axios.put(
          `${backendUrl}/api/accounts/update/${selectedAccount.id}`,
          {
            ...selectedAccount,
            balance: updatedBalance,
            updateDate: createDate,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        // Create transfer record
        await axios.post(
          `${backendUrl}/api/transfers/create`,
          {
            amount: parseFloat(debtAmount),
            category: "Kredi",
            details: `${finalToWhom}`,
            date: createDate,
            createDate,
            user: { id: parseInt(user.id) },
            account: { id: selectedAccount.id },
            type: "incoming",
            person: finalToWhom,
            inputPreviousBalance: selectedAccount.balance,
            inputNextBalance: updatedBalance,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setOpenSnackbar(true);
      setError();
      setTimeout(() => navigate("/debt"), 1000);
    } catch (err) {
      console.error(err);
      setError("Bir hata oluştu, tekrar deneyiniz.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            {t("addDebt")}
          </Typography>

          {/* Debt Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>
              Borç Türü
            </Typography>
            <ToggleButtonGroup
              value={debtType}
              exclusive
              onChange={handleDebtTypeChange}
              fullWidth
              sx={{
                "& .MuiToggleButton-root": {
                  py: 1.5,
                  borderRadius: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                },
              }}
            >
              <ToggleButton value="ACCOUNT_DEBT" sx={{ gap: 1 }}>
                <CreditCardIcon />
                Kredi
              </ToggleButton>
              <ToggleButton value="CASH_DEBT" sx={{ gap: 1 }}>
                <SavingsIcon />
                Nakit Borç
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {debtType === "ACCOUNT_DEBT"
                ? "Kredi tutarı seçilen banka hesabına eklenecek"
                : debtType === "CASH_DEBT"
                ? "Borç herhangi bir hesaba eklenmeyecek (nakit olarak alındı)"
                : ""}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* For Kredi: Show bank account selection FIRST */}
          <Fade in={debtType === "ACCOUNT_DEBT"} unmountOnExit>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Banka Hesabı Seçin</InputLabel>
                <Select
                  value={selectedAccount?.id || ""}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  label="Banka Hesabı Seçin"
                  sx={{ borderRadius: 2 }}
                >
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName} - {account.balance?.toLocaleString("tr-TR")} {account.currency}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                  Kredi tutarı bu hesaba eklenecek ve kredi hesabın dövizinde olacak
                </Typography>
              </FormControl>
              
              {selectedAccount && (
                <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                  Kredi para birimi: <strong>{selectedAccount.currency}</strong>
                </Alert>
              )}

              {/* Exchange Rate for Kredi with foreign currency */}
              {selectedAccount && (selectedAccount.currency === "USD" || selectedAccount.currency === "EUR") && (
                <>
                  <TextField
                    label={`Döviz Kuru (1 ${selectedAccount.currency} = ? TRY)`}
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    placeholder={selectedAccount.currency === "USD" ? "Örn: 34.50" : "Örn: 37.00"}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">TRY</InputAdornment>,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />

                  {/* TRY Equivalent Display for Kredi */}
                  {exchangeRate && debtAmount && (
                    <Card sx={{ bgcolor: isDarkMode ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd", border: "1px solid #2196F3", borderRadius: 2, mt: 2 }}>
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}>
                            TRY Karşılığı:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
                            ₺{(parseFloat(debtAmount) * parseFloat(exchangeRate)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {getCurrencySymbol(selectedAccount.currency)}{parseFloat(debtAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} × {parseFloat(exchangeRate).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} = ₺{(parseFloat(debtAmount) * parseFloat(exchangeRate)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </Box>
          </Fade>

          {/* Payment Type Selection - Show after account is selected for Kredi, or after type is selected for Nakit */}
          <Fade in={(debtType === "ACCOUNT_DEBT" && selectedAccount) || debtType === "CASH_DEBT"} unmountOnExit>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>
                Ödeme Planı
              </Typography>
              <ToggleButtonGroup
                value={paymentType}
                exclusive
                onChange={handlePaymentTypeChange}
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    py: 1.5,
                    borderRadius: 2,
                    "&.Mui-selected": {
                      bgcolor: "#f57c00",
                      color: "white",
                      "&:hover": { bgcolor: "#ef6c00" },
                    },
                  },
                }}
              >
                <ToggleButton value="SINGLE_DATE" sx={{ gap: 1 }}>
                  <EventIcon />
                  Tek Seferlik
                </ToggleButton>
                <ToggleButton value="PERIODIC" sx={{ gap: 1 }}>
                  <EventRepeatIcon />
                  Taksitli
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Fade>

          {/* Common Fields */}
          <Fade in={!!paymentType} unmountOnExit>
            <Box>
              {/* Borç Açıklaması - optional for Kredi, required for Nakit Borç */}
              <TextField
                label="Borç Açıklaması"
                placeholder={debtType === "ACCOUNT_DEBT" 
                  ? `Boş bırakılırsa: "${selectedAccount?.accountName || 'Hesap'} Kredi"` 
                  : "Örn: Ahmet'e Borç, Kira, Arkadaş"}
                value={toWhom}
                onChange={(e) => setToWhom(e.target.value)}
                fullWidth
                margin="normal"
                required={debtType === "CASH_DEBT"}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <TextField
                label="Toplam Borç Tutarı"
                type="number"
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                fullWidth
                margin="normal"
                required
                InputProps={{
                  endAdornment: debtType === "ACCOUNT_DEBT" && selectedAccount ? (
                    <InputAdornment position="end">{selectedAccount.currency}</InputAdornment>
                  ) : null,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              {/* Currency Selection - Only for Nakit Borç */}
              {debtType === "CASH_DEBT" && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Para Birimi</InputLabel>
                  <Select
                    value={debtCurrency}
                    onChange={(e) => {
                      setDebtCurrency(e.target.value);
                      setExchangeRate(""); // Reset exchange rate when currency changes
                    }}
                    label="Para Birimi"
                    sx={{ borderRadius: 2 }}
                  >
                    {CURRENCIES.map((curr) => (
                      <MenuItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Exchange Rate - Only for USD/EUR in Nakit Borç */}
              {needsExchangeRate && (
                <TextField
                  label={`Döviz Kuru (1 ${debtCurrency} = ? TRY)`}
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                  placeholder={debtCurrency === "USD" ? "Örn: 34.50" : "Örn: 37.00"}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">TRY</InputAdornment>,
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              )}

              {/* TRY Equivalent Display */}
              {needsExchangeRate && tryEquivalent && (
                <Card sx={{ bgcolor: isDarkMode ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd", border: "1px solid #2196F3", borderRadius: 2, mt: 2 }}>
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}>
                        TRY Karşılığı:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
                        ₺{tryEquivalent.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {getCurrencySymbol(debtCurrency)}{parseFloat(debtAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} × {parseFloat(exchangeRate).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} = ₺{tryEquivalent.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {/* Single Date Fields */}
              {paymentType === "SINGLE_DATE" && (
                <TextField
                  label="Son Ödeme Tarihi"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              )}

              {/* Periodic Payment Fields */}
              {paymentType === "PERIODIC" && (
                <>
                  <TextField
                    label="İlk Ödeme Tarihi"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />

                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Ödeme Sıklığı</InputLabel>
                    <Select
                      value={paymentFrequency}
                      onChange={(e) => setPaymentFrequency(e.target.value)}
                      label="Ödeme Sıklığı"
                      sx={{ borderRadius: 2 }}
                    >
                      {PAYMENT_FREQUENCIES.map((freq) => (
                        <MenuItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Taksit Sayısı"
                    type="number"
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    InputProps={{ inputProps: { min: 1 } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />

                  {/* Calculated Installment Amount */}
                  {installmentAmount && (
                    <Card sx={{ bgcolor: isDarkMode ? "rgba(245, 124, 0, 0.15)" : "#fff3e0", border: "1px solid #f57c00", borderRadius: 2, mt: 2 }}>
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2" sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}>
                            Taksit Tutarı:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#f57c00" }}>
                            {getCurrencySymbol(debtType === "ACCOUNT_DEBT" ? selectedAccount?.currency : debtCurrency)}
                            {parseFloat(installmentAmount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <TextField
                label="Açıklama (Opsiyonel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={2}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />

              <TextField
                label="Hatırlatma (Kaç gün önce)"
                type="number"
                value={warningPeriod}
                onChange={(e) => setWarningPeriod(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">gün</InputAdornment>,
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Box>
          </Fade>

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {paymentType && (
            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate("/debt")}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleAddDebt}
                disabled={!isFormValid()}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: "linear-gradient(135deg, #1C2B44 0%, #2a4a5e 100%)",
                }}
              >
                {t("save")}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ borderRadius: 2 }}>
          {t("debtAddedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DebtCreatePage;
