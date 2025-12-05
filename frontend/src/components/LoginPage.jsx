import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
} from "@mui/material";
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState();
  const [isRegistering, setIsRegistering] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { setUserInfo } = useUser();

  const clearFields = () => {
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setMessage("");
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      EMAIL_REQUIRED: t("emailRequired"),
      PASSWORD_REQUIRED: t("passwordRequired"),
      USER_NOT_FOUND: t("userNotFound"),
      INVALID_PASSWORD: t("invalidPassword"),
      EMAIL_EXISTS: t("emailExists"),
      USERNAME_EXISTS: t("usernameExists"),
      USERNAME_REQUIRED: t("usernameRequired"),
      PASSWORD_TOO_SHORT: t("passwordTooShort"),
      REGISTRATION_FAILED: t("registrationFailed"),
    };
    return errorMessages[errorCode] || t("genericError");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage(t("emailRequired"));
      return;
    }
    if (!password) {
      setMessage(t("passwordRequired"));
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8082/api/auth/login",
        { email, password }
      );
      setUserInfo({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
      });
      localStorage.setItem("token", response.data.token);
      if (response) {
        navigate("/account");
        clearFields();
      } else {
        setMessage(t("loginFailed"));
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(getErrorMessage(error.response.data.error));
      } else if (error.code === "ERR_NETWORK") {
        setMessage(t("serverError"));
      } else {
        setMessage(t("genericError"));
      }
      console.error("Error:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage();

    if (!email) {
      setMessage(t("emailRequired"));
      return;
    }
    if (!name) {
      setMessage(t("usernameRequired"));
      return;
    }
    if (!password) {
      setMessage(t("passwordRequired"));
      return;
    }
    if (password.length < 6) {
      setMessage(t("passwordTooShort"));
      return;
    }
    if (!confirmPassword) {
      setMessage(t("confirmPasswordRequired"));
      return;
    }
    if (password !== confirmPassword) {
      setMessage(t("passwordMismatch"));
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8082/api/auth/register",
        { email, username: name, password }
      );

      if (response.status === 200) {
        setOpenSnackbar(true);
        setTimeout(() => {
          setIsRegistering(false);
          clearFields();
        }, 1000);
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(getErrorMessage(error.response.data.error));
      } else if (error.code === "ERR_NETWORK") {
        setMessage(t("serverError"));
      } else {
        setMessage(t("genericError"));
      }
      console.error("Error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      isRegistering ? handleRegister(e) : handleLogin(e);
    }
  };

  const textFieldSx = {
    mb: 2,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
        transition: "all 0.3s ease",
      },
      "&:hover fieldset": {
        borderColor: "rgba(179, 216, 189, 0.6)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#B3D8BD",
        borderWidth: "2px",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.8)",
      "&.Mui-focused": {
        color: "#B3D8BD",
      },
    },
    "& .MuiOutlinedInput-input": {
      color: "#fff",
      padding: "14px 14px",
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": {
      color: "rgba(255, 255, 255, 0.6)",
    },
  };

  return (
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{
            borderRadius: "12px",
            backgroundColor: "#B3D8BD",
            color: "#1C2B44",
            fontWeight: 600,
          }}
        >
          {t("registrationSuccess")}
        </Alert>
      </Snackbar>

      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: "100vh",
          width: "100vw",
          overflow: "hidden",
          background: "linear-gradient(135deg, #1C2B44, #B3D8BD)",
          padding: 2,
        }}
      >
        {/* Logo Bölümü - Orijinal */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={{ xs: "100%", md: "50%" }}
          sx={{ px: 2 }}
        >
          <img
            src="/images/CroWallet.png"
            alt="CroWallet Logo"
            style={{
              width: "100%",
              maxWidth: "400px",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Form Bölümü - Modern */}
        <Fade in timeout={600}>
          <Box
            sx={{
              width: "100%",
              maxWidth: "420px",
              p: 4,
              borderRadius: "24px",
              background: "rgba(28, 43, 68, 0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{
                color: "#fff",
                fontWeight: 700,
                mb: 1,
                fontSize: "1.75rem",
              }}
            >
              {isRegistering ? t("register") : t("login")}
            </Typography>

            <Typography
              align="center"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                mb: 3,
                fontSize: "0.9rem",
              }}
            >
              {isRegistering
                ? "Hesabınızı oluşturun"
                : "Tekrar hoş geldiniz!"}
            </Typography>

            {message && (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: "10px",
                  backgroundColor: "rgba(244, 67, 54, 0.15)",
                  border: "1px solid rgba(244, 67, 54, 0.4)",
                }}
              >
                <Typography
                  sx={{
                    color: "#ff6b6b",
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  {message}
                </Typography>
              </Box>
            )}

            <TextField
              label={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label={t("password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              fullWidth
              sx={textFieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {isRegistering && (
              <Fade in timeout={300}>
                <Box>
                  <TextField
                    label={t("name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    sx={textFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label={t("confirmPassword")}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    sx={textFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Fade>
            )}

            <Button
              onClick={isRegistering ? handleRegister : handleLogin}
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                background: "linear-gradient(135deg, #B3D8BD 0%, #8BC4A0 100%)",
                color: "#1C2B44",
                boxShadow: "0 4px 15px rgba(179, 216, 189, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #c4e5cc 0%, #9ed1ae 100%)",
                  boxShadow: "0 6px 20px rgba(179, 216, 189, 0.5)",
                  transform: "translateY(-2px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              }}
            >
              {isRegistering ? t("register") : t("login")}
            </Button>

            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                textAlign: "center",
              }}
            >
              <Typography
                component="span"
                sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}
              >
                {isRegistering ? "Zaten hesabınız var mı? " : "Hesabınız yok mu? "}
              </Typography>
              <Button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setMessage("");
                }}
                sx={{
                  color: "#B3D8BD",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  p: 0,
                  minWidth: "auto",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
              >
                {isRegistering ? t("login") : t("register")}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>
    </>
  );
};

export default LoginPage;
