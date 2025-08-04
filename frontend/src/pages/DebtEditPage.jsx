import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, Snackbar, Alert,Dialog , DialogTitle,
          DialogContent, DialogActions } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';

const DebtEditPage = () => {
  const userId = localStorage.getItem('userId');

  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const [showZeroDialog, setShowZeroDialog] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const res = await fetch('http://localhost:8082/api/debts');
        if (!res.ok) throw new Error('Borçlar alınamadı');
        const data = await res.json();
        const filtered = data.filter(d => d.user?.id === parseInt(userId) && d.status === "odenmedi");
        setDebts(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDebts();
  }, [userId]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('http://localhost:8082/api/accounts');
        if (!res.ok) throw new Error('Hesaplar alınamadı');
        const data = await res.json();
        const userAccounts = data.filter(acc => acc.user?.id === parseInt(userId));
        setAccounts(userAccounts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, [userId]);

  useEffect(() => {
    console.log("Seçilen Borç (selectedDebt):", selectedDebt);
  }, [selectedDebt]);

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
      navigate('/account');
    }
  
    // 3) Geri kalan validasyon
    if (
      !selectedDebt?.debtAmount ||
      !selectedDebt?.debtCurrency ||
      !selectedDebt?.dueDate ||
      !selectedDebt?.warningPeriod ||
      !selectedDebt?.account?.id
    ) {
      setError('Lütfen tüm alanları doldurun!');
      return;
    }

    try {
      const oldDebt = debts.find(d => d.id === selectedDebt.id);
      if (!oldDebt) throw new Error("Eski borç bulunamadı");
      if (!oldDebt.account?.id) throw new Error("Eski borca bağlı hesap bilgisi eksik!");

      const debtDifference = parseFloat(selectedDebt.debtAmount) - parseFloat(oldDebt.debtAmount);
      const oldAccountId = oldDebt.account.id;
      const newAccountId = selectedDebt.account.id;

      if (!newAccountId) throw new Error("Hesap seçimi yapılmalı");

      if (oldAccountId !== newAccountId) {
        const resOldAcc = await fetch(`http://localhost:8082/api/accounts/${oldAccountId}`);
        if (!resOldAcc.ok) throw new Error("Eski hesap bilgisi alınamadı");
        const oldAccount = await resOldAcc.json();

        const resNewAcc = await fetch(`http://localhost:8082/api/accounts/${newAccountId}`);
        if (!resNewAcc.ok) throw new Error("Yeni hesap bilgisi alınamadı");
        const newAccount = await resNewAcc.json();

        const oldAccUpdatedBalance = oldAccount.balance - parseFloat(oldDebt.debtAmount);
        const oldAccUpdateRes = await fetch(`http://localhost:8082/api/accounts/update/${oldAccount.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...oldAccount,
            balance: oldAccUpdatedBalance,
            updateDate: new Date().toISOString(),
          }),
        });
        if (!oldAccUpdateRes.ok) throw new Error("Eski hesap bakiyesi güncellenemedi");

        const newAccUpdatedBalance = newAccount.balance + parseFloat(selectedDebt.debtAmount);
        const newAccUpdateRes = await fetch(`http://localhost:8082/api/accounts/update/${newAccount.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newAccount,
            balance: newAccUpdatedBalance,
            updateDate: new Date().toISOString(),
          }),
        });
        if (!newAccUpdateRes.ok) throw new Error("Yeni hesap bakiyesi güncellenemedi");

        const createDate = new Date().toISOString();

        await fetch("http://localhost:8082/api/transfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(oldDebt.debtAmount),
            category: "Borç Güncelleme",
            details: "Borç hesap değişikliği - eski hesaptan çıkış",
            date: createDate,
            createDate,
            user: { id: parseInt(userId) },
            account: { id: oldAccount.id },
            type: "outgoing",
            person: selectedDebt.toWhom,
            outputPreviousBalance: oldAccount.balance,
            outputNextBalance: oldAccUpdatedBalance,
          }),
        });

        await fetch("http://localhost:8082/api/transfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(selectedDebt.debtAmount),
            category: "Borç Güncelleme",
            details: "Borç hesap değişikliği - yeni hesaba giriş",
            date: createDate,
            createDate,
            user: { id: parseInt(userId) },
            account: { id: newAccount.id },
            type: "incoming",
            person: selectedDebt.toWhom,
            inputPreviousBalance: newAccount.balance,
            inputNextBalance: newAccUpdatedBalance,
          }),
        });

      } else {
        const resAccount = await fetch(`http://localhost:8082/api/accounts/${newAccountId}`);
        if (!resAccount.ok) throw new Error("Hesap bilgisi alınamadı");
        const accountToUpdate = await resAccount.json();

        const updatedBalance = accountToUpdate.balance + debtDifference;

        const accountUpdateResponse = await fetch(`http://localhost:8082/api/accounts/update/${accountToUpdate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...accountToUpdate,
            balance: updatedBalance,
            updateDate: new Date().toISOString(),
          }),
        });
        if (!accountUpdateResponse.ok) throw new Error("Hesap bakiyesi güncellenemedi");

        const createDate = new Date().toISOString();

        await fetch("http://localhost:8082/api/transfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.abs(debtDifference),
            category: "Borç Güncelleme",
            details: debtDifference > 0 ? "Borç arttı" : "Borç azaldı",
            date: createDate,
            createDate,
            user: { id: parseInt(userId) },
            account: { id: accountToUpdate.id },
            type: debtDifference > 0 ? "incoming" : "outgoing",
            person: selectedDebt.toWhom,
            inputPreviousBalance: accountToUpdate.balance,
            inputNextBalance: updatedBalance,
          }),
        });
      }

      
      const response = await fetch(`http://localhost:8082/api/debts/update/${selectedDebt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDebt.id,
          debtAmount: parseFloat(selectedDebt.debtAmount),
          debtCurrency: selectedDebt.debtCurrency,
          toWhom: selectedDebt.toWhom,
          dueDate: selectedDebt.dueDate,
          status: selectedDebt.status,
          warningPeriod: selectedDebt.warningPeriod,
          user: { id: parseInt(userId) },
          account: { id: selectedDebt.account.id }
        }) 
      });
      
      if (!response.ok) throw new Error('Borç güncelleme başarısız!');

      setOpenSnackbar(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Güncelleme başarısız, tekrar deneyiniz.');
    }
  };

  useEffect(() => {
    if (selectedDebt && selectedDebt.account && !selectedDebt.account.accountName) {
      const matchedAccount = accounts.find((acc) => acc.id === selectedDebt.account.id);
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
          Borç Düzenle
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel id="debt-select-label">Borç Seç</InputLabel>
          <Select
            labelId="debt-select-label"
            id="debt-select"
            label="Borç Seç"
            value={selectedDebt?.id || ''}
            onChange={(e) =>
              setSelectedDebt(debts.find(d => d.id === e.target.value))
            }
            autoComplete="off"
            inputProps={{ autoComplete: 'off' }}
          >
            {debts.map(d => (
              <MenuItem key={d.id} value={d.id}>
                {d.toWhom} - {d.debtAmount} {d.debtCurrency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedDebt && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="account-select-label">Borcun Eklendiği Hesap</InputLabel>
            <Select
              labelId="account-select-label"
              id="account-select"
              value={selectedDebt.account?.id || ''}
              disabled
              inputProps={{ autoComplete: 'off' }}
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
              label="Miktar"
              type="number"
              fullWidth
              margin="normal"
              name="no-autocomplete-miktar"
              value={selectedDebt.debtAmount}
              onChange={(e) => setSelectedDebt({ ...selectedDebt, debtAmount: e.target.value })}
              autoComplete="new-password"
              inputProps={{ autoComplete: 'new-password' }}
              spellCheck={false}
            />

          
            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-select-label">Para Birimi</InputLabel>
              <Select
                labelId="currency-select-label"
                id="currency-select"
                value={selectedDebt.debtCurrency}
                onChange={(e) => setSelectedDebt({ ...selectedDebt, debtCurrency: e.target.value })}
                label="Para Birimi"
                autoComplete="off"
                inputProps={{ autoComplete: 'off' }}
              >
                <MenuItem value="EUR">€ EUR</MenuItem>
                <MenuItem value="USD">$ USD</MenuItem>
                <MenuItem value="TRY">₺ TRY</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Son Ödeme Tarihi"
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              name="no-autocomplete-date"
              value={selectedDebt.dueDate}
              onChange={(e) => setSelectedDebt({ ...selectedDebt, dueDate: e.target.value })}
              autoComplete="new-password"
              inputProps={{ autoComplete: 'new-password' }}
              spellCheck={false}
            />

            <TextField
              label="Uyarılma Süresi (Gün)"
              type="number"
              fullWidth
              margin="normal"
              name="no-autocomplete-warning"
              value={selectedDebt.warningPeriod}
              onChange={(e) => setSelectedDebt({ ...selectedDebt, warningPeriod: e.target.value })}
              autoComplete="new-password"
              inputProps={{ autoComplete: 'new-password' }}
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
            İptal
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
            Kaydet
          </Button>
        </Box>
      </Box>

      {selectedDebt && (   
        <Dialog
          open={showZeroDialog}
          onClose={() => setShowZeroDialog(false)}
        >
          <DialogTitle>Onay</DialogTitle>
          <DialogContent>
            Borç miktarını 0 yapmak borcu ‘ödendi’ olarak işaretler ve listeden kaldırır. Devam edilsin mi?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowZeroDialog(false)}>
              Hayır
            </Button>
            <Button
              onClick={() => handleUpdateDebt()} 
              autoFocus
            >
              Evet
            </Button>
          </DialogActions>
        </Dialog>
      )}   
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Borç başarıyla güncellendi!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DebtEditPage;
