import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LoginPage = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const clearFields = () => {
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:8082/api/users");
      if (!response.ok) throw new Error(t("serverError"));
      const users = await response.json();

      const user = users.find(
        (u) => u.email.trim() === email.trim() && u.password === password
      );
      if (user) {
        localStorage.setItem("userId", user.id);
        onLoginSuccess(user.id);
        navigate("/account");
        clearFields();
      } else {
        setMessage(t("loginFailed"));
      }
    } catch (error) {
      setMessage(t("genericError"));
      console.error("Hata:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password || !name || !confirmPassword) {
      setMessage(t("fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t("passwordMismatch"));
      return;
    }

    try {
      const checkResponse = await fetch("http://localhost:8082/api/users");
      if (!checkResponse.ok) throw new Error(t("serverError"));
      const users = await checkResponse.json();

      if (users.some((user) => user.email.trim() === email.trim())) {
        setMessage(t("emailExists"));
        return;
      }

      const response = await fetch("http://localhost:8082/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
        }),
      });

      if (!response.ok)
        throw new Error(
          t(registrationFailed)
        );
      setOpenSnackbar(true);
      setTimeout(() => {
        setIsRegistering(false);
        clearFields();
      }, 1000);
    } catch (error) {
      setMessage(t("genericError"));
      console.error("Hata:", error);
    }
  };

  const commonTextFieldStyles = {
    InputLabelProps: { style: { color: "#fff" } },
    InputProps: { style: { color: "#fff" } },
    margin: "normal",
    fullWidth: true,
  };

  return (
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
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
        {/* Logo Bölümü */}
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

        {/* Form Bölümü */}
        <Box
          sx={{
            p: 3,
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "transparent",
          }}
        >
          <Typography variant="h5" align="center" sx={{ color: "#fff" }}>
            {isRegistering ? t("register") : t("login")}
          </Typography>

          {message && (
            <Typography color="error" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}

          <TextField
            label={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...commonTextFieldStyles}
          />
          <TextField
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...commonTextFieldStyles}
          />

          {isRegistering && (
            <>
              <TextField
                label={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                {...commonTextFieldStyles}
              />
              <TextField
                label={t("confirmPassword")}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                {...commonTextFieldStyles}
              />
            </>
          )}

          <Button
            onClick={isRegistering ? handleRegister : handleLogin}
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              bgcolor: "#1C2B44",
              "&:hover": { bgcolor: "#162033" },
            }}
          >
            {isRegistering ? t("register") : t("login")}
          </Button>

          <Button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage("");
            }}
            fullWidth
            sx={{ mt: 2, color: "#fff", textDecoration: "underline" }}
          >
            {isRegistering
              ? t("alreadyHaveAccount")
              : t("dontHaveAccount")
            }
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
