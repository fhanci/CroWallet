import React from "react";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
// Sub-menu Icons
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Button,Box} from "@mui/material";
import { Link } from "react-router-dom";



function TransferPage(){
    return (
        <Box sx={{
            display:"flex",
            justifyContent:"center",
            position:"fixed",
            bottom:"15%",
            left:"50%",
            transform:"translateX(-50%)"
        }}>
            <Button component={Link} to="incoming"><AddIcon/>Gelir Ekle</Button>
            <Button component={Link} to="outgoing"><RemoveIcon></RemoveIcon>Gider Ekle</Button>
            <Button component={Link} to="accounts"><SwapHorizIcon/>Transfer Yap</Button>
        </Box>
    )
}


export default TransferPage