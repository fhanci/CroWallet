import React, { useEffect, useState } from 'react'
import { Button, Box, Fade, TextField, Typography, ToggleButtonGroup, Card, CardContent, IconButton, ToggleButton, Paper, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material'
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { GOLD_TYPES } from '../data/goldData';
import { STOCKS } from "../data/stocksData"
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "../config/ThemeContext";
import axios from 'axios';
import Marquee from "react-fast-marquee";


export const BuyInvestmentGold = ({ goldItems, setGoldItems }) => {

    const { isDarkMode } = useTheme();

    ////////////////////////////////////////////////// GOLD //////////////////////////////////////////////////

    // Check if we can add more gold types
    const canAddMoreGold = goldItems.length < GOLD_TYPES.length;
    const [goldPrice, setGoldPrice] = useState([])
    const goldTypeKey = ["GRA", "CEYREKALTIN", "YARIMALTIN", "TAMALTIN", "CUMHURIYETALTINI"]

    useEffect(() => {

        console.log(GOLD_TYPES.map((goldType) => ({ Name: `${goldType.value}ALTIN`, Buying: goldType.price })));
        setGoldPrice(GOLD_TYPES.map((goldType) => ({ Name: `${goldType.value}ALTIN`, Buying: goldType.price })))
        console.log("Satın Alım İşlemi İçin Altın Fiyatları Çekildi")
        // console.log(goldPrice)

        // axios.get('https://finans.truncgil.com/v4/today.json')
        //     .then(response => {
        //         const goldPrices = (Object.entries(response.data).filter(([key]) => goldTypeKey.includes(key)).map(data => data[1]))
        //         setGoldPrice(goldPrices)
        //     })
        //     .catch(error => console.error(error));
    }, [])

    // Get available gold types (exclude already selected)
    const getAvailableGoldTypes = (currentItemId) => {
        const selectedTypes = goldItems
            .filter((item) => item.id !== currentItemId && item.goldType)
            .map((item) => item.goldType);

        return GOLD_TYPES.filter((type) => !selectedTypes.includes(type.value));
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
        console.log(`Updating gold item ${id}: setting ${field} to ${value}`);
        if (field !== "price") {
            setGoldItems(
                goldItems.map((item) =>
                    item.id === id ? { ...item, [field]: value, price: ["GRAM", "CEYREK", "YARIM", "TAM", "CUMHURIYET"].includes(value) ? goldPrice.find((data) => data.Name.split("ALTIN")[0] === value).Buying : item.price } : item
                )
            );
        }
        else {
            setGoldItems(
                goldItems.map((item) =>
                    item.id === id ? { ...item, [field]: value } : item)
            )


        }
    };

    const calculateGoldTotal = () => {
        return goldItems.reduce((total, item) => {
            if (item.quantity && item.price) {
                return total + parseFloat(item.quantity) * parseFloat(item.price);
            }
            return total;
        }, 0);
    };

    ////////////////////////////////////////////////// STOCKS //////////////////////////////////////////////////




    return (
        <Box sx={{ padding: "15px" }}>
            {/* INVESTMENT ACCOUNT FORM */}
            {/*/////////////////////////////////////////////////////////////////////////////////////////////////*/}
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

            {/* GOLD FORM */}
            <Fade in={true} unmountOnExit>
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
            {/*/////////////////////////////////////////////////////////////////////////////////////////////////*/}
        </Box>
    )
}
