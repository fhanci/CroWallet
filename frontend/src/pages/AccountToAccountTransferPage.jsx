import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Switch,
  InputAdornment,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import useCurrencyRates from "../config/useCurrencyRates";
import axios from "axios";
import { backendUrl } from "../utils/envVariables";

const AccountToAccountTransferPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const { rates } = useCurrencyRates();
  const now = new Date();
  const token = localStorage.getItem("token");
  const [accounts, setAccounts] = useState([]);
  const [selectedSenderAccount, setSelectedSenderAccount] = useState(null);
  const [selectedReceiverAccount, setSelectedReceiverAccount] = useState(null);
  const [transferData, setTransferData] = useState({});
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [useRealTimeRate, setUseRealTimeRate] = useState(true);
  const [customExchangeRate, setCustomExchangeRate] = useState("");

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "TRY": return "₺";
      case "USD": return "$";
      case "EUR": return "€";
      default: return currency;
    }
  };

  // Calculate real-time exchange rate
  const calculateRealTimeRate = () => {
    if (!selectedSenderAccount || !selectedReceiverAccount) return null;
    const senderCurrency = selectedSenderAccount.currency;
    const receiverCurrency = selectedReceiverAccount.currency;
    if (senderCurrency === receiverCurrency) return 1;

    const senderRate = rates?.[senderCurrency];
    const receiverRate = rates?.[receiverCurrency];
    if (!senderRate || !receiverRate) return null;
    return receiverRate / senderRate;
  };

  // Rate display configuration (handle TRY involvement)
  const getRateDisplayConfig = () => {
    if (!selectedSenderAccount || !selectedReceiverAccount) return null;
    const senderCurrency = selectedSenderAccount.currency;
    const receiverCurrency = selectedReceiverAccount.currency;
    if (senderCurrency === receiverCurrency) {
      return { baseCurrency: senderCurrency, quoteCurrency: receiverCurrency, invert: false };
    }

    const tryInvolved = senderCurrency === "TRY" || receiverCurrency === "TRY";
    if (tryInvolved) {
      const baseCurrency = senderCurrency === "TRY" ? receiverCurrency : senderCurrency;
      const quoteCurrency = "TRY";
      const invert = senderCurrency === "TRY" && receiverCurrency !== "TRY";
      return { baseCurrency, quoteCurrency, invert };
    }

    return { baseCurrency: senderCurrency, quoteCurrency: receiverCurrency, invert: false };
  };

  // Convert effective rate (for backend) to displayed rate (for UI)
  const getDisplayedRateFromEffective = (effectiveRate) => {
    const cfg = getRateDisplayConfig();
    if (!cfg || effectiveRate == null) return null;
    if (cfg.invert) return effectiveRate > 0 ? 1 / effectiveRate : null;
    return effectiveRate;
  };

  // Convert displayed rate (from UI) to effective rate (for backend)
  const getEffectiveRateFromDisplayed = (displayedRate) => {
    const cfg = getRateDisplayConfig();
    if (!cfg || displayedRate == null) return null;
    if (cfg.invert) return displayedRate > 0 ? 1 / displayedRate : null;
    return displayedRate;
  };

  // Get effective exchange rate (what backend needs)
  const getEffectiveExchangeRate = () => {
    if (!selectedSenderAccount || !selectedReceiverAccount) return null;
    const senderCurrency = selectedSenderAccount.currency;
    const receiverCurrency = selectedReceiverAccount.currency;
    if (senderCurrency === receiverCurrency) return 1;

    if (useRealTimeRate) return calculateRealTimeRate();

    const displayed = parseFloat(customExchangeRate);
    if (!displayed || displayed <= 0) return null;
    return getEffectiveRateFromDisplayed(displayed);
  };

  // Check if currencies are different
  const isDifferentCurrency = selectedSenderAccount && selectedReceiverAccount && 
    selectedSenderAccount.currency !== selectedReceiverAccount.currency;

  // Calculate converted amount
  const calculateConvertedAmount = () => {
    if (!transferData.amount) return 0;
    const amount = parseFloat(transferData.amount);
    if (isDifferentCurrency) {
      const effectiveRate = getEffectiveExchangeRate();
      if (effectiveRate) {
        return amount * effectiveRate;
      }
    }
    return amount;
  };

  const convertedAmount = calculateConvertedAmount();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/accounts/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        // Only show CURRENCY type accounts
        const currencyAccounts = response.data.filter(
          acc => !acc.accountType || acc.accountType === "CURRENCY"
        );
        setAccounts(currencyAccounts);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [user.id]);

  const handleSubmit = async () => {
    if (
      !selectedSenderAccount ||
      !selectedReceiverAccount ||
      !transferData.amount ||
      !transferData.date
    ) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (isDifferentCurrency && !getEffectiveExchangeRate()) {
      setError("Geçerli bir döviz kuru giriniz.");
      return;
    }

    if (selectedSenderAccount.id === selectedReceiverAccount.id) {
      setError(t("sameAccountError"));
      return;
    }

    const amount = parseFloat(transferData.amount);
    const senderBalance = parseFloat(selectedSenderAccount.balance);

    if (amount <= 0) {
      setError("Tutar 0'dan büyük olmalıdır.");
      return;
    }

    if (senderBalance < amount) {
      setError(t("insufficientBalance"));
      return;
    }

    const createDate = new Date(
      now.getTime() + 3 * 60 * 60 * 1000
    ).toISOString();
    
    const effectiveRate = isDifferentCurrency 
      ? getEffectiveExchangeRate() 
      : 1;

    const receiverAmount = amount * effectiveRate;

    const outgoingTransfer = {
      amount,
      user: { id: user.id },
      account: { id: selectedSenderAccount.id },
      type: "inter-account",
      category: "Hesaplar Arası Transfer",
      createDate,
      date: transferData.date,
      exchangeRate: effectiveRate,
      person: selectedReceiverAccount.accountName,
      description: transferData.description || `${selectedSenderAccount.accountName} → ${selectedReceiverAccount.accountName}`,
      outputPreviousBalance: senderBalance,
      outputNextBalance: senderBalance - amount,
    };

    const incomingTransfer = {
      amount: receiverAmount,
      user: { id: user.id },
      account: { id: selectedReceiverAccount.id },
      type: "inter-account",
      category: "Hesaplar Arası Transfer",
      createDate,
      date: transferData.date,
      exchangeRate: effectiveRate,
      person: selectedSenderAccount.accountName,
      description: transferData.description || `${selectedSenderAccount.accountName} → ${selectedReceiverAccount.accountName}`,
      inputPreviousBalance: selectedReceiverAccount.balance,
      inputNextBalance: selectedReceiverAccount.balance + receiverAmount,
    };

    const updatedSender = {
      ...selectedSenderAccount,
      balance: senderBalance - amount,
      updateDate: createDate,
    };

    const updatedReceiver = {
      ...selectedReceiverAccount,
      balance: selectedReceiverAccount.balance + receiverAmount,
      updateDate: createDate,
    };

    try {
      // Sequential API calls to avoid SQLite database locking
      await axios.post(
        `${backendUrl}/api/transfers/create`,
        outgoingTransfer,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      await axios.post(
        `${backendUrl}/api/transfers/create`,
        incomingTransfer,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      await axios.put(
        `${backendUrl}/api/accounts/update/${selectedSenderAccount.id}`,
        updatedSender,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      await axios.put(
        `${backendUrl}/api/accounts/update/${selectedReceiverAccount.id}`,
        updatedReceiver,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setOpenSnackbar(true);
      setTimeout(() => navigate("/account"), 1000);
    } catch (err) {
      console.error("Transfer hatası:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  // Calculate new balances for preview
  const senderNewBalance = selectedSenderAccount && transferData.amount
    ? selectedSenderAccount.balance - parseFloat(transferData.amount || 0)
    : null;
  
  const receiverNewBalance = selectedReceiverAccount && transferData.amount
    ? selectedReceiverAccount.balance + convertedAmount
    : null;

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <SwapHorizIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Hesaplar Arası Transfer
            </Typography>
          </Box>

          {/* Sender Account */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="sender-label">{t("senderAccount")}</InputLabel>
            <Select
              labelId="sender-label"
              id="sender-select"
              value={selectedSenderAccount?.id || ""}
              label={t("senderAccount")}
              onChange={(e) =>
                setSelectedSenderAccount(
                  accounts.find((acc) => acc.id === e.target.value)
                )
              }
              sx={{ borderRadius: 2 }}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                    <span>{account.accountName}</span>
                    <Chip 
                      label={`${account.balance} ${account.currency}`} 
                      size="small" 
                      color="error"
                      sx={{ ml: "auto" }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Arrow indicator */}
          <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
            <ArrowForwardIcon sx={{ color: "text.secondary", transform: "rotate(90deg)" }} />
          </Box>

          {/* Receiver Account */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="receiver-label">{t("receiverAccount")}</InputLabel>
            <Select
              labelId="receiver-label"
              id="receiver-select"
              value={selectedReceiverAccount?.id || ""}
              label={t("receiverAccount")}
              onChange={(e) =>
                setSelectedReceiverAccount(
                  accounts.find((acc) => acc.id === e.target.value)
                )
              }
              sx={{ borderRadius: 2 }}
            >
              {accounts
                .filter((acc) => acc.id !== selectedSenderAccount?.id)
                .map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      <span>{account.accountName}</span>
                      <Chip 
                        label={`${account.balance} ${account.currency}`} 
                        size="small" 
                        color="success"
                        sx={{ ml: "auto" }}
                      />
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Currency difference info */}
          {isDifferentCurrency && (
            <Alert severity="warning" sx={{ mt: 2, mb: 1, borderRadius: 2 }}>
              <Typography variant="body2">
                Farklı para birimleri arasında transfer yapıyorsunuz.
                <br />
                <strong>{selectedSenderAccount.currency}</strong> → <strong>{selectedReceiverAccount.currency}</strong>
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Amount Input */}
          <Box display="flex" alignItems="center" marginTop={2} marginBottom={1}>
            <TextField
              label={`Gönderilecek Tutar (${selectedSenderAccount?.currency || ''})`}
              type="number"
              value={transferData.amount || ""}
              onChange={(e) =>
                setTransferData({ ...transferData, amount: e.target.value })
              }
              fullWidth
              InputProps={{
                startAdornment: selectedSenderAccount && (
                  <Typography sx={{ mr: 1, color: "error.main", fontWeight: 600 }}>
                    {getCurrencySymbol(selectedSenderAccount.currency)}
                  </Typography>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          {/* Exchange Rate Input - Only show when currencies are different */}
          {isDifferentCurrency && (
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
                      1 {getRateDisplayConfig()?.baseCurrency || selectedSenderAccount?.currency} = {getDisplayedRateFromEffective(calculateRealTimeRate())?.toFixed(4) || "..."} {getRateDisplayConfig()?.quoteCurrency || selectedReceiverAccount?.currency}
                    </Typography>
                  </Box>
                ) : (
                  <TextField
                    fullWidth
                    label="Döviz Kuru"
                    type="number"
                    value={customExchangeRate}
                    onChange={(e) => setCustomExchangeRate(e.target.value)}
                    placeholder={`1 ${getRateDisplayConfig()?.baseCurrency || selectedSenderAccount?.currency} = ? ${getRateDisplayConfig()?.quoteCurrency || selectedReceiverAccount?.currency}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          1 {getRateDisplayConfig()?.baseCurrency || selectedSenderAccount?.currency} =
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {getRateDisplayConfig()?.quoteCurrency || selectedReceiverAccount?.currency}
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>
            </>
          )}
          {!isDifferentCurrency && (
            <Divider sx={{ my: 2 }} />
          )}

          {/* Transfer Calculation Preview */}
          {selectedSenderAccount && selectedReceiverAccount && transferData.amount && (
            <Card sx={{ 
              mt: 2, 
              bgcolor: isDarkMode 
                ? (isDifferentCurrency ? "rgba(33, 150, 243, 0.15)" : "rgba(255, 255, 255, 0.05)")
                : (isDifferentCurrency ? "primary.light" : "grey.100"),
              borderRadius: 2 
            }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }} gutterBottom>
                  Transfer Özeti
                </Typography>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2">Gönderen:</Typography>
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    -{transferData.amount} {selectedSenderAccount.currency}
                  </Typography>
                </Box>
                
                {isDifferentCurrency && getEffectiveExchangeRate() && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2">Kur:</Typography>
                    <Typography variant="body2">
                      1 {getRateDisplayConfig()?.baseCurrency} = {getDisplayedRateFromEffective(getEffectiveExchangeRate())?.toFixed(4)} {getRateDisplayConfig()?.quoteCurrency}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">Alıcı:</Typography>
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    +{calculateConvertedAmount().toFixed(2)} {selectedReceiverAccount.currency}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2">Gönderen Yeni Bakiye:</Typography>
                  <Typography variant="body2" color={senderNewBalance >= 0 ? "text.primary" : "error.main"} fontWeight={500}>
                    {senderNewBalance?.toFixed(2)} {selectedSenderAccount.currency}
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">Alıcı Yeni Bakiye:</Typography>
                  <Typography variant="body2" color="success.main" fontWeight={500}>
                    {receiverNewBalance?.toFixed(2)} {selectedReceiverAccount.currency}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          <TextField
            label={t("date")}
            type="date"
            value={transferData.date || ""}
            onChange={(e) =>
              setTransferData({ ...transferData, date: e.target.value })
            }
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <TextField
            label={t("description")}
            value={transferData.description || ""}
            onChange={(e) =>
              setTransferData({ ...transferData, description: e.target.value })
            }
            fullWidth
            margin="normal"
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" gap={2} mt={3}>
            <Button 
              variant="outlined" 
              onClick={() => navigate("/account")}
              sx={{ flex: 1, borderRadius: 2 }}
            >
              İptal
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit}
              disabled={!selectedSenderAccount || !selectedReceiverAccount || !transferData.amount || 
                (isDifferentCurrency && !getEffectiveExchangeRate())}
              sx={{ 
                flex: 1, 
                borderRadius: 2,
                background: "linear-gradient(135deg, #1C2B44 0%, #2a4a5e 100%)",
              }}
            >
              Transfer Yap
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ borderRadius: 2 }}>
          {t("transferSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountToAccountTransferPage;
