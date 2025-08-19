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

  // useEffect(() => {
  //   console.log("Seçilen Borç (selectedDebt):", selectedDebt);
  // }, [selectedDebt]);

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
      const oldDebt = debts.find((d) => d.id === selectedDebt.id);
      if (!oldDebt) throw new Error("Eski borç bulunamadı");
      if (!oldDebt.account?.id)
        throw new Error("Eski borca bağlı hesap bilgisi eksik!");

      const debtDifference =
        parseFloat(selectedDebt.debtAmount) - parseFloat(oldDebt.debtAmount);
      const oldAccountId = oldDebt.account.id;
      const newAccountId = selectedDebt.account.id;

      if (!newAccountId) throw new Error("Hesap seçimi yapılmalı");

      if (oldAccountId !== newAccountId) {
        const resOldAcc = await axios.get(
          `http://localhost:8082/api/accounts/${oldAccountId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        const oldAccount = await resOldAcc.data;

        const resNewAcc = await axios.get(
          `http://localhost:8082/api/accounts/${newAccountId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        const newAccount = await resNewAcc.data;

        const oldAccUpdatedBalance =
          oldAccount.balance - parseFloat(oldDebt.debtAmount);
        console.log(oldAccUpdatedBalance);
        // const oldAccUpdateRes = await axios.put(
        //   `http://localhost:8082/api/accounts/update/${oldAccount.id}`,

        //   {
        //     ...oldAccount,
        //     balance: oldAccUpdatedBalance,
        //     updateDate: new Date().toISOString(),
        //   },
        //   {
        //     headers: {
        //       Authorization: token ? `Bearer ${token}` : undefined,
        //     },
        //   }
        // );

        const newAccUpdatedBalance =
          newAccount.balance + parseFloat(selectedDebt.debtAmount);
        console.log(newAccUpdatedBalance)
        // const newAccUpdateRes = await axios.put(
        //   `http://localhost:8082/api/accounts/update/${newAccount.id}`,
        //   {
        //     ...newAccount,
        //     balance: newAccUpdatedBalance,
        //     updateDate: new Date().toISOString(),
        //   },
        //   {
        //     headers: {
        //       Authorization: token ? `Bearer ${token}` : undefined,
        //     },
        //   }
        // );

        const createDate = new Date()

        await axios.post(
          "http://localhost:8082/api/transfers/create",
          {
            amount: parseFloat(oldDebt.debtAmount),
            category: "Borç Güncelleme",
            details: "Borç hesap değişikliği - eski hesaptan çıkış",
            date: createDate,
            createDate,
            user: { id: user.id },
            account: { id: oldAccount.id },
            type: "outgoing",
            person: selectedDebt.toWhom,
            outputPreviousBalance: oldAccount.balance,
            outputNextBalance: oldAccUpdatedBalance,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        await axios.post(
          "http://localhost:8082/api/transfers/create",
          {
            amount: parseFloat(selectedDebt.debtAmount),
            category: "Borç Güncelleme",
            details: "Borç hesap değişikliği - yeni hesaba giriş",
            date: createDate,
            createDate,
            user: { id: user.id },
            account: { id: newAccount.id },
            type: "incoming",
            person: selectedDebt.toWhom,
            inputPreviousBalance: newAccount.balance,
            inputNextBalance: newAccUpdatedBalance,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const resAccount = await axios.get(
          `http://localhost:8082/api/accounts/${newAccountId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );

        const accountToUpdate = resAccount.data;

        const updatedBalance = accountToUpdate.balance + debtDifference;

        const accountUpdateResponse = await axios.put(
          `http://localhost:8082/api/accounts/update/${accountToUpdate.id}`,
          {
            ...accountToUpdate,
            balance: updatedBalance,
            updateDate: new Date()
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        const createDate = new Date()

        await axios.post(
          "http://localhost:8082/api/transfers/create",
          {
            amount: Math.abs(debtDifference),
            category: "Borç Güncelleme",
            details: debtDifference > 0 ? "Borç arttı" : "Borç azaldı",
            date: createDate,
            createDate,
            user: { id: user.id },
            account: { id: accountToUpdate.id },
            type: debtDifference > 0 ? "incoming" : "outgoing",
            receiverId: user.id,
            inputPreviousBalance: accountToUpdate.balance,
            inputNextBalance: updatedBalance,
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const response = await axios.put(
        `http://localhost:8082/api/debts/update/${selectedDebt.id}`,
        {
          id: selectedDebt.id,
          debtAmount: parseFloat(selectedDebt.debtAmount),
          debtCurrency: selectedDebt.debtCurrency,
          toWhom: selectedDebt.toWhom,
          dueDate: selectedDebt.dueDate,
          status: selectedDebt.status,
          warningPeriod: selectedDebt.warningPeriod,
          user: { id: user.id },
          account: { id: selectedDebt.account.id },
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      setOpenSnackbar(true);
    } catch (err) {
      console.error(err);
      setError();
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
            value={selectedDebt?.id || "" }
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
              value={selectedDebt.account?.id || "" }
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
