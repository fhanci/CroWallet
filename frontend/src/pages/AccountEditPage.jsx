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
  Snackbar,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useUser } from "../config/UserStore";
import axios from "axios";

const AccountEditPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const now = new Date();
  const token = localStorage.getItem("token");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8082/api/accounts/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setAccounts(response.data);
      } catch (err) {
        console.error("Hesaplar alınamadı:", err);
      }
    };
    fetchAccounts();
  }, [user.id]);

  const handleUpdateAccount = async () => {
    if (
      !selectedAccount?.accountName ||
      !selectedAccount?.balance ||
      !selectedAccount?.currency
    ) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const updateDate = new Date(
        now.getTime() + 3 * 60 * 60 * 1000
      ).toISOString();
      const updatedAccount = { ...selectedAccount, updateDate };

      const response = await axios.put(
        `http://localhost:8082/api/accounts/update/${selectedAccount.id}`,
        updatedAccount,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setOpenSnackbar(true);
      setTimeout(() => navigate("/account"), 1000);
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      setError("Bir hata oluştu, tekrar deneyiniz.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {t("editAccount")}
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="account-select-label">
            {t("selectAccount")}
          </InputLabel>
          <Select
            labelId="account-select-label"
            id="account-select"
            label={t("selectAccount")}
            value={selectedAccount?.id || ""}
            onChange={(e) =>
              setSelectedAccount(accounts.find((a) => a.id === e.target.value))
            }
          >
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.accountName} - {a.balance} {a.currency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedAccount && (
          <>
            <TextField
              label={t("accountName")}
              fullWidth
              margin="normal"
              value={selectedAccount.accountName}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  accountName: e.target.value,
                })
              }
            />
            <TextField
              label={t("balance")}
              fullWidth
              type="number"
              margin="normal"
              value={selectedAccount.balance}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  balance: e.target.value,
                })
              }
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-select-label">
                {t("currency")}
              </InputLabel>
              <Select
                labelId="currency-select-label"
                id="currency-select"
                label={t("currency")}
                value={selectedAccount.currency}
                onChange={(e) =>
                  setSelectedAccount({
                    ...selectedAccount,
                    currency: e.target.value,
                  })
                }
              >
                <MenuItem value="TRY">TRY</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate("/account")}>
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleUpdateAccount}
          >
            {t("save")}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {t("accountUpdatedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountEditPage;
