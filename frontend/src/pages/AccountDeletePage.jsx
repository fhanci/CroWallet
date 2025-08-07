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
const AccountDeletePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://localhost:8082/api/accounts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((a) => a.user.id === parseInt(userId));
          setAccounts(filtered);
        }
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [userId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8082/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleVerifyPassword = () => {
    if (password === user?.password) {
      setError("");
      setConfirmOpen(true);
    } else {
      setError(t("wrongPassword"));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(
        `http://localhost:8082/api/accounts/delete/${selectedAccountId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Silme başarısız");

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
            onClick={handleDeleteAccount}
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
