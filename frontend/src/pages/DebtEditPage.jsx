import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import axios from "axios";
import { useUser } from "../config/UserStore";

const DebtEditPage = () => {
  const token = localStorage.getItem("token");
  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const { user } = useUser();
  const [error, setError] = useState();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [showZeroDialog, setShowZeroDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/debts/get/${user.id}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setDebts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDebts();
  }, [user.id]);

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

  const handleUpdateDebt = async () => {
    if (!selectedDebt) return;

    if (parseFloat(selectedDebt.debtAmount) === 0 && !showZeroDialog) {
      setShowZeroDialog(true);
      return;
    }

    // 2) Dialog’tan “Evet” cevabı geldiyse, statüyü değiştir ve dialog’u kapat
    if (parseFloat(selectedDebt.debtAmount) === 0 && showZeroDialog) {
      selectedDebt.status = "odendi";
      setShowZeroDialog(false);
      navigate("/account");
    }

    // 3) Geri kalan validasyon
    if (
      !selectedDebt?.debtAmount ||
      !selectedDebt?.debtCurrency ||
      !selectedDebt?.dueDate ||
      !selectedDebt?.warningPeriod ||
      !selectedDebt?.account?.id
    ) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }
    try {
      await axios.put(
        `http://localhost:8082/api/debts/update/${selectedDebt.id}`,
        selectedDebt,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setOpenSnackbar(true);
    } catch (err) {
      console.error("Borç güncelleme hatası:", err);
      setError("Güncelleme sırasında bir hata oluştu.");
    }
  };

  useEffect(() => {
    if (
      selectedDebt &&
      selectedDebt.account &&
      !selectedDebt.account.accountName
    ) {
      const matchedAccount = accounts.find(
        (acc) => acc.id === selectedDebt.account.id
      );
      if (matchedAccount) {
        setSelectedDebt((prev) => ({
          ...prev,
          account: matchedAccount,
        }));
      }
    }
  }, [accounts, selectedDebt]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {t("editDebt")}
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="debt-select-label">{t("selectDebt")}</InputLabel>
          <Select
            labelId="debt-select-label"
            id="debt-select"
            label={t("selectDebt")}
            value={selectedDebt?.id || ""}
            onChange={(e) =>
              setSelectedDebt(debts.find((d) => d.id === e.target.value))
            }
            autoComplete="off"
            inputProps={{ autoComplete: "off" }}
          >
            {debts.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.toWhom} - {d.debtAmount} {d.debtCurrency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedDebt && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="account-select-label">
              {t("debtAccountLabel")}
            </InputLabel>
            <Select
              labelId="account-select-label"
              id="account-select"
              value={selectedDebt.account?.id || ""}
              disabled
              inputProps={{ autoComplete: "off" }}
            >
              {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.accountName} - {acc.balance} {acc.currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedDebt && (
          <>
            <TextField
              label={t("amount")}
              type="number"
              fullWidth
              margin="normal"
              name="no-autocomplete-miktar"
              value={selectedDebt.debtAmount}
              onChange={(e) =>
                setSelectedDebt({ ...selectedDebt, debtAmount: e.target.value })
              }
              autoComplete="new-password"
              inputProps={{ autoComplete: "new-password" }}
              spellCheck={false}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-select-label">
                {t("currency")}
              </InputLabel>
              <Select
                labelId="currency-select-label"
                id="currency-select"
                value={selectedDebt.debtCurrency}
                onChange={(e) =>
                  setSelectedDebt({
                    ...selectedDebt,
                    debtCurrency: e.target.value,
                  })
                }
                label={t("currency")}
                autoComplete="off"
                inputProps={{ autoComplete: "off" }}
              >
                <MenuItem value="TRY">₺ {t("try")} </MenuItem>
                <MenuItem value="EUR">€ {t("eur")} </MenuItem>
                <MenuItem value="USD">$ {t("usd")} </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t("dueDate")}
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              name="no-autocomplete-date"
              value={selectedDebt.dueDate}
              onChange={(e) =>
                setSelectedDebt({ ...selectedDebt, dueDate: e.target.value })
              }
              autoComplete="new-password"
              inputProps={{ autoComplete: "new-password" }}
              spellCheck={false}
            />

            <TextField
              label={t("warningPeriod")}
              type="number"
              fullWidth
              margin="normal"
              name="no-autocomplete-warning"
              value={selectedDebt.warningPeriod}
              onChange={(e) =>
                setSelectedDebt({
                  ...selectedDebt,
                  warningPeriod: e.target.value,
                })
              }
              autoComplete="new-password"
              inputProps={{ autoComplete: "new-password" }}
              spellCheck={false}
            />
          </>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => setSelectedDebt(null)}>
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleUpdateDebt}
            disabled={
              !selectedDebt?.debtAmount ||
              !selectedDebt?.debtCurrency ||
              !selectedDebt?.dueDate ||
              !selectedDebt?.warningPeriod ||
              !selectedDebt?.account?.id
            }
          >
            {t("save")}
          </Button>
        </Box>
      </Box>

      {selectedDebt && (
        <Dialog open={showZeroDialog} onClose={() => setShowZeroDialog(false)}>
          <DialogTitle>Onay</DialogTitle>
          <DialogContent>{t("debtConfirm")}</DialogContent>
          <DialogActions>
            <Button onClick={() => setShowZeroDialog(false)}>{t("no")}</Button>
            <Button onClick={() => handleUpdateDebt()} autoFocus>
              {t("yes")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {t("debtUpdatedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DebtEditPage;
