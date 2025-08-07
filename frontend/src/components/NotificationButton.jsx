import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

// ⛳️ Burada eksikti:
const NotificationButton = ({
  isDrawerOpen,
  setIsDrawerOpen,
  isInsideDrawer = false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

  const handleClick = () => {
    navigate("/notification");
    if (isMobile && setIsDrawerOpen) {
      setIsDrawerOpen(false); // ✅ Mobilde menüyü kapat
    }
  };

  if (isInsideDrawer && !(isMobile && isDrawerOpen)) return null;
  if (!isInsideDrawer && isMobile) return null;

  return (
    <IconButton
      onClick={handleClick}
      sx={{
        backgroundColor: "#e0e0e0",
        "&:hover": { backgroundColor: "#d5d5d5" },
        width: 40,
        height: 40,
        ml: 1,
      }}
    >
      <NotificationsIcon sx={{ color: "#333" }} />
    </IconButton>
  );
};

export default NotificationButton;
