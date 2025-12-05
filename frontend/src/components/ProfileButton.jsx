import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const ProfileButton = ({
  isDrawerOpen,
  setIsDrawerOpen,
  isInsideDrawer = false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const token = localStorage.getItem("token");
  const handleClick = () => {
    navigate("/profile");
    if (isMobile && setIsDrawerOpen) {
      setIsDrawerOpen(false);
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
      <AccountCircleIcon sx={{ color: "#333" }} />
    </IconButton>
  );
};

export default ProfileButton;
