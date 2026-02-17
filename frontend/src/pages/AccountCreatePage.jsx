import React, { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Button,
  Snackbar,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Fade,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Chip,
  Paper,
} from "@mui/material";
import axios from "axios";
import SaveIcon from "@mui/icons-material/Save";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import { backendUrl } from "../utils/envVariables";
import {TURKISH_BANKS} from "../data/bankData"
import {CURRENCIES} from "../data/currencies"
import {GOLD_TYPES} from "../data/goldData"
import {STOCKS} from "../data/stocksData"



const AccountCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { isDarkMode } = useTheme();
  const token = localStorage.getItem("token");

  // Main account type: CURRENCY or INVESTMENT
  const [accountType, setAccountType] = useState("");

  // Currency account fields
  const [holdingType, setHoldingType] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("");

  // Investment account fields
  const [assetType, setAssetType] = useState(""); // GOLD or STOCK

  // Multiple gold items
  const [goldItems, setGoldItems] = useState([
    { id: 1, goldType: "", quantity: "", price: "" },
  ]);

  // Multiple stock items
  const [stockItems, setStockItems] = useState([
    { id: 1, stock: null, quantity: "", price: "" },
  ]);

  // Common fields
  const [accountName, setAccountName] = useState("");

  // Stock search dialog
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockSearch, setStockSearch] = useState("");
  const [activeStockItemId, setActiveStockItemId] = useState(null);

  // Alerts and states
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Filter stocks based on search (exclude already selected stocks)
  const filteredStocks = useMemo(() => {
    const selectedSymbols = stockItems
      .filter((item) => item.stock)
      .map((item) => item.stock.symbol);

    let available = STOCKS.filter(
      (stock) => !selectedSymbols.includes(stock.symbol)
    );

    if (stockSearch) {
      const searchLower = stockSearch.toLowerCase();
      available = available.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchLower) ||
          stock.name.toLowerCase().includes(searchLower)
      );
    }

    return available;
  }, [stockSearch, stockItems]);

  // Get available gold types (exclude already selected)
  const getAvailableGoldTypes = (currentItemId) => {
    const selectedTypes = goldItems
      .filter((item) => item.id !== currentItemId && item.goldType)
      .map((item) => item.goldType);

    return GOLD_TYPES.filter((type) => !selectedTypes.includes(type.value));
  };

  const handleAccountTypeChange = (event, newType) => {
    if (newType !== null) {
      setAccountType(newType);
      // Reset all fields when switching account type
      setHoldingType("");
      setSelectedBank("");
      setBalance("");
      setCurrency("");
      setAssetType("");
      setGoldItems([{ id: 1, goldType: "", quantity: "", price: "" }]);
      setStockItems([{ id: 1, stock: null, quantity: "", price: "" }]);
      setAccountName("");
      setError("");
    }
  };

  const handleHoldingTypeChange = (event, newHoldingType) => {
    if (newHoldingType !== null) {
      setHoldingType(newHoldingType);
      if (newHoldingType === "CASH") {
        setSelectedBank("");
      }
    }
  };

  const handleAssetTypeChange = (event, newAssetType) => {
    if (newAssetType !== null) {
      setAssetType(newAssetType);
      // Reset investment-specific fields
      setGoldItems([{ id: 1, goldType: "", quantity: "", price: "" }]);
      setStockItems([{ id: 1, stock: null, quantity: "", price: "" }]);
      // setAccountName("");
    }
  };

  // Gold item handlers
  const addGoldItem = () => {
    const newId = Math.max(...goldItems.map((item) => item.id)) + 1;
    setGoldItems([
      ...goldItems,
      { id: newId, goldType: "", quantity: "", price: "" },
    ]);
  };

  const removeGoldItem = (id) => {
    if (goldItems.length > 1) {
      setGoldItems(goldItems.filter((item) => item.id !== id));
    }
  };

  const updateGoldItem = (id, field, value) => {
    setGoldItems(
      goldItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Stock item handlers
  const addStockItem = () => {
    const newId = Math.max(...stockItems.map((item) => item.id)) + 1;
    setStockItems([
      ...stockItems,
      { id: newId, stock: null, quantity: "", price: "" },
    ]);
  };

  const removeStockItem = (id) => {
    if (stockItems.length > 1) {
      setStockItems(stockItems.filter((item) => item.id !== id));
    }
  };

  const updateStockItem = (id, field, value) => {
    setStockItems(
      stockItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleStockSelect = (stock) => {
    if (activeStockItemId) {
      updateStockItem(activeStockItemId, "stock", stock);
    }
    setStockDialogOpen(false);
    setStockSearch("");
    setActiveStockItemId(null);
  };

  const openStockDialog = (itemId) => {
    setActiveStockItemId(itemId);
    setStockDialogOpen(true);
  };

  // Generate account name based on selections
  const generateCurrencyAccountName = () => {
    if (holdingType === "BANK" && selectedBank) {
      const bank = TURKISH_BANKS.find((b) => b.value === selectedBank);
      return bank ? `${bank.label} - ${currency}` : "";
    } else if (holdingType === "CASH") {
      return `Nakit - ${currency}`;
    }
    return "";
  };

  // Auto-generate currency account name when bank or currency changes
  React.useEffect(() => {
    if (accountType === "CURRENCY") {
      if (
        (holdingType === "BANK" && selectedBank && currency) ||
        (holdingType === "CASH" && currency)
      ) {
        setAccountName(generateCurrencyAccountName());
      }
    }
  }, [holdingType, selectedBank, currency, accountType]);

  // Calculate total value for gold items
  const calculateGoldTotal = () => {
    return goldItems.reduce((total, item) => {
      if (item.quantity && item.price) {
        return total + parseFloat(item.quantity) * parseFloat(item.price);
      }
      return total;
    }, 0);
  };

  // Calculate total value for stock items
  const calculateStockTotal = () => {
    return stockItems.reduce((total, item) => {
      if (item.quantity && item.price) {
        return total + parseFloat(item.quantity) * parseFloat(item.price);
      }
      return total;
    }, 0);
  };

  // Validation checks
  const isCurrencyFormValid = () => {
    if (!holdingType || !currency || !balance) return false;
    if (holdingType === "BANK" && !selectedBank) return false;
    return true;
  };

  const isGoldFormValid = () => {
    if (!accountName) return false;
    return goldItems.every(
      (item) => item.goldType && item.quantity && item.price
    );
  };

  const isStockFormValid = () => {
    if (!accountName) return false;
    return stockItems.every(
      (item) => item.stock && item.quantity && item.price
    );
  };

  const isInvestmentFormValid = () => {
    if (!assetType) return false;
    if (assetType === "GOLD") return isGoldFormValid();
    if (assetType === "STOCK") return isStockFormValid();
    return false;
  };

  // Add account
  const handleAddAccount = async () => {
    if (accountType === "CURRENCY" && !isCurrencyFormValid()) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }

    if (accountType === "INVESTMENT" && !isInvestmentFormValid()) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      if (accountType === "CURRENCY") {
        const finalAccountName = accountName || generateCurrencyAccountName();
        const now = new Date();
        const updateDate = new Date(
          now.getTime() + 3 * 60 * 60 * 1000
        ).toISOString();

        await axios.post(
          `${backendUrl}/api/accounts/create-account`,
          {
            userId: user.id,
            updateDate,
            accountType,
            accountName: finalAccountName,
            balance: parseFloat(balance),
            currency,
            holdingType,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (accountType === "INVESTMENT") {
        // Create single investment account with multiple holdings
        const holdings = assetType === "GOLD"
          ? goldItems.map((item) => {
              const goldTypeInfo = GOLD_TYPES.find(
                (g) => g.value === item.goldType
              );
              return {
                assetSymbol: item.goldType,
                assetName: goldTypeInfo?.label || item.goldType,
                quantity: parseFloat(item.quantity),
                purchasePrice: parseFloat(item.price),
                currentPrice: parseFloat(item.price),
              };
            })
          : stockItems.map((item) => ({
              assetSymbol: item.stock.symbol,
              assetName: item.stock.name,
              quantity: parseFloat(item.quantity),
              purchasePrice: parseFloat(item.price),
              currentPrice: parseFloat(item.price),
            }));

        await axios.post(
          `${backendUrl}/api/accounts/create-investment`,
          {
            userId: user.id,
            accountName,
            assetType,
            holdings,
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
      setTimeout(() => {
        navigate("/account");
      }, 1000);
      setAccountName("");
    } catch (error) {
      console.error("Hata:", error);
      setError("Bir hata oluştu, tekrar deneyiniz.");
    }
  };

  // Check if we can add more gold types
  const canAddMoreGold = goldItems.length < GOLD_TYPES.length;

  // Check if we can add more stocks
  const canAddMoreStocks = stockItems.length < STOCKS.length;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3 }}
          >
            {t("addAccount")}
          </Typography>

          {/* Main Account Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>
              Hesap Kategorisi
            </Typography>
            <ToggleButtonGroup
              value={accountType}
              exclusive
              onChange={handleAccountTypeChange}
              fullWidth
              sx={{
                "& .MuiToggleButton-root": {
                  py: 2,
                  borderRadius: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="CURRENCY" sx={{ gap: 1 }}>
                <CurrencyExchangeIcon />
                Para Hesabı
              </ToggleButton>
              <ToggleButton value="INVESTMENT" sx={{ gap: 1 }}>
                <TrendingUpIcon />
                Yatırım Hesabı
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* CURRENCY ACCOUNT FORM */}
          <Fade in={accountType === "CURRENCY"} unmountOnExit>
            <Box>
              {/* Holding Type Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>
                  Hesap Türü
                </Typography>
                <ToggleButtonGroup
                  value={holdingType}
                  exclusive
                  onChange={handleHoldingTypeChange}
                  fullWidth
                  sx={{
                    "& .MuiToggleButton-root": {
                      py: 1.5,
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: "#2a4a5e",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#1C2B44",
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="BANK" sx={{ gap: 1 }}>
                    <AccountBalanceIcon />
                    Banka Hesabı
                  </ToggleButton>
                  <ToggleButton value="CASH" sx={{ gap: 1 }}>
                    <SavingsIcon />
                    Nakit
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Bank Selection - Banka Seçimi*/}
              <Fade in={holdingType === "BANK"} unmountOnExit>
                <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                  <InputLabel id="bank-label">Banka Seçin</InputLabel>
                  <Select
                    labelId="bank-label"
                    id="bank-select"
                    label="Banka Seçin"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {TURKISH_BANKS.map((bank) => (
                      <MenuItem key={bank.value} value={bank.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AccountBalanceIcon
                            sx={{ fontSize: 20, color: "text.secondary" }}
                          />
                          {bank.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Fade>

              {/* Currency Selection - Para Birimi */}
              <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                <InputLabel id="currency-label">{t("currency")}</InputLabel>
                <Select
                  labelId="currency-label"
                  id="currency-select"
                  label={t("currency")}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {CURRENCIES.map((curr) => (
                    <MenuItem key={curr.value} value={curr.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span style={{ fontSize: "1.2rem" }}>{curr.flag}</span>
                        {curr.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Balance Input  - Bakiye*/}
              <TextField
                label={t("balance")}
                type="number"
                fullWidth
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                margin="normal"
                placeholder="0.00"
                InputProps={{
                  startAdornment: currency && (
                    <Typography sx={{ mr: 1, color: "text.secondary" }}>
                      {currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€"}
                    </Typography>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Account Name */}
              <TextField
                label={t("accountName")}
                fullWidth
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                margin="normal"
                helperText="Hesap adı otomatik oluşturulur, isterseniz değiştirebilirsiniz"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Fade>

          {/* INVESTMENT ACCOUNT FORM */}
          <Fade in={accountType === "INVESTMENT"} unmountOnExit>
            <Box>
              {/* Account Name - at the top for investment accounts - Hesap Adı*/}
              <TextField
                label="Hesap Adı"
                fullWidth
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                margin="normal"
                placeholder="Örn: Altın Yatırımlarım veya Hisse Portföyüm"
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Asset Type Selection - Yatırım Türü??*/}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>
                  Yatırım Türü
                </Typography>
                <ToggleButtonGroup
                  value={assetType}
                  exclusive
                  onChange={handleAssetTypeChange}
                  fullWidth
                  sx={{
                    "& .MuiToggleButton-root": {
                      py: 1.5,
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: "#d4af37",
                        color: "white",
                        "&:hover": {
                          bgcolor: "#c9a227",
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="GOLD" sx={{ gap: 1 }}>
                    <ViewInArIcon />
                    Altın
                  </ToggleButton>
                  <ToggleButton value="STOCK" sx={{ gap: 1 }}>
                    <ShowChartIcon />
                    Hisse Senedi
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* GOLD FORM */}
              <Fade in={assetType === "GOLD"} unmountOnExit>
                <Box>
                  {/* Gold Items */}
                  {goldItems.map((item, index) => (
                    <Paper
                      key={item.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        position: "relative",
                      }}
                    >
                      {goldItems.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeGoldItem(item.id)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "error.main",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}

                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1.5, color: "text.secondary" }}
                      >
                        Altın #{index + 1}
                      </Typography>

                      {/* Gold Type Selection */}
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id={`gold-type-label-${item.id}`}>
                          Altın Türü
                        </InputLabel>
                        <Select
                          labelId={`gold-type-label-${item.id}`}
                          label="Altın Türü"
                          value={item.goldType}
                          onChange={(e) =>
                            updateGoldItem(item.id, "goldType", e.target.value)
                          }
                          sx={{ borderRadius: 2 }}
                        >
                          {getAvailableGoldTypes(item.id).map((gold) => (
                            <MenuItem key={gold.value} value={gold.value}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <ViewInArIcon
                                  sx={{ fontSize: 20, color: "#d4af37" }}
                                />
                                {gold.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Gold Quantity */}
                        <TextField
                          label="Miktar"
                          type="number"
                          fullWidth
                          value={item.quantity}
                          onChange={(e) =>
                            updateGoldItem(item.id, "quantity", e.target.value)
                          }
                          placeholder="0"
                          InputProps={{
                            endAdornment: item.goldType && (
                              <InputAdornment position="end">
                                {GOLD_TYPES.find(
                                  (g) => g.value === item.goldType
                                )?.symbol || "adet"}
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />

                        {/* Gold Price */}
                        <TextField
                          label="Birim Fiyat"
                          type="number"
                          fullWidth
                          value={item.price}
                          onChange={(e) =>
                            updateGoldItem(item.id, "price", e.target.value)
                          }
                          placeholder="0.00"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">₺</InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>

                      {/* Item Total */}
                      {item.quantity && item.price && (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: 1,
                            bgcolor: isDarkMode ? "rgba(212, 175, 55, 0.15)" : "#fef9e7",
                            borderRadius: 1,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}>
                            Değer:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#d4af37" }}
                          >
                            ₺
                            {(
                              parseFloat(item.quantity) * parseFloat(item.price)
                            ).toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}

                  {/* Add Gold Button */}
                  {canAddMoreGold && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addGoldItem}
                      sx={{
                        mb: 2,
                        py: 1.5,
                        borderRadius: 2,
                        borderStyle: "dashed",
                        borderColor: "#d4af37",
                        color: "#d4af37",
                        "&:hover": {
                          borderColor: "#c9a227",
                          bgcolor: "rgba(212, 175, 55, 0.05)",
                        },
                      }}
                    >
                      Altın Ekle
                    </Button>
                  )}

                  {/* Total Value Preview */}
                  {calculateGoldTotal() > 0 && (
                    <Card
                      sx={{
                        bgcolor: isDarkMode ? "rgba(212, 175, 55, 0.15)" : "#fef9e7",
                        border: "2px solid #d4af37",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkMode ? "#fff" : "inherit" }}>
                            Toplam Hesap Değeri:
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "#d4af37" }}
                          >
                            ₺
                            {calculateGoldTotal().toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </Fade>

              {/* STOCK FORM */}
              <Fade in={assetType === "STOCK"} unmountOnExit>
                <Box>
                  {/* Stock Items */}
                  {stockItems.map((item, index) => (
                    <Paper
                      key={item.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        position: "relative",
                      }}
                    >
                      {stockItems.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeStockItem(item.id)}
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "error.main",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}

                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1.5, color: "text.secondary" }}
                      >
                        Hisse #{index + 1}
                      </Typography>

                      {/* Stock Selection Button */}
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => openStockDialog(item.id)}
                        startIcon={<SearchIcon />}
                        sx={{
                          mb: 2,
                          py: 1.5,
                          borderRadius: 2,
                          justifyContent: "flex-start",
                          borderColor: item.stock ? "primary.main" : "grey.300",
                          bgcolor: item.stock ? "primary.50" : "transparent",
                        }}
                      >
                        {item.stock ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={item.stock.symbol}
                              size="small"
                              color="primary"
                            />
                            <Typography variant="body2" noWrap>
                              {item.stock.name}
                            </Typography>
                          </Box>
                        ) : (
                          "Hisse senedi ara..."
                        )}
                      </Button>

                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Stock Price */}
                        <TextField
                          label="Hisse Fiyatı"
                          type="number"
                          fullWidth
                          value={item.price}
                          onChange={(e) =>
                            updateStockItem(item.id, "price", e.target.value)
                          }
                          placeholder="0.00"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">₺</InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />

                        {/* Stock Quantity */}
                        <TextField
                          label="Miktar"
                          type="number"
                          fullWidth
                          value={item.quantity}
                          onChange={(e) =>
                            updateStockItem(item.id, "quantity", e.target.value)
                          }
                          placeholder="0"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">adet</InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>

                      {/* Item Total */}
                      {item.quantity && item.price && (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: 1,
                            bgcolor: isDarkMode ? "rgba(76, 175, 80, 0.15)" : "#e8f5e9",
                            borderRadius: 1,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary" }}>
                            Değer:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#4caf50" }}
                          >
                            ₺
                            {(
                              parseFloat(item.quantity) * parseFloat(item.price)
                            ).toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}

                  {/* Add Stock Button */}
                  {canAddMoreStocks && (
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addStockItem}
                      sx={{
                        mb: 2,
                        py: 1.5,
                        borderRadius: 2,
                        borderStyle: "dashed",
                        borderColor: "#4caf50",
                        color: "#4caf50",
                        "&:hover": {
                          borderColor: "#388e3c",
                          bgcolor: "rgba(76, 175, 80, 0.05)",
                        },
                      }}
                    >
                      Hisse Ekle
                    </Button>
                  )}

                  {/* Total Value Preview */}
                  {calculateStockTotal() > 0 && (
                    <Card
                      sx={{
                        bgcolor: isDarkMode ? "rgba(76, 175, 80, 0.15)" : "#e8f5e9",
                        border: "2px solid #4caf50",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    >
                      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500, color: isDarkMode ? "#fff" : "inherit" }}>
                            Toplam Hesap Değeri:
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "#4caf50" }}
                          >
                            ₺
                            {calculateStockTotal().toLocaleString("tr-TR", {
                              minimumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Box>
              </Fade>
            </Box>
          </Fade>

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {accountType && (
            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate("/account")}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {t("cancel")}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddAccount}
                startIcon={<SaveIcon />}
                disabled={
                  accountType === "CURRENCY"
                    ? !isCurrencyFormValid()
                    : !isInvestmentFormValid()
                }
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background:
                    accountType === "INVESTMENT"
                      ? "linear-gradient(135deg, #d4af37 0%, #c9a227 100%)"
                      : "linear-gradient(135deg, #1C2B44 0%, #2a4a5e 100%)",
                  color:
                    accountType !== "INVESTMENT" ? "white" : "black"
                }}
              >
                Kaydet
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Stock Search Dialog */}
      <Dialog
        open={stockDialogOpen}
        onClose={() => {
          setStockDialogOpen(false);
          setStockSearch("");
          setActiveStockItemId(null);
        }}
        fullWidth
        maxWidth="sm"
        disableScrollLock
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Hisse Senedi Seç
          </Typography>
          <IconButton
            onClick={() => {
              setStockDialogOpen(false);
              setStockSearch("");
              setActiveStockItemId(null);
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            placeholder="Hisse ara (sembol veya şirket adı)..."
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            autoFocus
          />
          <List
            sx={{
              maxHeight: 400,
              overflow: "auto",
              "& .MuiListItemButton-root": {
                borderRadius: 1,
                mb: 0.5,
                "&:hover": {
                  bgcolor: "primary.50",
                },
              },
            }}
          >
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <ListItemButton
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={stock.symbol}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {stock.name}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      Sonuç bulunamadı
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ borderRadius: 2 }}
        >
          {t("accountAddedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountCreatePage;
