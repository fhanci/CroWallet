import { Box, Typography, Switch, Card, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../config/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import CategoryIcon from "@mui/icons-material/Category";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const settingsItemStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    p: 2.5,
    cursor: "pointer",
    transition: "all 0.2s",
    borderRadius: 0,
    bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
    "&:hover": {
      bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
    },
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        px: 2,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          color: isDarkMode ? "#fff" : "#1a1a1a",
        }}
      >
        Ayarlar
      </Typography>

      {/* Appearance Section */}
      <Card
        sx={{
          borderRadius: 0,
          bgcolor: isDarkMode ? "rgba(30, 42, 58, 0.90)" : "rgba(255, 255, 255, 0.90)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            display: "block",
            px: 2.5,
            pt: 2,
            pb: 1,
            color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          GÖRÜNÜM
        </Typography>

        <Box sx={settingsItemStyle}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isDarkMode ? (
              <DarkModeIcon sx={{ color: "#9C27B0", fontSize: 26 }} />
            ) : (
              <LightModeIcon sx={{ color: "#FF9800", fontSize: 26 }} />
            )}
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                }}
              >
                Karanlık Mod
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                }}
              >
                {isDarkMode ? "Açık" : "Kapalı"}
              </Typography>
            </Box>
          </Box>
          <Switch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#9C27B0",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#9C27B0",
              },
            }}
          />
        </Box>
      </Card>

      {/* Categories Section */}
      <Card
        sx={{
          borderRadius: 0,
          bgcolor: isDarkMode ? "rgba(30, 42, 58, 0.90)" : "rgba(255, 255, 255, 0.90)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            display: "block",
            px: 2.5,
            pt: 2,
            pb: 1,
            color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          KATEGORİLER
        </Typography>

        <Box
          sx={settingsItemStyle}
          onClick={() => navigate("/income")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CategoryIcon sx={{ color: "#4CAF50", fontSize: 26 }} />
            <Box>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                }}
              >
                Gelir/Gider Kategorileri
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                }}
              >
                Gelir ve gider kaynaklarını yönet
              </Typography>
            </Box>
          </Box>
          <ArrowForwardIosIcon
            sx={{
              fontSize: 16,
              color: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
            }}
          />
        </Box>
      </Card>

      {/* Version Info */}
      <Box
        sx={{
          textAlign: "center",
          mt: 6,
          color: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography variant="caption">CroWallet v1.0.0</Typography>
      </Box>
    </Box>
  );
};

export default SettingsPage;

