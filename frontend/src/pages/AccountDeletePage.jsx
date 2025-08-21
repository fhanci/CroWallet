import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";
import axios from "axios";

const AccountDeletePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const token = localStorage.getItem("token");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState();
  const [password, setPassword] = useState();
  const [error, setError] = useState();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/accounts/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setAccounts(res.data);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [user.id]);

  const handleVerifyPassword = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8082/api/users/verify-password/${user.id}`,
        { password },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (res.status === 200) {
        await handleDeleteAccount();
      } else {
        setError("Şifre yanlış, hesabınız silinmedi.");
      }
    } catch (err) {
      console.error("Şifre doğrulama hatası:", err);
      setError("Şifre doğrulanamadı.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8082/api/accounts/delete/${selectedAccountId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      setOpenSnackbar(true);
      setTimeout(() => navigate("/account"), 1000);
    } catch (err) {
      console.error("Silme hatası:", err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Hesap Sil
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="account-label">{t("accountToDelete")}</InputLabel>
          <Select
            labelId="account-label"
            id="account-select"
            label={t("accountToDelete")}
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.accountName} - {account.balance} {account.currency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label={t("password")}
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error}
          helperText={error}
        />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate("/account")}>
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleVerifyPassword}
            disabled={!selectedAccountId}
          >
            {t("delete")}
          </Button>
        </Box>
      </Box>

      {/* Onay Dialogu */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t("confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("confirmDeleteMessage")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            {t("confirmDeleteCancel")}
          </Button>
          <Button
            onClick={handleVerifyPassword}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            {t("confirmDeleteConfirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          {t("accountDeletedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountDeletePage;
