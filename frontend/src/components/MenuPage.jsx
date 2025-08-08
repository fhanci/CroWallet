import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HomeIcon from "@mui/icons-material/Home";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SettingsIcon from "@mui/icons-material/Settings";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import RemoveIcon from "@mui/icons-material/Remove";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import NotificationButton from "./NotificationButton";
import ProfileButton from "./ProfileButton";
import { useTranslation } from "react-i18next";

const MenuPage = ({ isDrawerOpen, setIsDrawerOpen }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [transferMenuOpen, setTransferMenuOpen] = React.useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const [debtMenuOpen, setDebtMenuOpen] = React.useState(false);
  const token = localStorage.getItem("token");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleHome = () => {
    navigate("/account");
  };

  // ✅ Güncellenmiş çıkış işlemi:
  const handleLogout = () => {
    localStorage.clear(); // Tüm kullanıcı verilerini sil
    navigate("/login"); // Login sayfasına yönlendir
    // window.location.reload(); // Sayfa tamamen sıfırlansın
  };

  const itemStyle = {
    cursor: "pointer",
    backgroundColor: "rgba(230, 240, 230)",
  };

  return (
    <Box sx={{ display: "flex" }}>
      {isMobile && (
        <IconButton
          onClick={() => setIsDrawerOpen(true)}
          sx={{ position: "absolute", top: 10, left: 10, zIndex: 1300 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        anchor="left"
        open={isMobile ? isDrawerOpen : true}
        onClose={() => setIsDrawerOpen(false)}
        sx={{ width: 240, flexShrink: 0, "& .MuiDrawer-paper": { width: 240 } }}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(230, 240, 230)",
            maxHeight: "100vh",
            padding: "8px",
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", padding: "8px" }}>
          <img
            src="/images/CroWallet2.png"
            alt="Wallet"
            style={{ width: "45px", objectFit: "contain" }}
          />
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Roboto Slab", serif',
              fontWeight: "900",
              letterSpacing: "2px",
              color: "#000",
              marginLeft: "12px",
              marginTop: "-8px",
            }}
          >
            CroWallet
          </Typography>
        </Box>

        {isMobile && isDrawerOpen && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              px: 2,
              pb: 1,
            }}
          >
            <NotificationButton
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              isInsideDrawer
            />
            <ProfileButton
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              isInsideDrawer
            />
          </Box>
        )}

        <List>
          <ListItem
            component="button"
            onClick={() => {
              handleHome();
              setIsDrawerOpen(false);
            }}
            sx={itemStyle}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={t("home")} />
          </ListItem>

          <ListItem
            component="button"
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            sx={itemStyle}
          >
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary={t("accountOperations")} />
            {accountMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={accountMenuOpen} timeout="auto" unmountOnExit>
            <List sx={{ pl: 4 }}>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/account/create");
                  setIsDrawerOpen(false);
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={t("addAccount")} />
              </ListItem>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/account/edit");
                  setIsDrawerOpen(false);
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary={t("editAccount")} />
              </ListItem>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/account/delete");
                  setIsDrawerOpen(false);
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <DeleteIcon />
                </ListItemIcon>
                <ListItemText primary={t("deleteAccount")} />
              </ListItem>
            </List>
          </Collapse>

          <ListItem
            component="button"
            onClick={() => setTransferMenuOpen(!transferMenuOpen)}
            sx={itemStyle}
          >
            <ListItemIcon>
              <SyncAltIcon />
            </ListItemIcon>
            <ListItemText primary={t("transfer")} />
            {transferMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={transferMenuOpen} timeout="auto" unmountOnExit>
            <List sx={{ pl: 4 }}>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/transfer/incoming");
                  setIsDrawerOpen(false);
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={t("add")} />
              </ListItem>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/transfer/outgoing");
                  setIsDrawerOpen(false);
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <RemoveIcon />
                </ListItemIcon>
                <ListItemText primary={t("subtract")} />
              </ListItem>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/transfer/accounts");
                  setIsDrawerOpen(false);
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <SwapHorizIcon />
                </ListItemIcon>
                <ListItemText primary={t("interAccount")} />
              </ListItem>
            </List>
          </Collapse>

          <ListItem
            component="button"
            onClick={() => setDebtMenuOpen(!debtMenuOpen)}
            sx={itemStyle}
          >
            <ListItemIcon>
              <AccountBalanceWalletIcon />
            </ListItemIcon>
            <ListItemText primary={t("debtManagement")} />
            {debtMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={debtMenuOpen} timeout="auto" unmountOnExit>
            <List sx={{ pl: 4 }}>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/debt");
                  setIsDrawerOpen(false);
                  // window.location.reload();
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <CreditCardIcon />
                </ListItemIcon>
                <ListItemText primary={t("debts")} />
              </ListItem>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/debt/create");
                  setIsDrawerOpen(false);
                  // window.location.reload();
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary={t("addDebt")} />
              </ListItem>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/debt/edit");
                  setIsDrawerOpen(false);
                  // window.location.reload();
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary={t("editDebt")} />
              </ListItem>
              <ListItem
                component="button"
                onClick={() => {
                  navigate("/debt/pay");
                  setIsDrawerOpen(false);
                  // window.location.reload();
                }}
                sx={itemStyle}
              >
                <ListItemIcon>
                  <AttachMoneyIcon />
                </ListItemIcon>
                <ListItemText primary={t("payDebt")} />
              </ListItem>
            </List>
          </Collapse>

          <ListItem
            component="button"
            onClick={() => {
              navigate("/settings");
              setIsDrawerOpen(false);
            }}
            sx={itemStyle}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t("settings")} />
          </ListItem>

          <ListItem component="button" onClick={handleLogout} sx={itemStyle}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary={t("logout")} />
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default MenuPage;
