// Shared card styles for modern minimalistic design

export const getCardStyles = (isDarkMode) => {
  const borderColor = isDarkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)";
  const textPrimary = isDarkMode ? "#fff" : "#1a1a1a";
  const textSecondary = isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)";

  const glassCard = {
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${borderColor}`,
    boxShadow: isDarkMode ? "0 4px 24px rgba(0, 0, 0, 0.3)" : "0 4px 24px rgba(0, 0, 0, 0.12)",
    borderRadius: 0,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": { 
      transform: "translateY(-2px)", 
      boxShadow: isDarkMode ? "0 8px 32px rgba(0, 0, 0, 0.4)" : "0 8px 32px rgba(0, 0, 0, 0.18)",
    },
  };

  const pageContainer = {
    bgcolor: isDarkMode ? "#1a2332" : "#f5f7f6",
    minHeight: "100vh",
    color: textPrimary,
  };

  const sectionCard = {
    ...glassCard,
    bgcolor: isDarkMode ? "rgba(30, 42, 58, 0.95)" : "rgba(255, 255, 255, 0.95)",
    p: 3,
  };

  const inputField = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 0,
      bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
      "& fieldset": {
        borderColor: borderColor,
      },
      "&:hover fieldset": {
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",
      },
    },
    "& .MuiInputLabel-root": {
      color: textSecondary,
    },
    "& .MuiOutlinedInput-input": {
      color: textPrimary,
    },
  };

  const button = {
    borderRadius: 0,
    textTransform: "none",
    fontWeight: 600,
    px: 3,
    py: 1,
  };

  return {
    borderColor,
    textPrimary,
    textSecondary,
    glassCard,
    pageContainer,
    sectionCard,
    inputField,
    button,
  };
};

