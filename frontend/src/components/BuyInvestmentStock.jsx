import { useState, useMemo, useEffect } from 'react'
import { FormControl, FormControlLabel, Radio, RadioGroup, FormLabel, Button, Box, Fade, TextField, Typography, List, ListItemButton, ListItem, ListItemText, Card, DialogContent, Dialog, DialogTitle, Chip, CardContent, IconButton, Paper, InputAdornment } from '@mui/material'
import { getStocksValue, STOCKS } from "../data/stocksData"
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "../config/ThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';
import Marquee from "react-fast-marquee";
import { exchangeRates } from '../data/currencies';
import { backendUrl } from '../utils/envVariables';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";


export const BuyInvestmentStock = ({ setStockItems, stockItems, setSelectedMoneyAccount, selectedMoneyAccount }) => {

    const { isDarkMode } = useTheme();
    const token = localStorage.getItem("token");
    const [stockSearch, setStockSearch] = useState("");


    const [activeStockItemId, setActiveStockItemId] = useState(null);
    const [stockDialogOpen, setStockDialogOpen] = useState(false);
    //Stock Price
    const [stockPrice, setStockPrice] = useState([])

    //BU
    // const [selectedMoneyAccount, setSelectedMoneyAccount] = useState(0)
    const [getPrices, setGetPrices] = useState(false)
    const [moneyAccountPersons, setMoneyAccountPersons] = useState([{}])
    const [exchangeRate, setExchangeRate] = useState({})



    //BU
    useEffect(() => {
        setGetPrices(true);
        getMoneyAccountOfPerson();
    }, [])


    //BU
    useEffect(() => {
        if (!getPrices) return;

        const updateAllPrices = async () => {
            const stockData = await getStocksValue();
            setStockPrice([...stockData]);
            setGetPrices(false);
        };
        updateAllPrices();
    }, [getPrices]);




    // Check if we can add more stocks
    const canAddMoreStocks = stockItems.length < STOCKS.length;



    const addStockItem = () => {
        const newId = Math.max(...stockItems.map((item) => item.id)) + 1;
        setStockItems([
            ...stockItems,
            { id: newId, stock: null, quantity: "", price: "", buyingDateTime: dayjs() },
        ]);
    };

    const updateStockItem = (id, field, value) => {
        console.log(`Updating stock item ${id}: setting ${field} to`, value);

        if (field === "price" || field === "quantity")
            value = value < 0 ? value * -1 : value;

        if (field === "price") {
            setStockItems(
                stockItems.map((item) =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            );
        }
        else {

            if (field === "buyingDateTime") {
                value = dayjs(value).format("YYYY-MM-DD");
            }

            setStockItems(
                stockItems.map((item) =>
                    item.id === id ? { ...item, [field]: value, price: typeof value === "object" ? stockPrice.find((s) => s.symbol === value.symbol).value : item.price } : item
                )
            );
        }

    };

    const removeStockItem = (id) => {
        if (stockItems.length > 1) {
            setStockItems(stockItems.filter((item) => item.id !== id));
        }
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

    const openStockDialog = (itemId) => {
        setActiveStockItemId(itemId);
        setStockDialogOpen(true);
    };

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


    const [userAssets, setUserAsset] = useState([]);
    const [isExitsAssets, setIsExitsAssets] = useState(0);

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

            const response2 = await axios.get(
                `${backendUrl}/api/asset/get-asset-size-by-user-id`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined,
                        "Content-Type": "application/json",
                    },
                })
            setIsExitsAssets(response2.data);
        }
        getUserAssets();

    }, [token])

    const handleStockSelect = (stock) => {
        if (activeStockItemId) {
            console.log(`Selected stock for item ${activeStockItemId}:`, stock);
            updateStockItem(activeStockItemId, "stock", stock);
        }
        setStockDialogOpen(false);
        setStockSearch("");
        setActiveStockItemId(null);
    };

    const showMoneytoLocalString = (money) => {
        return money.toLocaleString("tr-TR", { minimumFractionDigits: 2, })
    }


    const getMoneyAccountOfPerson = async () => {

        const exchangeRates2 = await exchangeRates();
        setExchangeRate(exchangeRates2)


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


    return (

        <Box sx={{ padding: "15px" }}>

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
                                {stockPriceItem ? stockPriceItem.value.toLocaleString() : 0} ₺
                            </Typography>
                        </Box>
                    ))}
                </Marquee>
            </Box>
            <Fade in={stockPrice.length > 0} unmountOnExit>


                <Box>
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
                                <Box sx={{ my: 3 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Tarih Seç"
                                            value={item.buyingDateTime}
                                            onChange={(newValue) => updateStockItem(item.id, "buyingDateTime", newValue)}
                                            disableFuture={true}

                                            slotProps={{
                                                textField: { fullWidth: true },

                                            }}

                                        />
                                    </LocalizationProvider>

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

                                    {userAssets.length === 0 && isExitsAssets === 0 ? "" : (userAssets.length !== 0 || (userAssets.length === 0 && isExitsAssets !== 0)) && moneyAccountPersons.length === 0 ?
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

                                        < FormControl component="fieldset" sx={{ width: '100%' }}>
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
                                                    const isInsufficient = data.currency !== "TRY"
                                                        ? (data.balance * (exchangeRate[data.currency]?.Buying || 0)) < calculateStockTotal()
                                                        : data.balance < calculateStockTotal();

                                                    // Seçili olanı kontrol et (Vurgulamak için)
                                                    const isSelected = selectedMoneyAccount === String(data.id);

                                                    return (
                                                        <FormControlLabel
                                                            key={data.id}
                                                            value={data.id}
                                                            control={<Radio sx={{ display: 'none' }} />} // Radyo butonunu gizleyip kartı buton yapıyoruz
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
                                                                // Label kısmını tüm genişliğe yay
                                                                '& .MuiFormControlLabel-label': {
                                                                    width: '100%',
                                                                    fontFamily: 'monospace',
                                                                    whiteSpace: 'pre-wrap', // Alt satıra geçebilmesi için
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
                                                                            color: isInsufficient ? 'error.main' : 'success.main',
                                                                            fontWeight: 'bold',
                                                                            fontSize: '0.9rem',
                                                                            bgcolor: isInsufficient ? '#ffebee' : '#e8f5e9',
                                                                            px: 1, borderRadius: 1
                                                                        }}>
                                                                            {isInsufficient ? "Yetersiz Bakiye" : "Bakiye Uygun"}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, opacity: 0.8 }}>
                                                                        <span>Tür: {data.currency}</span>
                                                                        <span>Bakiye: {showMoneytoLocalString(data.balance)} {data.currency === "TRY" ? "₺" : data.currency === "EUR" ? "€" : "$"}</span>
                                                                    </Box>

                                                                    {data.currency !== "TRY" && (
                                                                        <Box sx={{ textAlign: 'right', mt: 0.5, fontStyle: 'italic', fontSize: '0.8rem' }}>
                                                                            TL Karşılığı: {showMoneytoLocalString(data.balance * (exchangeRate[data.currency]?.Buying || 0))} ₺
                                                                        </Box>
                                                                    )}
                                                                </>
                                                            }
                                                        />
                                                    );
                                                })}
                                            </RadioGroup>
                                        </FormControl>}

                                </CardContent>
                            </Card>
                        )}
                    </Box>
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
                            component="div"
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
                </Box>
            </Fade >
        </Box >
    )
}
