import { Box, Typography, IconButton } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import MenuPage from "./MenuPage";
import NotificationButton from "./NotificationButton";
import ProfileButton from "./ProfileButton";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTheme } from "../config/ThemeContext";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh", 
        bgcolor: isDarkMode ? "#1a2332" : "#f5f7f6",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 1.5,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          bgcolor: "transparent",
        }}
      >
        {/* Left - Logo and Title */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
            transition: "opacity 0.2s",
          }}
          onClick={() => navigate("/account")}
        >
          <img
            src="/images/CroWallet2.png"
            alt="CroWallet"
            style={{ width: "40px", height: "40px", objectFit: "contain" }}
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: isDarkMode ? "#fff" : "#1C2B44",
              ml: 1.5,
              fontSize: "1.4rem",
              transition: "color 0.3s ease",
            }}
          >
            CroWallet
          </Typography>
        </Box>

        {/* Right - Settings, Notification, Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => navigate("/settings")}
            sx={{
              color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "#555",
              "&:hover": { 
                bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(174, 201, 184, 0.2)",
                color: isDarkMode ? "#fff" : "#1C2B44",
              },
            }}
          >
            <SettingsIcon />
          </IconButton>
          <NotificationButton />
          <ProfileButton />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          pt: 10, // Space for fixed header
          pb: 15, // Space for bottom menu (increased for 95px menu)
          width: "100%",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Navigation Menu */}
      <MenuPage />
    </Box>
  );
};

export default DashboardLayout;
