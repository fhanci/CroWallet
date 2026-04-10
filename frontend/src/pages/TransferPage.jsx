import React from "react";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
// Sub-menu Icons
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import AllTransactionsPage from "../components/AllTransactionsPage";

function TransferPage() {
    return (
        <Box>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                margin: "16px"
            }}>
                <Button component={Link} to="incoming" sx={{ color: "green" }}><AddIcon />Gelir Ekle</Button>
                <Button component={Link} to="outgoing" sx={{ color: "red" }}><RemoveIcon></RemoveIcon>Gider Ekle</Button>
                <Button component={Link} to="accounts" sx={{ color: "#e5e515" }}><SwapHorizIcon />Transfer Yap</Button>
            </Box>
            <AllTransactionsPage />


        </Box>


    )
}


export default TransferPage