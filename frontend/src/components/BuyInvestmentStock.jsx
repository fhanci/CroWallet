import React, { useState, useMemo, useEffect } from 'react'
import { Button, Box, Fade, TextField, Typography, List, ListItemButton, ListItem, ListItemText, Card, DialogContent, Dialog, DialogTitle, Chip, CardContent, IconButton, Paper, InputAdornment } from '@mui/material'
import { getStocksValue, STOCKS } from "../data/stocksData"
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "../config/ThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';
import Marquee from "react-fast-marquee";


export const BuyInvestmentStock = ({ setStockItems, stockItems }) => {

    const { isDarkMode } = useTheme();
    const [stockSearch, setStockSearch] = useState("");

    const [activeStockItemId, setActiveStockItemId] = useState(null);
    const [stockDialogOpen, setStockDialogOpen] = useState(false);
    //Stock Price
    const [stockPrice, setStockPrice] = useState([])

    useEffect(() => {
        const fetchStockPrices = () => {
            const stockItem = []
            STOCKS.map((stock) => {
                stockItem.push({ symbol: stock.symbol, value: stock.price })
            })
            setStockPrice(stockItem);
        };

        fetchStockPrices();
        console.log("Satın Alım İşlemi İçin Hisse Fiyatları Çekildi")
    }, [])

    // Check if we can add more stocks
    const canAddMoreStocks = stockItems.length < STOCKS.length;



    const addStockItem = () => {
        const newId = Math.max(...stockItems.map((item) => item.id)) + 1;
        setStockItems([
            ...stockItems,
            { id: newId, stock: null, quantity: "", price: "" },
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


    const handleStockSelect = (stock) => {
        if (activeStockItemId) {
            console.log(`Selected stock for item ${activeStockItemId}:`, stock);
            updateStockItem(activeStockItemId, "stock", stock);
        }
        setStockDialogOpen(false);
        setStockSearch("");
        setActiveStockItemId(null);
    };



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
            </Fade>
        </Box>
    )
}
