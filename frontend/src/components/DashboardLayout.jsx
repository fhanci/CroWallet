import React, { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import MenuPage from "./MenuPage";
import NotificationButton from "./NotificationButton";
import ProfileButton from "./ProfileButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const DashboardLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const token = localStorage.getItem("token");
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <MenuPage isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />

      <Box sx={{ flexGrow: 1, p: 2, width: "100%", position: "relative" }}>
        {/* Mobilde sadece drawer açıkken göster */}
        {!isMobile && <></>}

        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
