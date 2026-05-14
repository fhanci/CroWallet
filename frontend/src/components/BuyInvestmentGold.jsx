import { useEffect, useState } from 'react'
import { Button, Box, Fade, TextField, Typography, FormLabel, RadioGroup, FormControlLabel, Radio, Card, CardContent, IconButton, Paper, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material'
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import { getGoldCurrentValue, GOLD_TYPES } from '../data/goldData';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "../config/ThemeContext";
import axios from 'axios';
import Marquee from "react-fast-marquee";
import { backendUrl } from '../utils/envVariables';
import { CURRENCIES, exchangeRates, getExchangeRateByPastDate } from '../data/currencies';
import dayjs from "dayjs";
import { formatDateTime } from '../utils/localIsoTime';



export const BuyInvestmentGold = ({ goldItems, setGoldItems, setSelectedMoneyAccount, selectedMoneyAccount }) => {

    const { isDarkMode } = useTheme();

    ////////////////////////////////////////////////// GOLD //////////////////////////////////////////////////

    // Check if we can add more gold types
    const canAddMoreGold = goldItems.length < GOLD_TYPES.length;
    const [goldPrice, setGoldPrice] = useState([])
    // const goldTypeKey = ["GRA", "CEYREKALTIN", "YARIMALTIN", "TAMALTIN", "CUMHURIYETALTINI"]
    const token = localStorage.getItem("token");

    const [moneyAccountPersons, setMoneyAccountPersons] = useState([{}])
    const [exchangeRate, setExchangeRate] = useState({})

    //BU
    const [getPrices, setGetPrices] = useState(false)

    const [selectedMoneyAccountDetail, setSelectedMoneyAccountDetail] = useState({})
    const [previousMoneyAccountDetail, setPreviousMoneyAccountDetail] = useState({})

    //BU
    useEffect(() => {
        setGetPrices(true);
    }, [])

    //BU
    useEffect(() => {
        if (!getPrices) return;

        const updateAllPrices = async () => {
            const goldData = await getGoldCurrentValue();
            setGoldPrice([...goldData]);
            setGetPrices(false);
        };
        updateAllPrices();
    }, [getPrices]);

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
            { id: newId, goldType: "", quantity: "", price: "", buyingDateTime: dayjs(), exchangeRate: 1 },
        ]);
        setChangeExchangeRate(true);
    };

    const removeGoldItem = (id) => {
        if (goldItems.length > 1) {
            setGoldItems(goldItems.filter((item) => item.id !== id));
        }
    };

    useEffect(() => {
        const accountId = parseFloat(selectedMoneyAccount);
        if (accountId !== 0) {
            const account = moneyAccountPersons.find((acc) => acc.id === accountId);
            if (account) {
                setPreviousMoneyAccountDetail(selectedMoneyAccountDetail);
                setSelectedMoneyAccountDetail(account);
            }
            else {
                setSelectedMoneyAccountDetail({});
            }
        }
    }, [selectedMoneyAccount]);

    useEffect(() => {
        const currentAccountExchangeRate = CURRENCIES.find((cur) => cur.value === selectedMoneyAccountDetail.currency)?.exchangeRates;
        const previousAccountExchangeRate = CURRENCIES.find((cur) => cur.value === previousMoneyAccountDetail.currency)?.exchangeRates || 1;
        setGoldItems(goldItems.map((item) => {
            if (item.price) {
                const price = item.price * previousAccountExchangeRate; //TL Dönüşümü
                const newPrice = Math.round((price / currentAccountExchangeRate) * 100) / 100;
                
                return { ...item, price: newPrice };
            }
            return item;
        }));
    }, [selectedMoneyAccountDetail]);


    const [changeExchangeRate, setChangeExchangeRate] = useState(false);

    useEffect(() => {
        const getExchangeRate = async () => {
            const rates = await Promise.all(goldItems.map(async item => {
                const response = await getExchangeRateByPastDate(
                    selectedMoneyAccountDetail.currency || "TRY",
                    item.buyingDateTime.format("YYYY-MM-DD"),
                    "TRY"
                );
                
                if (response === undefined || response.length === 0) {
                    return 1;
                }
                return response.rate;
            }));

            
            
            setGoldItems(
                goldItems.map((item, index) => ({
                    ...item,
                    exchangeRate: String(rates[index])
                }))
            )
        };

        if (changeExchangeRate) {
            getExchangeRate();
            setChangeExchangeRate(false);
        }
    }, [goldItems, selectedMoneyAccount])


    useEffect(() => {
        setChangeExchangeRate(true);
    },[selectedMoneyAccount])


    const updateGoldItem = (id, field, value) => {
        

        if (field === "price" || field === "quantity")
            value = value < 0 ? value * -1 : value;


        //Tarih
        if (field === "buyingDateTime" || field === "quantity") {
            setChangeExchangeRate(true);
            value = field === "buyingDateTime" ? dayjs(value) : value;
            setGoldItems(
                goldItems.map((item) =>
                    item.id === id ? { ...item, [field]: value, } : item
                )
            );
        }

        else if (field === "goldType") {
            const exchangeRate = CURRENCIES.find((cur) => cur.value === selectedMoneyAccountDetail.currency)?.exchangeRates;
            const currentGoldPrice = ["GRAM", "CEYREK", "YARIM", "TAM", "CUMHURIYET"].includes(value) ? goldPrice.find((data) => data.Name.split("ALTIN")[0] === value).Selling : item.price
            const price = Math.round((exchangeRate ? currentGoldPrice / exchangeRate : currentGoldPrice) * 100) / 100;
            setGoldItems(
                goldItems.map((item) =>
                    item.id === id ? { ...item, [field]: value, price: price } : item
                )
            );

        }
        else if (field === "price") {


            setGoldItems(
                goldItems.map((item) =>
                    item.id === id ? { ...item, [field]: value } : item)
            )


        }


        else if (field === "exchangeRate") {
            setGoldItems(
                goldItems.map((item) =>
                    item.id === id ? { ...item, [field]: value } : item)
            )
        }
    };

    const calculateGoldTotal = (totalAccount) => {

        if (totalAccount) {
            return goldItems.reduce((total, item) => {
                if (item.quantity && item.price) {
                    return total + parseFloat(item.quantity) * parseFloat(item.price);
                }
                return total;
            }, 0);

        }

        const rate = exchangeRate[selectedMoneyAccountDetail.currency]?.Buying || 1;
        return goldItems.reduce((total, item) => {
            if (item.quantity && item.price) {
                return total + parseFloat(item.quantity) * parseFloat(item.price) * rate;
            }
            return total;
        }, 0);
    };


    const showMoneytoLocalString = (money) => {
        return money.toLocaleString("tr-TR", { minimumFractionDigits: 2, })
    }


    useEffect(() => {
        getMoneyAccountOfPerson();
    }, [])

    useEffect(() => {
    }, [goldItems])

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
                                {goldPriceItem.Selling.toLocaleString()} ₺
                            </Typography>
                        </Box>
                    ))}
                </Marquee>
            </Box>

            {/* GOLD FORM */}
            <Fade in={true} unmountOnExit>
                <Box>
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
                                    const isInsufficient = data.currency !== "TRY"
                                        ? (data.balance * (exchangeRate[data.currency]?.Buying || 0)) < calculateGoldTotal()
                                        : data.balance < calculateGoldTotal();

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
                                                            {data.accountName?.toUpperCase() || ""}
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
                                                        <span>Bakiye: {showMoneytoLocalString(data.balance || 0)} {data.currency === "TRY" ? "₺" : data.currency === "EUR" ? "€" : "$"}</span>
                                                    </Box>

                                                </>
                                            }
                                        />
                                    );
                                })}
                            </RadioGroup>
                        </FormControl>}
                    {/* Gold Items */}
                    {isExitsAssets > 0 && selectedMoneyAccount === 0 ? <Typography
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
                        Lütfen öncelikle bir banka/para hesabı seçiniz. Aksi halde işleme devam edilemeyecektir.
                    </Typography> : goldItems.map((item, index) => (

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
                                            <InputAdornment position="start">{CURRENCIES.find((c) => c.value === selectedMoneyAccountDetail.currency)?.symbol || "₺"}</InputAdornment>
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


                                <TextField
                                    label={"Tarih Seç"}
                                    type="datetime-local"
                                    inputProps={{ step: 1 }}
                                    fullWidth
                                    value={formatDateTime(item.buyingDateTime)}
                                    onChange={(e) => updateGoldItem(item.id, "buyingDateTime", e.target.value)}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    label={"Kur Bilgisi"}
                                    type="number"
                                    fullWidth
                                    value={(item.exchangeRate || 1).toLocaleString("tr-TR")}
                                    onChange={(e) => updateGoldItem(item.id, "exchangeRate", e.target.value)}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
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
                                        {(selectedMoneyAccountDetail.currency || "₺") + " "}
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
                            <CardContent sx={{
                                py: 1.5,
                                "&:last-child": { pb: 1.5 },
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem"
                            }}>
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
                                        {(selectedMoneyAccountDetail.currency || "₺") + " "}
                                        {calculateGoldTotal(1).toLocaleString("tr-TR", {
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
