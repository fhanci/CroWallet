import React, { useState, useMemo, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import { backendUrl } from "../utils/envVariables";
import { TURKISH_BANKS } from "../data/bankData"
import { CURRENCIES, exchangeRates } from "../data/currencies"
import { GOLD_TYPES } from "../data/goldData"
import { STOCKS } from "../data/stocksData"
import { BuyInvestmentGold } from "../components/BuyInvestmentGold";
import { BuyInvestmentStock } from "../components/BuyInvestmentStock";
import dayjs from "dayjs";
import { toLocalISOTime } from "../utils/localIsoTime";



const AccountCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
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
    { id: 1, goldType: "", quantity: "", price: "", buyingDateTime: dayjs() },
  ]);

  // Multiple stock items
  const [stockItems, setStockItems] = useState([
    { id: 1, stock: null, quantity: "", price: "", buyingDateTime: dayjs() },
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

  const [selectedMoneyAccount, setSelectedMoneyAccount] = useState(0)
  const [exchangeRate, setExchangeRate] = useState({})
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

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


  const getAccountDetailInfo = async () => {
    const response = await axios.get(
      `${backendUrl}/api/accounts/get-money-account?moneyAccountId=${selectedMoneyAccount}`,
      {
        headers:
        {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );
    return response.data
  }


  useEffect(() => {

    const checkField = async () => {
      let fieldsValid = false;
      if (assetType === "GOLD") {
        fieldsValid = goldItems.every((goldData) =>
          (goldData.goldType !== "" && goldData.goldType !== 0 && goldData.goldType !== null) &&
          (goldData.price !== "" && goldData.price !== 0 && goldData.price !== null) &&
          (goldData.quantity !== "" && goldData.quantity !== 0 && goldData.quantity !== null)
        );

      }
      else if (assetType === "STOCK") {
        fieldsValid = stockItems.every((stockData) =>
          (stockData.price !== 0 && stockData.price !== "" && stockData.price !== null) &&
          (stockData.quantity !== 0 && stockData.quantity !== "" && stockData.quantity !== null) &&
          (stockData.stock !== 0 && stockData.stock !== "" && stockData.stock !== null)
        )

      }
      return fieldsValid && accountName !== "";
    }

    const checkAccountIsEmpty = async() => {
      let fieldsValid = false;
      if (assetType === "GOLD") {
        fieldsValid = goldItems.every((goldData) =>
          (goldData.goldType === "" || goldData.goldType === 0 || goldData.goldType === null) &&
          (goldData.price === "" || goldData.price === 0 || goldData.price === null) &&
          (goldData.quantity === "" || goldData.quantity === 0 || goldData.quantity === null)
        );

      }
      else if (assetType === "STOCK") {
        fieldsValid = stockItems.every((stockData) =>
          (stockData.price === 0 || stockData.price === "" || stockData.price === null) &&
          (stockData.quantity === 0 || stockData.quantity === "" || stockData.quantity === null) &&
          (stockData.stock === 0 || stockData.stock === "" || stockData.stock === null)
        )
      }
      return accountName !== "" && fieldsValid;
    }

    const validate = async () => {

      console.log("İlk hesap mı? : ", isFirstAsset)
      if (!isFirstAsset) {

        if (await checkAccountIsEmpty()){
          console.log("Girdim")
          setIsButtonDisabled(false);
          return;
        }
        console.log("Giremedim")

        let fieldsValid = false;
        if (assetType === "GOLD" || assetType === "STOCK") {
          fieldsValid = await checkField();
          console.log(fieldsValid)
        }

        if (!fieldsValid) {
          setIsButtonDisabled(true)
          return;
        }

        if (selectedMoneyAccount === null || selectedMoneyAccount === 0) {
          setIsButtonDisabled(true)
          return;
        }


        const accountDetail = await getAccountDetailInfo();
        const pay = accountDetail.currency === "TRY"
          ? accountDetail.balance
          : accountDetail.balance * (exchangeRate[accountDetail.currency]?.Buying || 0);


        let totalPrice = 0;
        if (assetType === "GOLD") {
          totalPrice = goldItems.reduce((start, cur) => (cur.price * cur.quantity) + start, 0);
        }
        else if (assetType === "STOCK") {
          totalPrice = stockItems.reduce((start, cur) => (cur.price * cur.quantity) + start, 0);
        }

        console.log("Bakiye Yetersiz mi? : " + (totalPrice > pay));
        setIsButtonDisabled((totalPrice > pay));
        return;
      }


      if (isFirstAsset) {
        let fieldsValid = await checkField();

        setIsButtonDisabled(!fieldsValid || accountName === "");
        return;

      }
    };

    validate();
  }, [selectedMoneyAccount, goldItems, stockItems, exchangeRate, accountName, assetType]);


  useEffect(() => {
    const getMoneyAccountOfPerson = async () => {

      const exchangeRates2 = await exchangeRates();
      setExchangeRate(exchangeRates2)
    }

    getMoneyAccountOfPerson();

  }, [])




  const handleAccountTypeChange = (event, newType) => {
    if (newType !== null) {
      setAccountType(newType);
      // Reset all fields when switching account type
      setHoldingType("");
      setSelectedBank("");
      setBalance("");
      setCurrency("");
      setAssetType("");
      setSelectedMoneyAccount(0)
      setGoldItems([{ id: 1, goldType: "", quantity: "", price: "", buyingDateTime: dayjs() }]);
      setStockItems([{ id: 1, stock: null, quantity: "", price: "", buyingDateTime: dayjs() }]);
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
      setSelectedMoneyAccount(0)
      // Reset investment-specific fields
      setGoldItems([{ id: 1, goldType: "", quantity: "", price: "", buyingDateTime: dayjs() }]);
      setStockItems([{ id: 1, stock: null, quantity: "", price: "", buyingDateTime: dayjs() }]);
      // setAccountName("");
    }
  };



  const handleStockSelect = (stock) => {
    if (activeStockItemId) {
      updateStockItem(activeStockItemId, "stock", stock);
    }
    setStockDialogOpen(false);
    setStockSearch("");
    setActiveStockItemId(null);
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


  const [userAssets, setUserAsset] = useState([]);
  const [isFirstAsset, setIsFirstAsset] = useState(false);

  useEffect(() => {
    const getUserAssets = async () => {
      const response = await axios.get(
        `${backendUrl}/api/asset/my-assets`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      )
      setUserAsset(response.data);

      const isFirstAssetResponse = await axios.get(
        `${backendUrl}/api/asset/isFirstAsset`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      )

      setIsFirstAsset(isFirstAssetResponse.data);
    }
    getUserAssets();

  }, [token])



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

  const getTotalPrice = async (selectedAccount) => {

    let totalPrice;
    if (assetType === "GOLD") {
      totalPrice = goldItems.reduce((start, cur) => (cur.price * cur.quantity) + start, 0);
    }
    else if (assetType === "STOCK") {
      totalPrice = stockItems.reduce((start, cur) => (cur.price * cur.quantity) + start, 0);
    }


    if (selectedAccount.currency === "EUR") {
      totalPrice = totalPrice / (await exchangeRates()).EUR.Selling
      console.log("Bu bir EURO hesabı olduğu için para birimi düşme işlemi buna göre yapıdlı")
    }
    else if (selectedAccount.currency === "USD") {
      totalPrice = totalPrice / (await exchangeRates()).USD.Selling
      console.log("Bu bir USD hesabı olduğu için para birimi düşme işlemi buna göre yapıdlı")
    }
    return totalPrice;
  }

  const checkItemsGoldandStocks = useMemo(() => {
    let fieldsValid = false;
    if (assetType === "GOLD") {
      fieldsValid = goldItems.every((goldData) =>
        (goldData.goldType === "" || goldData.goldType === 0) &&
        (goldData.price === "" || goldData.price === 0) &&
        (goldData.quantity === "" || goldData.quantity === 0)
      );

    }
    else if (assetType === "STOCK") {
      fieldsValid = stockItems.every((stockData) =>
        (stockData.price === 0 || stockData.price === "" || stockData.price === null) &&
        (stockData.quantity === 0 || stockData.quantity === "" || stockData.quantity === null) &&
        (stockData.stock === 0 || stockData.stock === "" || stockData.stock === null)
      )
    }

    return fieldsValid;

  }, [stockItems, goldItems])


  // Add account
  const handleAddAccount = async () => {
    if (accountType === "CURRENCY" && !isCurrencyFormValid()) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }

    // if (accountType === "INVESTMENT" && !isInvestmentFormValid()) {
    //   setError("Lütfen tüm alanları doldurun!");
    //   return;
    // }

    try {
      if (accountType === "CURRENCY") {
        const finalAccountName = accountName || generateCurrencyAccountName();

        const check = await axios.get(
          `${backendUrl}/api/accounts/isThereThisAccountNameBefore?accountName=${accountName}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        if (check.data) {
          setError("Bu hesap adı mevcut. Lütfen farklı bir hesap adı giriniz.")
          return;
        }

        const response = await axios.post(
          `${backendUrl}/api/accounts/create-money-account`,
          {
            userId: user.id,
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

        const transferPayload = {
          type: "incoming",
          moneyAccountId: response.data.id,
          inputPreviousBalance: 0,
          inputNextBalance: Number(balance),
          exchangeRate: currency === "TRY" ? 1 : currency === "USD" ? (await exchangeRates()).USD.Selling : (await exchangeRates()).EUR.Selling,
          description: "Hesap yeni açıldığı için başlangıç bakiyesi",
          category: "Başlangıç Bakiyesi",
          transactionDateTime: toLocalISOTime(new Date()),
          amount: Number(balance),
          currency: currency
        };


        try {
          await axios.post(
            `${backendUrl}/api/transfers/create`,
            transferPayload,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Transfer hatası:", error);
          setError("Bir hata oluştu, lütfen tekrar deneyin.");
        }

      } else if (accountType === "INVESTMENT") {

        console.log("User Assets Length: " + isFirstAsset);

        const check = await axios.get(
          `${backendUrl}/api/asset/isThereThisAssetNameBefore?assetName=${accountName}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        if (check.data) {
          setError("Bu hesap adı mevcut. Lütfen farklı bir hesap adı giriniz.")
          return;
        }

        if (!isFirstAsset && !checkItemsGoldandStocks) {
          const selectedAccount = await getAccountDetailInfo();
          const rates = await exchangeRates();
          const rate = selectedAccount.currency === "TRY" ? 1 :
            selectedAccount.currency === "USD" ? rates.USD.Selling : rates.EUR.Selling;

          const transferPayloads = [];

          let currentBalance = selectedAccount.balance;

          if (assetType === "GOLD") {
            for (const item of goldItems) {
              const itemTotal = parseFloat(item.quantity) * parseFloat(item.price);
              const itemValueInAccountCurrency = itemTotal / rate;

              const previousBalance = currentBalance;
              currentBalance -= itemValueInAccountCurrency;


              transferPayloads.push({
                type: "outgoing",
                moneyAccountId: selectedAccount.id,
                outputPreviousBalance: previousBalance,
                outputNextBalance: currentBalance,
                exchangeRate: rate,
                description: "Altın/Hisse alım sırasında bu hesaptan para çıkışı sağlanmıştır",
                transactionDateTime: toLocalISOTime(item.buyingDateTime),
                category: "Satın Alım",
                amount: itemValueInAccountCurrency,
                currency: selectedAccount.currency
              })
            }
          }
          else {
            for (const item of stockItems) {
              const itemTotal = parseFloat(item.quantity) * parseFloat(item.price);
              const itemValueInAccountCurrency = itemTotal / rate;
              const previousBalance = currentBalance;
              currentBalance -= itemValueInAccountCurrency;
              transferPayloads.push({
                type: "outgoing",
                moneyAccountId: selectedAccount.id,
                outputPreviousBalance: previousBalance,
                outputNextBalance: currentBalance,
                exchangeRate: rate,
                description: "Altın/Hisse alım sırasında bu hesaptan para çıkışı sağlanmıştır",
                transactionDateTime: toLocalISOTime(item.buyingDateTime),
                category: "Satın Alım",
                amount: itemValueInAccountCurrency,
                currency: selectedAccount.currency,
              })


            }

          };

          console.log("Transfer payloadları:", transferPayloads);


          // const transferPayload = {
          //   type: "outgoing",
          //   moneyAccountId: selectedAccount.id,
          //   outputPreviousBalance: selectedAccount.balance,
          //   outputNextBalance: selectedAccount.balance - await getTotalPrice(selectedAccount),
          //   exchangeRate: selectedAccount.currency === "TRY" ? 1 : selectedAccount.currency === "USD" ? (await exchangeRates()).USD.Selling : (await exchangeRates()).EUR.Selling,
          //   description: "Altın/Hisse alım sırasında bu hesaptan para çıkışı sağlanmıştır",
          //   transactionDateTime: new Date(selectedTransfer.date).toISOString().slice(0, 19),
          //   category: "Satın Alım",
          //   amount: await getTotalPrice(selectedAccount),
          //   currency: selectedAccount.currency
          // };

          const updatedAccount = {
            ...selectedAccount,
            balance: selectedAccount.balance - await getTotalPrice(selectedAccount),
          };

          try {

            await axios.put(
              `${backendUrl}/api/asset/update-money-account?updatedAccount=false&exchangeRate=${CURRENCIES.find(c => c.value === selectedAccount.currency)?.exchangeRates}`,
              updatedAccount,
              {
                headers: {
                  Authorization: token ? `Bearer ${token}` : undefined,
                  "Content-Type": "application/json",
                },
              }
            );

            for (const transferPayload of transferPayloads) {
              await axios.post(
                `${backendUrl}/api/transfers/create`,
                transferPayload,
                {
                  headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json",
                  },
                }
              );
            }

          }
          catch (err) {
            console.error("Transfer hatası:", err);
            setError("Bir hata oluştu, lütfen tekrar deneyin.");
          }
        }

        if (!isFirstAsset && checkItemsGoldandStocks) {
          const response = await axios.post(`${backendUrl}/api/asset/create-asset`,
            {
              assetName: accountName,
              accountType: accountType,
              assetType: assetType,
              holdingType: accountType === "INVESTMENT" ? null : holdingType,
            },
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
                "Content-Type": "application/json",
              }
            }
          )

          await axios.post(`${backendUrl}/api/asset/create-position`, {
            assetId: response.data,
            costBasis: 0,
            currentValue: 0,
            profitLoss: 0
          }, {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            }
          })


          setOpenSnackbar(true);
          setTimeout(() => {
            navigate("/account");
          }, 1000);
          setAccountName("");
          return;
        }

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



        if (!isFirstAsset) {
          const selectedAccount = await getAccountDetailInfo();
          const updatedAccount = {
            ...selectedAccount,
          };

          console.log("Selected Account:", selectedAccount);
          console.log("Updated Account:", updatedAccount);


          await axios.put(
            `${backendUrl}/api/asset/update-money-account?updatedAccount=false&exchangeRate=${CURRENCIES.find(c => c.value === selectedAccount.currency)?.exchangeRates}`,
            updatedAccount,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
                "Content-Type": "application/json",
              },
            }
          );

        }

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

        const response = await axios.post(`${backendUrl}/api/asset/create-asset`,
          {
            assetName: accountName,
            accountType: accountType,
            assetType: assetType,
            holdingType: accountType === "INVESTMENT" ? null : holdingType,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            }
          }
        )



        const holdings2 = assetType === "GOLD"
          ? goldItems.map((item) => {
            const goldTypeInfo = GOLD_TYPES.find(
              (g) => g.value === item.goldType
            );
            return {
              assetId: response.data,
              transactionType: "CREATE",
              assetSymbol: item.goldType,
              unitPrice: parseFloat(item.price),
              quantity: parseFloat(item.quantity),
              assetName: goldTypeInfo?.label || item.goldType,
              currentValue: parseFloat(goldTypeInfo.Buying),
              buyingDateTime: item.buyingDateTime.toISOString()

            };
          })
          : stockItems.map((item) => ({
            assetId: response.data,
            transactionType: "CREATE",
            assetSymbol: item.stock.symbol,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.price),
            assetName: item.stock.name,
            currentValue: parseFloat(item.stock.price),
            buyingDateTime: item.buyingDateTime.toISOString()
          }));


        await axios.post(`${backendUrl}/api/asset/create-transaction`, holdings2,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            }
          }
        )

        await axios.post(`${backendUrl}/api/asset/create-position`, {
          assetId: response.data,
          costBasis: holdings2.reduce((sum, cur) => sum + (cur.quantity * cur.unitPrice), 0),
          currentValue: holdings2.reduce((sum, cur) => sum + (cur.quantity * cur.currentValue), 0),
          profitLoss: holdings2.reduce((sum, cur) => sum + (cur.quantity * cur.currentValue), 0) - holdings2.reduce((sum, cur) => sum + (cur.quantity * cur.unitPrice), 0)
        }, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          }
        })


      }

      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/investment/stock_and_gold");
      }, 1000);
      setAccountName("");
    } catch (error) {
      console.error("Hata:", error);
      setError("Bir hata oluştu, tekrar deneyiniz.");
    }
  };


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
          {accountType === "CURRENCY" ? <Fade in={accountType === "CURRENCY"} unmountOnExit>
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

            : accountType === "INVESTMENT" ?
              <Fade in={true} unmountOnExit>
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

                    {assetType === "GOLD" ?
                      <BuyInvestmentGold setGoldItems={setGoldItems} goldItems={goldItems} setSelectedMoneyAccount={setSelectedMoneyAccount} selectedMoneyAccount={selectedMoneyAccount}></BuyInvestmentGold> : assetType === "STOCK" ?
                        <BuyInvestmentStock setStockItems={setStockItems} stockItems={stockItems} setSelectedMoneyAccount={setSelectedMoneyAccount} selectedMoneyAccount={selectedMoneyAccount}></BuyInvestmentStock> :
                        <Box></Box>}


                  </Box>
                </Box>
              </Fade>
              : <Box></Box>
          }

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
                    : isButtonDisabled
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
