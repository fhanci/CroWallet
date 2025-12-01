import { useState, useEffect, useRef } from "react";
import { 
  Box, 
  Fab, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

// Sub-menu Icons
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import FolderIcon from "@mui/icons-material/Folder";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

// Sage Green Color
const MENU_COLOR = "#AEC9B8";
const ICON_COLOR = "#FFFFFF";

const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(2);
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Refs for menu anchors
  const investmentRef = useRef(null);
  const accountsRef = useRef(null);
  const debtRef = useRef(null);
  const transferRef = useRef(null);

  // Determine active route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/investment")) setActiveIndex(0);
    else if (path.includes("/accounts") || path === "/account/create") setActiveIndex(1);
    else if (path === "/account" || path === "/") setActiveIndex(2);
    else if (path.includes("/debt")) setActiveIndex(3);
    else if (path.includes("/transfer")) setActiveIndex(4);
  }, [location]);

  // Open Menu with ref
  const handleMenuOpen = (ref, menuId) => {
    setAnchorEl(ref.current);
    setActiveMenu(menuId);
  };

  // Close Menu
  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  const handleMenuItemClick = (path, index) => {
    navigate(path);
    setActiveIndex(index);
    handleMenuClose();
  };

  const handleHomeClick = () => {
    setActiveIndex(2);
    navigate("/account");
    handleMenuClose();
  };

  const renderMenu = () => {
    let items = [];
    
    switch (activeMenu) {
      case "investment":
        items = [
          { label: "Hisse Hesaplarım", path: "/investment/stocks", icon: <ShowChartIcon fontSize="small" /> },
          { label: "Altın Hesaplarım", path: "/investment/gold", icon: <ViewInArIcon fontSize="small" /> }
        ];
        break;
      case "accounts":
        items = [
          { label: "Hesaplarım", path: "/accounts/my", icon: <FolderIcon fontSize="small" /> },
          { label: "Hesap Ekle", path: "/account/create", icon: <AddIcon fontSize="small" /> }
        ];
        break;
      case "debt":
        items = [
          { label: "Borçlar", path: "/debt", icon: <CreditCardIcon fontSize="small" /> },
          { label: "Borç Ekle", path: "/debt/create", icon: <AddIcon fontSize="small" /> },
          { label: "Taksitler", path: "/debt/installments", icon: <ListAltIcon fontSize="small" /> }
        ];
        break;
      case "transfer":
        items = [
          { label: "Gelir Ekle", path: "/transfer/incoming", icon: <AddIcon fontSize="small" color="success" /> },
          { label: "Gider Ekle", path: "/transfer/outgoing", icon: <RemoveIcon fontSize="small" color="error" /> },
          { label: "Transfer Yap", path: "/transfer/accounts", icon: <SwapHorizIcon fontSize="small" color="action" /> }
        ];
        break;
      default:
        return null;
    }

    const contextMenuBgColor = "rgba(174, 201, 184, 0.85)"; 

    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        disableScrollLock={true}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        MenuListProps={{ 
          onMouseLeave: handleMenuClose,
          sx: { py: 0.5 }
        }} 
        slotProps={{
          paper: {
            elevation: 8, 
            sx: {
              mt: -1,
              borderRadius: "16px", 
              minWidth: "180px",
              bgcolor: contextMenuBgColor, 
              backdropFilter: "blur(12px)",
              border: `1px solid rgba(255, 255, 255, 0.4)`, 
              boxShadow: "0px -8px 24px rgba(0, 0, 0, 0.15)", 
              overflow: "visible",
              "& .MuiList-root": {
                padding: "4px",
              },
              "& .MuiMenuItem-root": {
                fontSize: "0.9rem",
                fontWeight: 600, 
                borderRadius: "12px", 
                margin: "4px",
                padding: "10px 16px",
                color: "#2c3e32", 
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.5)",
                  color: "#1a2e22",
                },
              },
            }
          }
        }}
      >
        {items.map((item, idx) => (
          <MenuItem key={idx} onClick={() => handleMenuItemClick(item.path, activeIndex)}>
            {item.icon && (
              <ListItemIcon sx={{ minWidth: "34px !important", color: "inherit" }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }} />
          </MenuItem>
        ))}
      </Menu>
    );
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "95px",
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
      >
        <svg
          viewBox="0 0 375 95" 
          preserveAspectRatio="none"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            filter: "drop-shadow(0px -6px 16px rgba(0,0,0,0.15))", 
          }}
        >
          <path
            d="M0,40 
               L135,40 
               C155,40 160,83 187.5,83 
               C215,83 220,40 240,40 
               L375,40 
               L375,115 L0,115 Z"
            fill={MENU_COLOR}
          />
        </svg>

        {/* LEFT ICONS */}
        <Box
          sx={{
            position: "absolute",
            top: "40px", 
            left: 0,
            width: "35%",
            height: "55px",
            display: "flex",
            justifyContent: "space-around", 
            alignItems: "center", 
          }}
        >
          {/* Yatırım */}
          <Box
            ref={investmentRef}
            onMouseEnter={() => { setActiveIndex(0); handleMenuOpen(investmentRef, "investment"); }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            <TrendingUpIcon
              sx={{
                color: ICON_COLOR,
                fontSize: "26px",
                opacity: activeIndex === 0 ? 1 : 0.75,
                transform: activeIndex === 0 ? "scale(1.1)" : "scale(1)",
                transition: "all 0.3s",
              }}
            />
            <Typography sx={{ color: ICON_COLOR, fontSize: "0.7rem", fontWeight: 600, mt: 0.3, opacity: activeIndex === 0 ? 1 : 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              YATIRIM
            </Typography>
          </Box>

          {/* Hesaplar */}
          <Box
            ref={accountsRef}
            onMouseEnter={() => { setActiveIndex(1); handleMenuOpen(accountsRef, "accounts"); }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            <AccountBalanceIcon
              sx={{
                color: ICON_COLOR,
                fontSize: "26px",
                opacity: activeIndex === 1 ? 1 : 0.75,
                transform: activeIndex === 1 ? "scale(1.1)" : "scale(1)",
                transition: "all 0.3s",
              }}
            />
            <Typography sx={{ color: ICON_COLOR, fontSize: "0.7rem", fontWeight: 600, mt: 0.3, opacity: activeIndex === 1 ? 1 : 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              HESAPLAR
            </Typography>
          </Box>
        </Box>

        {/* CENTER FLOATING HOME BUTTON */}
        <Box
          sx={{
            position: "absolute",
            top: "0px", 
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1201,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Fab
            onClick={handleHomeClick}
            sx={{
              bgcolor: MENU_COLOR,
              color: ICON_COLOR,
              width: "60px", 
              height: "60px", 
              boxShadow: "0px 4px 12px rgba(174, 201, 184, 0.8)",
              "&:hover": { bgcolor: "#8aa395" }, 
              border: "4px solid white",
            }}
          >
            <HomeIcon sx={{ fontSize: "28px" }} />
          </Fab>
        </Box>

        {/* RIGHT ICONS */}
        <Box
          sx={{
            position: "absolute",
            top: "40px", 
            right: 0,
            width: "35%",
            height: "55px",
            display: "flex",
            justifyContent: "space-around", 
            alignItems: "center", 
          }}
        >
          {/* Borçlar */}
          <Box
            ref={debtRef}
            onMouseEnter={() => { setActiveIndex(3); handleMenuOpen(debtRef, "debt"); }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            <AccountBalanceWalletIcon
              sx={{
                color: ICON_COLOR,
                fontSize: "26px",
                opacity: activeIndex === 3 ? 1 : 0.75,
                transform: activeIndex === 3 ? "scale(1.1)" : "scale(1)",
                transition: "all 0.3s",
              }}
            />
            <Typography sx={{ color: ICON_COLOR, fontSize: "0.7rem", fontWeight: 600, mt: 0.3, opacity: activeIndex === 3 ? 1 : 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              BORÇLAR
            </Typography>
          </Box>

          {/* Transfer */}
          <Box
            ref={transferRef}
            onMouseEnter={() => { setActiveIndex(4); handleMenuOpen(transferRef, "transfer"); }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "all 0.3s",
              "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
            }}
          >
            <SwapHorizIcon
              sx={{
                color: ICON_COLOR,
                fontSize: "28px",
                opacity: activeIndex === 4 ? 1 : 0.75,
                transform: activeIndex === 4 ? "scale(1.1)" : "scale(1)",
                transition: "all 0.3s",
              }}
            />
            <Typography sx={{ color: ICON_COLOR, fontSize: "0.7rem", fontWeight: 600, mt: 0.3, opacity: activeIndex === 4 ? 1 : 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              TRANSFER
            </Typography>
          </Box>
        </Box>
      </Box>
      {renderMenu()}
    </Box>
  );
};

export default MenuPage;
