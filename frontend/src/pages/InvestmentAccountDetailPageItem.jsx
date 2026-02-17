import React, { useState, useEffect } from "react";
import { useUpdateHoldingMutation, useDeleteHoldingMutation } from "../api/holdingsApi";

// Gold types for display
const GOLD_TYPES = {
    GRAM: { label: "Gram Altın", symbol: "gr" },
    CEYREK: { label: "Çeyrek Altın", symbol: "adet" },
    YARIM: { label: "Yarım Altın", symbol: "adet" },
    TAM: { label: "Tam Altın", symbol: "adet" },
    CUMHURIYET: { label: "Cumhuriyet Altını", symbol: "adet" },
};

import {
    Container,
    Typography,
    Box,
    Stack,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
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
    Alert,
    DialogContentText,
    OutlinedInput,
    Select,
    MenuItem,
    FormControl,
    FormHelperText,
    InputLabel
} from "@mui/material";
import { FaPlus } from "react-icons/fa";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { useTheme } from "../config/ThemeContext";
import axios from "axios";
import { backendUrl } from "../utils/envVariables";

const InvestmentAccountDetailPageItem = ({ title, item }) => {

    console.log(`Ben Bir ${title} Hesabıyım. Itemlerım: ${JSON.stringify(item, 4, 4)}`);
    // const { t } = useTranslation();

    const { isDarkMode } = useTheme();
    const token = localStorage.getItem("token");
    const [error, setError] = useState("");

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingHolding, setEditingHolding] = useState(null);
    const [editQuantity, setEditQuantity] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);

    //       // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingHoldingId, setDeletingHoldingId] = useState(null);

    //Update
    const [updateHolding] = useUpdateHoldingMutation()

    //Delete
    const [deleteHolding, { isLoading }] = useDeleteHoldingMutation();

    const isGold = (title == "Altın")




    //Add Investment
    // const [goldList, setGoldList] = useState([]);
    // const [selectedGold, setSelectedGold] = useState(-1);
    // const [goldId, setGoldId] = useState(0);


    // useEffect(() => {
    //     console.log("Aha Burda: " + selectedGold);
    //     console.log("Gold List Burda: " + JSON.stringify(goldList, 4, 4))
    // }, [selectedGold])

    // const handleAddShowDialog = () => {

    // }

    const openShowAddDialog = () => {
        setShowAddDialog(true);
        // setSelectedGold(-1);
        // setGoldList([{
        //     id: goldId,
        //     goldTpye: "",
        //     goldQuantity: 0,
        //     goldPrice: 0,
        // }])
        // setGoldId(() => goldId + 1);
    }

    // const closeShowAddDialog = () => {
    //     setShowAddDialog(false);
    // }

    // const getPrice = (item) => {
    //     return item.goldQuantity * item.goldPrice;
    // }

    // const getTotalPrice = () => {
    //     return goldList.reduce(((sum, item) => sum + (item.goldQuantity * item.goldPrice)), 0)
    // }

    // const addGold = () => {
    //     const data = {
    //         id: goldId,
    //         goldTpye: "",
    //         goldQuantity: 0,
    //         goldPrice: 0
    //     }
    //     setGoldList(
    //         [...goldList, data]
    //     );

    //     console.log("Tüm Data");
    //     console.log(JSON.stringify(goldList, 4, 4))
    //     setGoldId(() => goldId + 1)
    // }

    // const removeGold = (item) => {
    //     console.log("İtem Burda" + JSON.stringify(item, 4, 4))
    //     const newList = goldList.filter((goldItem) => goldItem.id !== item.id)
    //     console.log("Item: " + newList)
    //     setGoldList(
    //         [...newList]
    //     )
    // }

    // const updateGoldItem = (id, field, value) => {

    //     setGoldList(
    //         goldList.map((item) =>
    //             item.id === id ? { ...item, [field]: value } : item
    //         )
    //     );
    // }


    const handleEditClick = (holding) => {
        setEditingHolding(holding);
        setEditQuantity(holding.quantity.toString());
        setEditPrice(holding.purchasePrice.toString());
        setEditDialogOpen(true);
    };

    const handleEditSave = async () => {
        try {
            console.log("Editlicez")
            console.log(editingHolding);
            console.log("purchase_price: " + parseFloat(editPrice))
            console.log("quantity: " + parseFloat(editQuantity))
            await updateHolding({
                id: editingHolding.id,
                quantity: parseFloat(editQuantity),
                purchasePrice: parseFloat(editPrice),
            }).unwrap();
            console.log("Güncellendi");
            // window.location.reload();

            setEditDialogOpen(false);
            // fetchAccountData();
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

            console.log("Silinecek ID: " + deletingHoldingId)
            await deleteHolding(deletingHoldingId).unwrap();
            console.log("Kişi Başarıyla Silindi");
            console.log("İtem Uzunluğu: " + item.length);
            console.log(item);

            console.log("Key Değeri Burda Ya: " + 1)
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
                <Box sx={{ flex: 1 }}>
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

                        <IconButton
                            size="small"
                            onClick={() => openShowAddDialog()}
                            sx={{ color: "green" }}
                        >
                            <FaPlus fontSize="large" />
                        </IconButton>
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
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditClick(holding)}
                                                sx={{ color: "primary.main" }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(holding.id)}
                                                sx={{ color: "error.main" }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
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
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {getHoldingDisplayName(holding)}
                                            </Typography>
                                        }
                                        secondary={

                                            <Typography component={"div"} variant="body2" color="text.secondary">

                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        mt: 0.5,
                                                        flexWrap: "wrap",

                                                    }}
                                                >
                                                    <Typography component={"span"} variant="body2">
                                                        Miktar:{" "}
                                                        <strong>
                                                            {parseFloat(holding.quantity).toLocaleString("tr-TR")}{" "}
                                                            {getQuantityUnit(holding)}
                                                        </strong>
                                                    </Typography>
                                                    <Typography component={"span"} variant="body2" color="text.secondary" sx={{
                                                        display: "flex",
                                                        gap: "5px"
                                                    }}>
                                                        Maliyet Fiyat:{" "}
                                                        <strong>{formatCurrency(holding.purchasePrice)}</strong>

                                                        Anlık Fiyat:{" "}
                                                        <strong>{formatCurrency(holding.currentPrice)}</strong>
                                                    </Typography>


                                                </Box>

                                            </Typography>


                                        }
                                    />
                                    <Box sx={{ textAlign: "left", mr: "10%", }}>
                                        <Typography sx={{ fontWeight: 600, color: themeColor }}>
                                            Toplam Değer: {formatCurrency(holding.quantity * holding.currentPrice)}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 600, color: themeColor }}>
                                            Maliyet Tutarı: {formatCurrency(holding.quantity * holding.purchasePrice)}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color:
                                                    parseFloat(holding.profitLoss) >= 0
                                                        ? "#4caf50"
                                                        : "#f44336",
                                            }}
                                        >
                                            {parseFloat(holding.profitLoss) >= 0 ? "+ Kar " : "- Zarar "}
                                            {formatCurrency((holding.currentPrice * holding.quantity) - (holding.purchasePrice * holding.quantity))}
                                        </Typography>
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
                {/* <Dialog open={showAddDialog} onClose={closeShowAddDialog} sx={{ height: "100%" }}>
                    <DialogTitle>{isGold ? "Altın Ekleme Yap" : "Hisse Ekleme Yap"}</DialogTitle>
                    {goldList.map((item, index) => {

                        console.log("AAAAA");
                        console.log(item)
                        return <DialogContent key={index} sx={{height:"100%", overflow:"clip    "}}>
                            <form onSubmit={handleAddShowDialog} id="addGold-form">
                                <Stack>
                                    <Box>
                                        <FormControl sx={{ width: "100%", marginTop: "10px" }}>
                                            <InputLabel id="gold-label">Altın Türleri</InputLabel>
                                            <Select
                                                labelId="gold-label"
                                                id="gold-select"
                                                value={item.goldType}
                                                onChange={(e) => updateGoldItem(item.id, "goldTpye", (e.target.value))}
                                                label="Altın Türleri"
                                            >
                                                <MenuItem value={-1}></MenuItem>
                                                {Object.keys(GOLD_TYPES).map((gold, idx) => {

                                                    return <MenuItem value={idx}>
                                                        <ViewInArIcon sx={{ fontSize: 20, color: "#d4af37", marginRight: "15px   " }} />
                                                        {GOLD_TYPES[gold].label} </MenuItem>
                                                })
                                                }
                                            </Select>
                                        </FormControl>

                                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                            <FormControl sx={{ width: "45%", marginTop: "10px" }}>
                                                <InputLabel id="gold-label">Miktar</InputLabel>
                                                <OutlinedInput
                                                    id="alim-adedi"
                                                    type="number"
                                                    endAdornment={<InputAdornment position="end">{item.goldTpye === 0 ? "gr" : "adet"}</InputAdornment>}
                                                    label="Miktar"
                                                    value={item.goldQuantity}
                                                    onChange={(e) => updateGoldItem(item.id, "goldQuantity", parseFloat(e.target.value))}

                                                />
                                            </FormControl>


                                            <FormControl sx={{ width: "45%", marginTop: "10px" }}>
                                                <InputLabel id="birim-label">Birim Fiyatı</InputLabel>
                                                <OutlinedInput
                                                    id="birim-adet"
                                                    type="number"
                                                    value={item.goldPrice}
                                                    onChange={(e) => updateGoldItem(item.id, "goldPrice", parseFloat(e.target.value))}
                                                    endAdornment={<InputAdornment position="end">₺</InputAdornment>}
                                                    label="Birim Fiyatı"
                                                />
                                            </FormControl>

                                        </Box>
                                        <Box sx={{ display: getPrice(item) <= 0 ? "none" : "flex", flexDirection: "row", justifyContent: "space-between", fontWeight: 600, color: "white", backgroundColor: "#d4af37", borderRadius: "7px", my: "10px" }}>
                                            <Typography variant="body2" sx={{ my: "10px", mx: "10px" }}>
                                                Değer:
                                            </Typography>
                                            <Typography variant="body2" sx={{ my: "10px", mx: "10px" }}>
                                                ₺{getPrice(item).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignContent: "space-evenly" }}>
                                        <Button variant="contained" sx={{
                                            width: "45%", my: "10px", border: "1px dashed #d4af37", background: "none",
                                            color: "#d4af37", ":hover": { background: "#efede6ff" }
                                        }} onClick={addGold}>Altın Ekle</Button>

                                        <Button variant="contained" sx={{
                                            width: "45%", my: "10px", border: "1px dashed #ff0000ff", background: "none",
                                            color: "#cc2525ff", ":hover": { background: "#efede6ff" }
                                        }} onClick={() => removeGold(item)}>Altını Kaldır</Button>
                                    </Box>
                                </Stack>

                            </form>
                            <Divider sx={{mt:"3px", }}></Divider>
                        </DialogContent>
                        
                    })}
                    <Box sx={{ display: getTotalPrice <= 0 ? "none" : "flex", flexDirection: "row", justifyContent: "space-between", fontWeight: 600, color: "white", backgroundColor: "#24ac3fff", borderRadius: "7px", my: "10px", margin:"10px 10px"}}>
                        <Typography variant="body2" sx={{ my: "10px", mx: "10px" }}>
                            Toplam Tutar:
                        </Typography>
                        <Typography variant="body2" sx={{ my: "10px", mx: "10px" }}>
                            ₺{getTotalPrice().toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                    <DialogActions>
                        <Button onClick={closeShowAddDialog} sx={{ color: "red" }}>İptal Et</Button>
                        <Button type="submit" form="subscription-form" sx={{ color: "green" }}>
                            Onayla
                        </Button>
                    </DialogActions>
                </Dialog> */}





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
                            label="Miktar"
                            type="number"
                            fullWidth
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
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
                            onChange={(e) => setEditPrice(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">₺</InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
                    <Button
                        variant="contained"
                        onClick={handleEditSave}
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
        </Container>
    )

}


export default InvestmentAccountDetailPageItem;