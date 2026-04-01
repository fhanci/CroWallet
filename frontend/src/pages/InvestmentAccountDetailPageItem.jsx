import React, { useState, useEffect, useMemo } from "react";
import { useUpdateAssetMutation, useDeleteTransactionMutation, useAddTransactionMutation, useSellTransactionMutation, useDeleteAssetMutation } from "../api/holdingsApi";


import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Tooltip,
    IconButton,
    FormControl,
    FormLabel,
    FormControlLabel,
    RadioGroup, Radio,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Alert, Stack, InputLabel, Select, MenuItem,

} from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { GiSellCard } from "react-icons/gi";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "../config/ThemeContext";
import axios from "axios";
import { backendUrl } from "../utils/envVariables";
import { BuyInvestmentGold } from "../components/BuyInvestmentGold";
import { GOLD_TYPES } from "../data/goldData";
import { BuyInvestmentStock } from "../components/BuyInvestmentStock";
import Marquee from "react-fast-marquee";
import { getStocksValueApi, STOCKS } from "../data/stocksData";
import { CURRENCIES, exchangeRates } from "../data/currencies";
import { useUser } from "../config/UserStore";
import { MdDeleteForever } from "react-icons/md";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";




const InvestmentAccountDetailPageItem = ({ title, item }) => {

    // Gold types for display

    console.log(`Ben Bir ${title} Hesabıyım. Itemlerım: ${JSON.stringify(item, 4, 4)}`);

    // const { t } = useTranslation();


    const goldTypeKey = ["GRA", "CEYREKALTIN", "YARIMALTIN", "TAMALTIN", "CUMHURIYETALTINI"]
    const { isDarkMode } = useTheme();
    const token = localStorage.getItem("token");
    const [error, setError] = useState("");

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingHolding, setEditingHolding] = useState(null);
    const [editQuantity, setEditQuantity] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showSellDialog, setShowSellDialog] = useState(false);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingHoldingId, setDeletingHoldingId] = useState(null);


    //Update
    const [updateAsset] = useUpdateAssetMutation();

    //Delete
    const [deleteAsset] = useDeleteAssetMutation();

    //Add Holding
    const [addHolding] = useAddTransactionMutation();

    //Sell Investment
    const [sellTransaction] = useSellTransactionMutation();

    //Delete
    // const [deleteHolding, { isLoading }] = useDeleteHoldingMutation();
    const [deleteTransaction, { isLoading }] = useDeleteTransactionMutation();

    //GoldPrice
    const [goldPrice, setGoldPrice] = useState([])
    const [sellingTransactions, setSellingTransactions] = useState([{}])

    //Stock Price
    const [stockPrice, setStockPrice] = useState([])

    const [selectedMoneyAccount, setSelectedMoneyAccount] = useState(0)
    const [exchangeRate, setExchangeRate] = useState({})
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [moneyAccountPersons, setMoneyAccountPersons] = useState([{}])

    const { user } = useUser();

    const [updateMoneyAccount, setUpdateMoneyAccount] = useState(true);


    const isGold = (title == "Altın")

    const [goldItems, setGoldItems] = useState([
        { id: 1, goldType: "", quantity: "", price: "", buyingDateTime: dayjs() },
    ]);

    // Multiple stock items
    const [stockItems, setStockItems] = useState([
        { id: 1, stock: null, quantity: "", price: "", buyingDateTime: dayjs() },
    ]);

    const [sellInvestmentList, setSellInvestmentList] = useState([
        { key: 1, id: 1, assetName: "", quantity: 0, sellCount: 0, transactionId: 0, unitPrice: 0, totalPrice: 0, currentPrice: 0, buyingDateTime: dayjs(), salesPrice: 0 }
    ])

    const totalInvestmentValue = useMemo(() => {
        return sellInvestmentList.reduce((start, cur) => (cur.salesPrice * cur.sellCount) + start, 0);
    }, [sellInvestmentList]);


    useEffect(() => {
        if (updateMoneyAccount) {
            getMoneyAccountOfPerson();
            setUpdateMoneyAccount(false);
        }
        const getExchangeRates = async () => {
            const exchangeRates2 = await exchangeRates();
            setExchangeRate(exchangeRates2)
        }
        getExchangeRates();
    }, [updateMoneyAccount])

    const showMoneytoLocalString = (money) => {
        return money.toLocaleString("tr-TR", { minimumFractionDigits: 2, })
    }


    const getMoneyAccountOfPerson = async () => {


        const response = await axios.get(
            `${backendUrl}/api/accounts/me`,
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json",
                },
            }
        )

        const responseMoneyAccount = await axios.get(
            `${backendUrl}/api/accounts/get-money-accounts?userId=${response.data}`,
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json",
                },
            }
        )

        setMoneyAccountPersons(responseMoneyAccount.data);
    }



    const getTotalPriceBySellingItems = async (selectedAccount) => {

        let totalPrice = sellInvestmentList.reduce((start, cur) => (cur.salesPrice * cur.sellCount) + start, 0);

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



    const sellInvestment = async () => {
        // console.log("Satılacaklar Bunlar: " + JSON.stringify(sellInvestmentList, 4, 4))

        const selectedAccount = await getAccountDetailInfo();

        const nowTime = new Date().toISOString()
        //TRANSFER APILACAK 
        const transferPayload = {
            type: "incoming",
            account: { id: parseInt(selectedAccount.id) },
            user: { id: user.id },
            inputPreviousBalance: selectedAccount.balance,
            inputNextBalance: selectedAccount.balance + await getTotalPriceBySellingItems(selectedAccount),
            exchangeRate: selectedAccount.currency === "TRY" ? 1 : selectedAccount.currency === "USD" ? (await exchangeRates()).USD.Selling : (await exchangeRates()).EUR.Selling,
            date: nowTime,
            description: "Altın/Hisse satım işlemi sırasında bu hesaba para girişi sağlanmıştır",
            createDate: nowTime,
            category: "Satım İşlemi",
            amount: await getTotalPriceBySellingItems(selectedAccount),
        };

        const updatedAccount = {
            ...selectedAccount,
            balance: selectedAccount.balance + await getTotalPriceBySellingItems(selectedAccount),
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

            await axios.put(
                `${backendUrl}/api/accounts/update-money-account`,
                updatedAccount,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                        "Content-Type": "application/json",
                    },
                }
            );
        }
        catch (err) {
            console.error("Transfer hatası:", err);
            setError("Bir hata oluştu, lütfen tekrar deneyin.");
        }
        await sellTransaction(sellInvestmentList).unwrap();

        setUpdateMoneyAccount(true);
        closeSellInvestmentDialog();
    }

    //Altın, Hisse Değişince Gerekli İşlemler Yapılır
    const setTransactionId = (transactionId, id) => {

        //GOLD
        if (item[0].assetType === "GOLD") {
            const itemData = item.find((data) => data.transactionId === transactionId)


            const updatedData = sellInvestmentList.map((data) => {
                if (data.id === id) {
                    const goldPriceData = goldPrice.find((data) => data.Name.split("ALTIN")[0] === itemData.assetSymbol).Buying
                    return { ...data, transactionId: transactionId, quantity: itemData.quantity, assetName: itemData.assetName, sellCount: 0, unitPrice: itemData.purchasePrice, currentPrice: goldPriceData, totalPrice: 0, buyingDateTime: dayjs(itemData.buyingDateTime), salesPrice: goldPriceData }
                }
                return data
            })

            setSellInvestmentList(updatedData);
        }
        //STOCK
        else if (item[0].assetType === "STOCK") {
            const itemData = item.find((data) => data.transactionId === transactionId)

            const updatedData = sellInvestmentList.map((data) => {
                if (data.id === id) {
                    const stockPriceData = stockPrice.find((data) => data.symbol === itemData.assetSymbol).value
                    return { ...data, transactionId: transactionId, quantity: itemData.quantity, assetName: itemData.assetName, sellCount: 0, unitPrice: itemData.purchasePrice, salesPrice: stockPriceData, currentPrice: stockPriceData, totalPrice: 0, buyingDateTime: dayjs(itemData.buyingDateTime) }
                }
                return data
            })

            setSellInvestmentList(updatedData);
        }


    }

    const deleteInvestmentAccount = async () => {
        const deletingAccount = item[0].accountId;
        const response = await deleteAsset(deletingAccount);
        if (response.error) {
            console.error("Error deleting asset:", response.error);
            setError("Bir hata oluştu, lütfen tekrar deneyin.");
        }

    }

    const updateSoldData = (id, field, newValue) => {
        const updatedData = sellInvestmentList.map((item) => {
            if (item.id === id) {
                return { ...item, [field]: dayjs(newValue) };
            }
            return item;
        });
        setSellInvestmentList(updatedData);
    };

    const setSellCount = (value, id) => {
        if (item[0].assetType === "GOLD") {
            const sellingData = sellInvestmentList.find((data) => data.id === id);
            if (!sellingData)
                return null;
            if (value > sellingData.quantity)
                return null;

            const updatedData = sellInvestmentList.map((data) => {
                if (data.id === id) {
                    return { ...data, sellCount: parseFloat(value), totalPrice: data.salesPrice * value }
                }
                return data
            })

            setSellInvestmentList(updatedData)
        }
        else if (item[0].assetType === "STOCK") {
            const sellingData = sellInvestmentList.find((data) => data.id === id);
            if (!sellingData)
                return null;
            if (value > sellingData.quantity)
                return null;

            const updatedData = sellInvestmentList.map((data) => {
                if (data.id === id) {
                    return { ...data, sellCount: parseFloat(value), totalPrice: data.salesPrice * value }
                }
                return data
            })

            setSellInvestmentList(updatedData)
        }

    }


    const removeSellInvestment = (id) => {
        const newList = sellInvestmentList.filter((data) => data.id !== id);
        setSellInvestmentList(newList);
    }


    const addSellInvestment = () => {

        const sellInvestmentListTransactionIds = sellInvestmentList.map((data) => data.transactionId);
        const itemTransactionList = item.filter((data) => data.transactionId && data.assetName !== null);


        if (sellInvestmentListTransactionIds.length === itemTransactionList.length) {
            return;
        }

        const maxId = Math.max(...sellInvestmentList.map((data) => data.id));
        const newItem = { key: maxId + 1, id: maxId + 1, assetName: "", quantity: 0, sellCount: 0, transactionId: 0, unitPrice: 0, currentPrice: 0, totalPrice: 0, buyingDateTime: dayjs(), salesPrice: 0 };
        const updateList = [...sellInvestmentList, newItem];

        setSellInvestmentList(updateList)
    }

    const getTotalPrice = async (selectedAccount) => {

        let totalPrice;
        if (title === "Altın") {
            totalPrice = goldItems.reduce((start, cur) => (cur.price * cur.quantity) + start, 0);
        }
        else if (title === "Yatırım") {
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

    useEffect(() => {
        const getSellingHistory = async () => {
            const response = await axios.get(`${backendUrl}/api/asset/get-transaction-by-asset-id/${item[0].accountId}`, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined,
                    "Content-Type": "application/json",
                },
            });
            setSellingTransactions(response.data);
        }
        getSellingHistory();
    }, [item])


    const getSoldQuantity = async (transactionId) => {
        const response = await axios.get(`${backendUrl}/api/asset/get-selling-count?transactionId=${transactionId}`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }


    const addInvestment = async () => {

        const selectedAccount = await getAccountDetailInfo();

        const nowTime = new Date().toISOString()
        //TRANSFER APILACAK 
        const transferPayload = {
            type: "outgoing",
            account: { id: parseInt(selectedAccount.id) },
            user: { id: user.id },
            outputPreviousBalance: selectedAccount.balance,
            outputNextBalance: selectedAccount.balance - await getTotalPrice(selectedAccount),
            exchangeRate: selectedAccount.currency === "TRY" ? 1 : selectedAccount.currency === "USD" ? (await exchangeRates()).USD.Selling : (await exchangeRates()).EUR.Selling,
            date: nowTime, //Değişebilir çünkü transfer işlemi yapıldıktan sonra tarih atanacak, şu anlık işlem tarihi atıldı
            description: "Altın/Hisse alım sırasında bu hesaptan para çıkışı sağlanmıştır",
            createDate: nowTime,
            category: "Satın Alım",
            amount: await getTotalPrice(selectedAccount),
        };

        const updatedAccount = {
            ...selectedAccount,
            balance: selectedAccount.balance - await getTotalPrice(selectedAccount),
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

            await axios.put(
                `${backendUrl}/api/accounts/update-money-account`,
                updatedAccount,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                        "Content-Type": "application/json",
                    },
                }
            );
        }
        catch (err) {
            console.error("Transfer hatası:", err);
            setError("Bir hata oluştu, lütfen tekrar deneyin.");
        }



        const holdings = item[0].assetType === "GOLD"
            ? goldItems.map((goldItem) => {
                const goldTypeInfo = GOLD_TYPES.find(
                    (g) => g.value === goldItem.goldType
                )
                return {
                    assetId: item[0].accountId,
                    transactionType: "BUY",
                    assetSymbol: goldItem.goldType,
                    assetName: goldTypeInfo?.label || goldItem.goldType,
                    quantity: parseFloat(goldItem.quantity),
                    unitPrice: parseFloat(goldTypeInfo.Selling),
                    totalValue: parseFloat(goldItem.quantity) * parseFloat(goldTypeInfo.Selling),
                    currentValue: parseFloat(goldTypeInfo.Buying),
                    buyingDateTime: goldItem.buyingDateTime.toISOString()
                };
            })
            : stockItems.map((stockItem) => ({
                assetId: item[0].accountId,
                transactionType: "BUY",
                assetSymbol: stockItem.stock.symbol,
                assetName: stockItem.stock.name,
                quantity: parseFloat(stockItem.quantity),
                unitPrice: parseFloat(stockItem.price),
                totalValue: parseFloat(stockItem.quantity) * parseFloat(stockItem.price),
                currentValue: parseFloat(stockItem.stock.price),
                buyingDateTime: stockItem.buyingDateTime.toISOString()
            }));
        
        await addHolding(holdings).unwrap();
        setUpdateMoneyAccount(true);
        closeShowAddDialog();
    }


    const closeShowAddDialog = () => {
        setShowAddDialog(false);
        setGoldItems([{ id: 1, goldType: "", quantity: "", price: "", buyingDateTime: dayjs() },])
        setStockItems([{ id: 1, stock: "", quantity: "", price: "", buyingDateTime: dayjs() },])
        setSelectedMoneyAccount(0);
    }

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

    const updateSellDataPrice = (id, newPrice) => {
        setSellInvestmentList(prevList =>
            prevList.map(item =>
                item.id === id
                    ? {
                        ...item,
                        salesPrice: Number(newPrice),
                        totalPrice: Number(newPrice) * item.sellCount
                    }
                    : item
            )
        );

    };

    useEffect(() => {
        const validate = async () => {
            if (!selectedMoneyAccount || selectedMoneyAccount === "0") {
                setIsButtonDisabled(true);
                return;
            }

            try {
                const accountDetail = await getAccountDetailInfo();
                const pay = accountDetail.currency === "TRY"
                    ? accountDetail.balance
                    : accountDetail.balance * (exchangeRate[accountDetail.currency]?.Buying || 0);


                let totalPrice = 0;
                let fieldsValid = false;

                if (title === "Altın") {
                    totalPrice = goldItems.reduce((start, cur) => (cur.price * cur.quantity) + start, 0);


                    fieldsValid = goldItems.every((goldData) =>
                        goldData.goldType !== "" &&
                        goldData.price > 0 &&
                        goldData.quantity > 0
                    );

                }
                else if (title === "Yatırım") {
                    totalPrice = stockItems.reduce((start, cur) => (cur.price * cur.quantity) + start, 0);

                    fieldsValid = stockItems.every((stockData) =>
                        stockData.price !== "" &&
                        stockData.price !== 0 &&
                        stockData.quantity !== "" &&
                        stockData.quantity !== 0 &&
                        stockData.stock !== ""
                    )
                }

                setIsButtonDisabled((totalPrice > pay) || !fieldsValid);
            } catch (error) {
                console.error("Hesap detayı alınamadı", error);
                setIsButtonDisabled(true);
            }
        };

        validate();
    }, [selectedMoneyAccount, goldItems, stockItems, exchangeRate]);


    const openShowAddDialog = () => {
        setShowAddDialog(true);
    }

    const openSellInvestmentDialog = () => {
        setShowSellDialog(true);
    }

    const closeSellInvestmentDialog = () => {
        setShowSellDialog(false);
        setSelectedMoneyAccount(0);
        setSellInvestmentList([
            { key: 1, id: 1, assetName: "", quantity: 0, sellCount: 0, transactionId: 0, unitPrice: 0, totalPrice: 0, currentPrice: 0, salesPrice: 0, buyingDateTime: dayjs() }]
        )
    }

    const getTransactionsByAsset = async () => {

        //Altın Fiyatlarını Çekme İşlemi
        axios.get('https://finans.truncgil.com/v4/today.json')
            .then(response => {
                const goldPrices = (Object.entries(response.data).filter(([key]) => goldTypeKey.includes(key)).map(data => data[1]))
                setGoldPrice(goldPrices)
            })
            .catch(error => console.error(error));



        //Stock Fiyatlarını Çekme İşlemi
        const stockItem = []
        await Promise.all(
            STOCKS.map(async (stock) => {
                stockItem.push({ symbol: stock.symbol, value: await getStocksValueApi(stock.symbol) })
            })
        );

        setStockPrice(stockItem);
    }

    const [soldQuantity, setSoldQuantity] = useState(0)


    useEffect(() => {
        const fetchData = async () => {
            if (editingHolding) {
                const soldQuantity = await getSoldQuantity(editingHolding.transactionId);
                setSoldQuantity(soldQuantity);

            }
        };
        fetchData();
    }, [editDialogOpen]);

    const handleEditClick = (holding) => {
        setEditingHolding(holding);
        setEditQuantity(holding.quantity.toString());
        setEditPrice(holding.purchasePrice.toString());
        setEditDialogOpen(true);
    };

    const handleEditSave = async () => {
        try {
            // console.log(editingHolding);
            // console.log("purchase_price: " + parseFloat(editPrice))
            // console.log("quantity: " + parseFloat(editQuantity))
            // console.log(item.find(data => data.transactionId === editingHolding.transactionId))
            await updateAsset({
                ...editingHolding,
                transactionId: editingHolding.transactionId,
                updatedId: editingHolding.id,
                updatedQuantity: parseFloat(editQuantity),
                updatedPurchasePrice: parseFloat(editPrice),
            }).unwrap();        

            setEditDialogOpen(false);
        } catch (err) {
            console.error("Error updating holding:", err);
            setError("Güncelleme sırasında bir hata oluştu.");
        }
    };

    const handleDeleteClick = (holdingId) => {
        setDeletingHoldingId(holdingId);
        setDeleteDialogOpen(true);
    };


    const handleDeleteConfirm = async () => {
        try {
            const [assetResponse] = item.filter((data) => data.id === deletingHoldingId)
            await deleteTransaction({ ...assetResponse }).unwrap();
            if (item.length === 1) {

                await axios.delete(backendUrl + `/api/accounts/delete/${item[0].accountId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                    },
                });

            }

            setDeleteDialogOpen(false);
        } catch (err) {
            console.error("Error deleting holding:", err);
            setError("Silme sırasında bir hata oluştu.");
        }
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "₺0,00";
        return `₺${parseFloat(value).toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getHoldingDisplayName = (holding) => {
        // const isGold = (title == "Altın")
        if (isGold) {
            return GOLD_TYPES[holding.assetSymbol]?.label || holding.assetSymbol;
        }
        return `${holding.assetSymbol} - ${holding.assetName}`;
    };

    const getQuantityUnit = (holding) => {

        if (isGold) {
            return GOLD_TYPES[holding.assetSymbol]?.symbol || "adet";
        }
        return "adet";
    };

    const mainCardProfitLoss = item.reduce(
        (sum, v) => sum + (parseFloat(v.currentPrice) * parseFloat(v.quantity)) - (parseFloat(v.purchasePrice) * parseFloat(v.quantity)), 0
    );

    if (Object.keys(item).length === 0) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{title} Hesabı Bulunamadı</Alert>
            </Container>
        );
    }

    // const isGold = (title == "Altın")
    const themeColor = isGold ? "#d4af37" : "#4caf50";
    const bgColor = isDarkMode
        ? (isGold ? "rgba(212, 175, 55, 0.15)" : "rgba(76, 175, 80, 0.15)")
        : (isGold ? "#fef9e7" : "#e8f5e9");



    const totalValue = item.reduce(
        (sum, currentValue) => sum + parseFloat(currentValue.quantity * currentValue.currentPrice || 0),
        0);

    const totalProfitLoss = item.reduce(
        (sum, currentValue) => sum + parseFloat(currentValue.purchasePrice - currentValue.currentPrice || 0),
        0);







    return (

        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
                {/* <IconButton onClick={() => navigate("/account")} sx={{ p: 1 }}>
          <ArrowBackIcon />
        </IconButton> */}
                <Box sx={{ flexDirection: 1 }}>

                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {item[0].accountName}
                    </Typography>

                    <Chip
                        icon={isGold ? <ViewInArIcon /> : <ShowChartIcon />}
                        label={isGold ? "Altın Hesabı" : "Hisse Hesabı"}
                        size="small"
                        sx={{
                            mt: 0.5,
                            bgcolor: bgColor,
                            color: themeColor,
                            fontWeight: 500,
                        }}
                    />
                </Box>

            </Box>






            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}





            {/* Summary Card */}
            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: `2px solid ${themeColor}`,
                    bgcolor: bgColor,
                }}
            >
                <CardContent>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Toplam Değer
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{ fontWeight: 700, color: themeColor }}
                            >
                                {formatCurrency(totalValue)}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                            <Typography variant="body2" color="text.secondary">
                                Kar/Zarar
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                {mainCardProfitLoss >= 0 ? (
                                    <TrendingUpIcon sx={{ color: "#4caf50" }} />
                                ) : (
                                    <TrendingDownIcon sx={{ color: "#f44336" }} />
                                )}
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: mainCardProfitLoss >= 0 ? "#4caf50" : "#f44336",
                                    }}
                                >
                                    {totalProfitLoss >= 0 ? "+" : ""}
                                    {formatCurrency(mainCardProfitLoss)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            {item.length} farklı {isGold ? "altın türü" : "hisse senedi"}
                        </Typography>

                        <Stack sx={{ display: "flex", flexDirection: "row", marginX: "5px" }}>
                            <Tooltip title="Hesabı Kaldır">
                                <IconButton
                                    size="small"
                                    onClick={() => deleteInvestmentAccount()}
                                    sx={{ color: "#f44336", marginX: "5px" }}
                                >
                                    <MdDeleteForever fontSize="large" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Satın Al">
                                <IconButton
                                    size="small"
                                    onClick={() => openShowAddDialog()}
                                    sx={{ color: "green", marginX: "5px" }}
                                >
                                    <FaPlus fontSize="large" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Sat">
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={item.every((data) => data.assetSymbol === null)}
                                    onClick={() => openSellInvestmentDialog()}
                                    sx={{ marginX: "5px" }}
                                >
                                    <GiSellCard fontSize="small" />
                                </IconButton>
                            </Tooltip>


                        </Stack>

                    </Box>
                    <Box sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                        justifyContent: 'space-around'
                    }}>
                        {[
                            {
                                label: "Satılanların Toplam Maliyet",
                                value: sellingTransactions.reduce((acc, tx) => acc + (tx.quantity * tx.unitPrice), 0),
                                color: 'text.secondary'
                            },
                            {
                                label: "Satıların Toplam Satış Bedeli",
                                value: sellingTransactions.reduce((acc, tx) => acc + (tx.quantity * tx.sellingPrice), 0),
                                color: 'primary.main'
                            },
                            {
                                label: "Satılanların Net Kâr/Zarar",
                                value: sellingTransactions.reduce((acc, tx) => acc + ((tx.quantity * tx.sellingPrice) - (tx.quantity * tx.unitPrice)), 0),
                                isProfit: true // Özel renklendirme için
                            }
                        ].map((item, index) => {
                            const isProfitValue = item.isProfit ? item.value >= 0 : null;

                            return (
                                <Box key={index} sx={{
                                    textAlign: 'right',
                                    px: 2,
                                    py: 1,
                                    borderRadius: '8px',
                                    backgroundColor: 'action.hover',
                                    minWidth: '120px'
                                }}>
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: '500', color: 'text.disabled', textTransform: 'uppercase' }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="body1" sx={{
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace',
                                        color: item.isProfit
                                            ? (isProfitValue ? 'success.main' : 'error.main')
                                            : (item.color || 'text.primary')
                                    }}>
                                        {item.isProfit && (isProfitValue ? '+' : '')}
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.value)}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>

                </CardContent>
            </Card>





            {/* Holdings List */}
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{ px: 3, pt: 2, pb: 1, fontWeight: 600 }}
                    >
                        {isGold ? "Altın Varlıkları" : "Hisse Senetleri"}
                    </Typography>
                    <Divider />
                    <List sx={{ p: 0, }}>
                        {item.map((holding, index) => (
                            holding.assetSymbol &&
                            <React.Fragment key={holding.id}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        "&:hover": { bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "grey.50" },
                                        display: "grid", gridTemplateRows: "1fr", gridTemplateColumns: "0.2fr 1fr 1fr", placeItems: "revert-layer"
                                    }}
                                    secondaryAction={
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Tooltip title="Item'ı Düzenle">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditClick(holding)}
                                                    sx={{ color: "primary.main" }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Yanlışlıkla Alınan Item'ı Sil">
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => handleDeleteClick(holding.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>

                                            </Tooltip>
                                        </Box>
                                    }
                                >
                                    <ListItemIcon>
                                        {isGold ? (
                                            <ViewInArIcon sx={{ color: themeColor, fontSize: 32, mt: "1vh" }} />
                                        ) : (
                                            <Chip
                                                label={holding.assetSymbol}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    bgcolor: themeColor,
                                                    color: "white",
                                                    mt: "1vh"
                                                }}
                                            />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}>
                                                {getHoldingDisplayName(holding)}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1 }}>
                                                {/* Miktar Satırı */}
                                                <Typography variant="body2" sx={{ color: "text.secondary", display: "flex", alignItems: "baseline", gap: 0.5 }}>
                                                    Miktar:
                                                    <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                        {parseFloat(holding.quantity).toLocaleString("tr-TR")} {getQuantityUnit(holding)}
                                                    </Box>
                                                </Typography>

                                                {/* Fiyatlar Satırı */}
                                                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                        Maliyet: <Box component="span" sx={{ fontWeight: 600 }}>{formatCurrency(holding.purchasePrice)}</Box>
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                        Anlık: <Box component="span" sx={{ fontWeight: 600, color: "info.main" }}>{formatCurrency(holding.currentPrice)}</Box>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        }
                                    />

                                    <Box sx={{ textAlign: "center", minWidth: "fit-content", ml: 2 }}>
                                        {/* Toplam Değer */}
                                        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}>
                                            {formatCurrency(holding.quantity * holding.currentPrice)}
                                        </Typography>

                                        {/* Maliyet Tutarı */}
                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
                                            Maliyet: {formatCurrency(holding.quantity * holding.purchasePrice)}
                                        </Typography>

                                        {/* Kar/Zarar Rozeti */}
                                        {(() => {
                                            const profit = (holding.currentPrice * holding.quantity) - (holding.purchasePrice * holding.quantity);
                                            const isProfit = profit >= 0;

                                            return (
                                                <Box
                                                    sx={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: "6px",
                                                        backgroundColor: isProfit ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
                                                        color: isProfit ? "#2e7d32" : "#d32f2f",
                                                        fontWeight: 700,
                                                        fontSize: "0.75rem",
                                                        border: `1px solid ${isProfit ? "#4caf50" : "#f44336"}`
                                                    }}
                                                >
                                                    {isProfit ? "▲" : "▼"} {isProfit ? "Kâr" : "Zarar"} {formatCurrency(Math.abs(profit))}
                                                </Box>
                                            );
                                        })()}
                                    </Box>

                                </ListItem>
                                {index < item.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>


            {/* Add Investment*/}
            {/* */}

            <Dialog onClose={closeShowAddDialog} open={showAddDialog}>
                {item[0].assetType === "GOLD" ? <BuyInvestmentGold goldItems={goldItems} setGoldItems={setGoldItems} setSelectedMoneyAccount={setSelectedMoneyAccount} selectedMoneyAccount={selectedMoneyAccount}></BuyInvestmentGold> :
                    item[0].assetType === "STOCK" ? <BuyInvestmentStock stockItems={stockItems} setStockItems={setStockItems} setSelectedMoneyAccount={setSelectedMoneyAccount} selectedMoneyAccount={selectedMoneyAccount} ></BuyInvestmentStock> : ""}
                <DialogActions>
                    <Button onClick={closeShowAddDialog} sx={{ color: "red", ":hover": { color: "black" } }}>Kapat</Button>
                    <Button type="button" sx={{ color: "green" }} onClick={addInvestment} disabled={isButtonDisabled}>
                        {/* <Button type="button" sx={{ color: "green" }} onClick={addInvestment} disabled={item[0].assetType === "GOLD" ? checkItemsGold() : checkItemsStock()}> */}
                        Satın Al
                    </Button>
                </DialogActions>
            </Dialog>

            {/* {<BuyInvestment isGold={isGold} showAddDialog={showAddDialog} setShowAddDialog={setShowAddDialog}></BuyInvestment>} */}

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                disableScrollLock
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {editingHolding && getHoldingDisplayName(editingHolding)} Düzenle
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Satılan Miktar"
                            type="number"
                            fullWidth
                            disabled={true}
                            value={soldQuantity}
                        />
                        <TextField
                            label="Miktar"
                            type="number"
                            fullWidth
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(Math.abs(e.target.value))}
                            InputProps={{
                                endAdornment: editingHolding && (
                                    <InputAdornment position="end">
                                        {getQuantityUnit(editingHolding)}
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Birim Fiyat"
                            type="number"
                            fullWidth
                            value={editPrice}
                            onChange={(e) => setEditPrice(Math.abs(e.target.value))}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">₺</InputAdornment>
                                ),
                            }}
                        />
                        <Typography sx={{ color: "black", textAlign: "center", backgroundColor: "lightpink" }} component="p">
                            {soldQuantity - editQuantity > 0 ? "Daha önceden yapılan satış miktarı düzenlemek istediğiniz sayıyı geçmektedir." : ""}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
                    <Button
                        variant="contained"
                        onClick={handleEditSave}
                        disabled={soldQuantity - editQuantity > 0}
                        sx={{
                            background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
                        }}
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                disableScrollLock
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Silmeyi Onayla</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bu yatırımı silmek istediğinizden emin misiniz? Bu işlem geri
                        alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteConfirm}
                    >
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>


            {/*Sell Investment */}
            <Dialog
                open={showSellDialog}
                onClose={closeSellInvestmentDialog}
                onTransitionEnter={getTransactionsByAsset}
                fullWidth={true}
                maxWidth="sm"
            >
                <DialogTitle sx={{ p: 0, overflow: "hidden" }}>
                    <Box sx={{ backgroundColor: "#fdfbf0", borderBottom: "1px solid #e0e0e0" }}>
                        <Marquee
                            gradient={false}
                            speed={40}
                            style={{ padding: "10px 0" }}
                        >
                            {goldPrice.map((goldPriceItem, index) => (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", marginRight: "50px" }}>
                                    <Typography sx={{ color: "#5d4037", fontSize: "13px", fontWeight: "600" }}>
                                        {goldPriceItem.Name.split("ALTIN")[0]}
                                    </Typography>
                                    <Typography sx={{ color: "#d32f2f", fontSize: "13px", fontWeight: "bold", ml: 1 }}>
                                        {goldPriceItem.Buying.toLocaleString()} ₺
                                    </Typography>
                                </Box>
                            ))}
                        </Marquee>
                    </Box>

                    <Box sx={{ backgroundColor: "#fdfbf0", borderBottom: "1px solid #e0e0e0", mt: "15px" }}>
                        <Marquee
                            gradient={false}
                            speed={40}
                            style={{ padding: "10px 0" }}
                        >
                            {stockPrice.map((stockPriceItem, index) => (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", marginRight: "50px" }}>
                                    <Typography sx={{ color: "#5d4037", fontSize: "13px", fontWeight: "600" }}>
                                        {stockPriceItem.symbol}
                                    </Typography>
                                    <Typography sx={{ color: "#d32f2f", fontSize: "13px", fontWeight: "bold", ml: 1 }}>
                                        {stockPriceItem.value.toLocaleString()} ₺
                                    </Typography>
                                </Box>
                            ))}
                        </Marquee>
                    </Box>


                    <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: "bold",
                                color: "#1a237e",
                                letterSpacing: "0.5px"
                            }}
                        >
                            Varlık Satış İşlemi
                        </Typography>
                        <Typography
                            sx={{
                                color: "#616161",
                                fontSize: "15px",
                                mt: 1,
                                fontStyle: "italic"
                            }}
                        >
                            Hangi <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{isGold ? "Altın" : "Hisse"}</span> Varlıklarınızı Satmak İstiyorsunuz?
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent
                    sx={{ overflowX: "auto" }}>
                    {sellInvestmentList.length > 0 ? (
                        sellInvestmentList.map((sellData, index) => (

                            <Box
                                key={index}
                                sx={{
                                    background: "#fff",
                                    border: "1px solid #eef0f2",
                                    borderRadius: "16px",
                                    minWidth: "100%",
                                    padding: "24px",
                                    marginY: "24px",
                                    boxShadow: "0px 10px 20px rgba(0,0,0,0.04)",
                                    position: "relative",
                                    transition: "transform 0.2s",
                                    "&:hover": { transform: "translateY(-2px)" }
                                }}
                            >
                                {/* Üst Bilgi ve Aksiyonlar */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            px: 1.5, py: 0.5,
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: "bold",
                                            color: "#757575",
                                            textTransform: "uppercase"
                                        }}
                                    >
                                        #İşlem Seçimi {index + 1}
                                    </Typography>

                                    <Box>
                                        <Tooltip title="Ekle">
                                            <IconButton onClick={() => addSellInvestment()} sx={{ color: "#2e7d32", backgroundColor: "#e8f5e9", mr: 1, "&:hover": { backgroundColor: "#c8e6c9" } }}>
                                                <FaPlus size={14} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Kaldır">
                                            <IconButton onClick={() => removeSellInvestment(sellData.id)} sx={{ color: "#d32f2f", backgroundColor: "#ffebee", "&:hover": { backgroundColor: "#ffcdd2" } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                {/* Seçim Alanı */}
                                <Box sx={{ mb: 2 }}>
                                    <InputLabel sx={{ fontSize: "13px", fontWeight: "600", mb: 0.5, color: "#444" }}>
                                        {isGold ? "Altın Türü" : "Hisse Senedi"}
                                    </InputLabel>
                                    <Select
                                        value={sellData.transactionId || ""}
                                        onChange={(e) => setTransactionId(e.target.value, sellData.id)}
                                        fullWidth
                                        size="small"
                                        sx={{ borderRadius: "8px", backgroundColor: "#fafafa" }}
                                    >
                                        <MenuItem value=""><em>Seçiniz...</em></MenuItem>
                                        {item.map((data) => {
                                            const isSelected = sellInvestmentList.some(s => s.transactionId === data.transactionId);
                                            const isThisRow = sellData.transactionId === data.transactionId;
                                            if ((!isSelected || isThisRow) && data.assetName) {
                                                return (
                                                    <MenuItem key={data.transactionId} value={data.transactionId}>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                            <span>{data.assetName}</span>
                                                            <span style={{ color: "#757575", fontSize: "0.8rem" }}>Maliyet: {data.purchasePrice}₺</span>
                                                        </Box>
                                                    </MenuItem>
                                                );
                                            }
                                            return null;
                                        })}
                                    </Select>
                                </Box>

                                {/* Miktar Girişi */}
                                <TextField
                                    label="Satış Miktarı"
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={sellData.sellCount || 0}
                                    onChange={(e) => setSellCount(e.target.value, sellData.id)}
                                    inputProps={{ min: 0, max: sellData.quantity }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" sx={{ fontSize: "12px" }}>{sellData.assetName?.includes("Gram") ? "Gr" : "Adet"}</InputAdornment>,
                                    }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                                />
                                <TextField
                                    label="Birim Satış Fiyatı"
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={sellData.salesPrice || 0}
                                    onChange={(e) => updateSellDataPrice(sellData.id, e.target.value)}
                                    inputProps={{ min: 0, max: sellData.quantity }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start" sx={{ fontSize: "12px" }}>{"₺"/*sellData.assetName?.includes("Gram") ? "Gr" : "" */}</InputAdornment>,
                                    }}
                                    sx={{ my: 2, "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                                />
                                <Box>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Tarih Seç"
                                            value={sellData.buyingDateTime || null}
                                            onChange={(newValue) => updateSoldData(sellData.id, "buyingDateTime", newValue)}
                                            disableFuture={true}
                                            slotProps={{
                                                textField: { fullWidth: true },

                                            }}
                                        />
                                    </LocalizationProvider>

                                </Box>

                                {/* Uyarı ve Özet Bölümü */}
                                <Box sx={{ mt: 2 }}>
                                    <Typography
                                        sx={{
                                            color: "#c62828",
                                            backgroundColor: "#fff5f5",
                                            p: 1.5,
                                            borderRadius: "10px",
                                            fontSize: "0.75rem",
                                            border: "1px dashed #ffcdd2",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1
                                        }}
                                    >
                                        ⚠️ Maksimum <strong>{sellData.quantity}</strong> {item[0].assetType === "STOCK" ? "adet" : "adet/gr"} satabilirsiniz.
                                    </Typography>

                                    {sellData.totalPrice > 0 && (
                                        <Box
                                            sx={{
                                                mt: 1.5,
                                                p: 2,
                                                background: "linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)",
                                                borderRadius: "10px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                border: "1px solid #fff59d"
                                            }}
                                        >
                                            <Typography sx={{ color: "#5d4037", fontWeight: "600", fontSize: "0.85rem" }}>Tahmini Tahsilat:</Typography>
                                            <Typography sx={{ color: "#2e7d32", fontWeight: "800", fontSize: "1.1rem" }}>
                                                {sellData.totalPrice.toLocaleString()} ₺
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: "center", color: "#999", my: 4 }}>Henüz bir yatırım seçilmedi.</Typography>
                    )}
                    {sellInvestmentList.reduce((sum, cur) => sum + cur.totalPrice, 0) > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 2,
                                p: 2,
                                borderRadius: "12px",
                                background: "linear-gradient(90deg, #fff9c4 0%, #fff176 100%)",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
                                border: "1px solid #fbc02d",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#5f4339",
                                    fontWeight: "600",
                                    fontSize: "0.95rem"
                                }}
                            >
                                Toplam Satış Bedeli:
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#d32f2f",
                                    fontWeight: "bold",
                                    fontSize: "1.1rem"
                                }}
                            >

                                {sellInvestmentList.reduce((sum, cur) => sum + cur.totalPrice, 0).toLocaleString()} ₺
                            </Typography>

                            {moneyAccountPersons.length === 0 ?
                                <Typography
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1.5,
                                        p: 2,
                                        my: 2,
                                        border: "1px solid",
                                        borderColor: 'error.light',
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        color: "error.main",
                                        bgcolor: "#fff5f5",
                                        fontWeight: '500',
                                        fontSize: '0.95rem',
                                        boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)',
                                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                    }}
                                >

                                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                    Lütfen öncelikle bir banka/para hesabı ekleyiniz. Aksi halde işleme devam edilemeyecektir.
                                </Typography>
                                :
                                <FormControl component="fieldset" sx={{ width: '100%' }}>
                                    <FormLabel id="selectMoneyAccount" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                                        Banka Hesap Seçimi
                                    </FormLabel>
                                    <RadioGroup
                                        aria-labelledby="selectMoneyAccount"
                                        name="radio-buttons-group"
                                        value={selectedMoneyAccount || ""}
                                        onChange={(e) => setSelectedMoneyAccount(e.target.value)}
                                    >
                                        {moneyAccountPersons.map((data) => {
                                            const isSelected = selectedMoneyAccount === String(data.id);

                                            return (
                                                <FormControlLabel
                                                    key={data.id}
                                                    value={data.id}
                                                    control={<Radio sx={{ display: 'none' }} />}
                                                    sx={{
                                                        margin: '0.5rem 0',
                                                        width: '100%',
                                                        border: '2px solid',
                                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                                        borderRadius: '12px',
                                                        padding: '12px 16px',
                                                        transition: 'all 0.2s ease',
                                                        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
                                                        '&:hover': {
                                                            borderColor: 'primary.light',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                                        },

                                                        '& .MuiFormControlLabel-label': {
                                                            width: '100%',
                                                            fontFamily: 'monospace',
                                                            whiteSpace: 'pre-wrap',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '4px'
                                                        }
                                                    }}
                                                    label={
                                                        <>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                                    {data.accountName.toUpperCase()}
                                                                </Typography>
                                                                <Typography sx={{
                                                                    color: 'success.main',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '0.9rem',
                                                                    bgcolor: '#e8f5e9',
                                                                    px: 1, borderRadius: 1
                                                                }}>
                                                                    {/* {isInsufficient ? "Yetersiz Bakiye" : "Bakiye Uygun"} */}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, opacity: 0.8 }}>
                                                                <span>Tür: {data.currency}</span>
                                                                <span>Bakiye: {showMoneytoLocalString(data.balance)} {data.currency === "TRY" ? "₺" : data.currency === "EUR" ? "€" : "$"}</span>
                                                            </Box>

                                                            {data.currency !== "TRY" && (
                                                                <Box>
                                                                    <Box sx={{ textAlign: 'right', mt: 0.5, fontStyle: 'italic', fontSize: '0.8rem' }}>
                                                                        TL Karşılığı: {showMoneytoLocalString(data.balance * (exchangeRate[data.currency]?.Buying || 0))} ₺
                                                                    </Box>
                                                                    <Box sx={{ textAlign: 'right', mt: 0.5, fontStyle: 'italic', fontSize: '0.8rem' }}>
                                                                        Kur: {data.currency === "TRY" ? CURRENCIES[0].exchangeRates : data.currency === "USD" ? CURRENCIES[1].exchangeRates : CURRENCIES[2].exchangeRates} ₺
                                                                    </Box>


                                                                </Box>
                                                            )}
                                                            {<Box sx={{ textAlign: 'right', mt: 0.5, fontStyle: 'italic', fontSize: '0.8rem' }}>
                                                                İşlem Sonu Bakiye: {showMoneytoLocalString((totalInvestmentValue) / (data.currency === "TRY" ? CURRENCIES[0].exchangeRates : data.currency === "USD" ? CURRENCIES[1].exchangeRates : CURRENCIES[2].exchangeRates) + data.balance)} {CURRENCIES.find((d) => d.value === data.currency)?.label.split(" ")[0]}
                                                            </Box>}
                                                        </>
                                                    }
                                                />
                                            );
                                        })}
                                    </RadioGroup>
                                </FormControl>}
                        </Box>
                    )}


                </DialogContent>

                <DialogActions sx={{ marginRight: "20px", marginBottom: "15px", gap: "10px" }}>
                    <Button
                        variant="contained"
                        onClick={() => sellInvestment()}
                        disabled={sellInvestmentList.some(s => s.sellCount <= 0 || !s.transactionId) || selectedMoneyAccount === 0}
                        sx={{
                            backgroundColor: "rgba(255, 0, 0, 0.08)",
                            color: "#d32f2f",
                            border: "1.5px solid #d32f2f",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            padding: "6px 20px",
                            boxShadow: "none",
                            textTransform: "none",
                            '&:hover': {
                                backgroundColor: "#d32f2f",
                                color: "white",
                                boxShadow: "0px 4px 10px rgba(211, 47, 47, 0.3)",
                                border: "1.5px solid #d32f2f",
                            }
                        }}
                    >
                        Sat
                    </Button>

                    <Button
                        variant="contained"
                        onClick={closeSellInvestmentDialog}
                        sx={{
                            backgroundColor: "rgba(0, 128, 0, 0.08)", // Hafif yeşil arka plan
                            color: "#2e7d32",
                            border: "1.5px solid #2e7d32",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            padding: "6px 20px",
                            boxShadow: "none",
                            textTransform: "none",
                            '&:hover': {
                                backgroundColor: "#2e7d32",
                                color: "white",
                                boxShadow: "0px 4px 10px rgba(46, 125, 50, 0.3)",
                                border: "1.5px solid #2e7d32",
                            }
                        }}
                    >
                        İptal
                    </Button>
                </DialogActions>


            </Dialog>
        </Container>
    )

}


export default InvestmentAccountDetailPageItem;