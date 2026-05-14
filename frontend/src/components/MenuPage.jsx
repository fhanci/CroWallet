import { useState, useEffect, useRef } from "react";
import {
  Box,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button
} from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";


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


  const [responsiveIconSize, setResponsiveIconSize] = useState({ xs: "2em", sm: "2em", md: "2em", lg: "2em", xl: "2em" });

  const [responsiveFontSizeIsSelected, setResponsiveFontSizeIsSelected] = useState({ xs: "0.65em", sm: "0.80em", md: "0.80em", lg: "0.80em", xl: "0.80  em" });

  const [responsiveFontSizeIsNotSelected, setResponsiveFontSizeIsNotSelected] = useState({ xs: "0.60em", sm: "0.75em", md: "0.75em", lg: "0.75em", xl: "0.75em" });


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

  

    const contextMenuBgColor = "rgba(174, 201, 184, 0.85)";


    return (
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        disableScrollLock={true}
        anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
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
                margin: "10px",
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
            bottom: "0px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            transform: "translate(-8%, 10%)",
            width: "50%",
          }}
        >
          {/* Yatırım */}

          <Box
            ref={investmentRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "hover 0.3s",
              marginLeft: "3px",
            }}
          >

            <Button component={Link} to="/investment/stock_and_gold" onClick={() => { setActiveIndex(0); }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: ICON_COLOR,
                border: "none",
                outline: "none",
                "&:hover": { boxShadow: "none", outline: "none" },
                fontWeight: 600,
                alignItems: "center",
                justifyContent: "center",
              }}>
              <TrendingUpIcon
                sx={{
                  color: ICON_COLOR,
                  fontSize: responsiveIconSize,
                  opacity: activeIndex === 0 ? 1 : 0.75,
                  transform: activeIndex === 0 ? "scale(1.15)" : "scale(1)",
                  transition: "transform 1.5s",
                }}
              />


              <Typography sx={{
                color: ICON_COLOR,
                fontSize: activeIndex === 0 ? responsiveFontSizeIsSelected : responsiveFontSizeIsNotSelected,
                transition: "font-size 1.5s",
                fontWeight: "inherit",
                opacity: activeIndex === 0 ? 1 : 0.75,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                YATIRIM
              </Typography>
            </Button>
          </Box>

          {/* Hesaplar */}
          <Box
            ref={accountsRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "hover 0.3s",

            }}
          >

            <Button component={Link} to="/accounts/my" onClick={() => { setActiveIndex(1); }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: ICON_COLOR,
                border: "none",
                outline: "none",
                "&:hover": { boxShadow: "none", outline: "none" },
                fontWeight: 600,
                alignItems: "center",
                justifyContent: "center",
                marginRight: "50%",
              }}>
              <AccountBalanceIcon
                sx={{
                  color: ICON_COLOR,
                  border: "none",
                  fontSize: responsiveIconSize,
                  opacity: activeIndex === 1 ? 1 : 0.5,
                  transform: activeIndex === 1 ? "scale(1.15)" : "scale(1)",
                  transition: "transform 1.5s",
                }}
              />

              <Box sx={{
                color: ICON_COLOR,
                fontSize: activeIndex === 1 ? responsiveFontSizeIsSelected : responsiveFontSizeIsNotSelected,
                transition: "font-size 1.5s",
                fontWeight: "inherit",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Hesaplar
              </Box>

            </Button>
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
            bottom: "0px",
            right: "0px",
            display: "flex",
            transform: "translate(15%, 8%)",
            justifyContent: "space-around",
            width: "55%",


          }}
        >
          {/* Borçlar */}
          <Box
            ref={debtRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "hover 0.3s",

            }}
          >

            <Button component={Link} to="/debt" onClick={() => { setActiveIndex(3); }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: ICON_COLOR,
                border: "none",
                outline: "none",
                "&:hover": { boxShadow: "none", outline: "none" },
                fontWeight: 600,
                alignItems: "center",
                justifyContent: "center",
              }}>
              <AccountBalanceWalletIcon
                sx={{
                  color: ICON_COLOR,
                  fontSize: responsiveIconSize,
                  opacity: activeIndex === 3 ? 1 : 0.5,
                  transform: activeIndex === 3 ? "scale(1.15)" : "scale(1)",
                  transition: "transform 1.5s",
                }}
              />

              <Box sx={{
                color: ICON_COLOR,
                fontSize: activeIndex === 3 ? responsiveFontSizeIsSelected : responsiveFontSizeIsNotSelected,
                transition: "font-size 1.5s",
                fontWeight: "inherit",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Borçlar
              </Box>
            </Button>
          </Box>


          {/* Transfer */}
          <Box
            ref={transferRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 12px",
              borderRadius: "12px",
              transition: "hover 0.3s",
              transform: "translateX(-15%)",
              marginRight:"3px",
            }}
          >

            <Button component={Link} to="/transfer" onClick={() => { setActiveIndex(4); }}
              sx={{
                display: "flex",
                flexDirection: "column",
                color: ICON_COLOR,
                border: "none",
                outline: "none",
                "&:hover": { boxShadow: "none", outline: "none" },
                fontWeight: 600,
                alignItems: "center",
                justifyContent: "center",
                marginRight:"15%",
              }}>
              <SwapHorizIcon
                sx={{
                  color: ICON_COLOR,
                  fontSize: responsiveIconSize,
                  opacity: activeIndex === 4 ? 1 : 0.75,
                  transform: activeIndex === 4 ? "scale(1.15)" : "scale(1)",
                  transition: "transform 1.5s",
                }}
              />
              <Box sx={{
                color: ICON_COLOR,
                fontSize: activeIndex === 4 ? responsiveFontSizeIsSelected : responsiveFontSizeIsNotSelected,
                transition: "font-size 1.5s",
                fontWeight: "inherit",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                TRANSFER
              </Box>
            </Button>


          </Box>
        </Box>
      </Box>
      {renderMenu()}
    </Box>
  );
};

export default MenuPage;
