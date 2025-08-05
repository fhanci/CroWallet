import React, { useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem, InputLabel, FormControl, Select, Button, Snackbar, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';

const AccountCreatePage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const now = new Date();

  // Form alanları
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('');

  // Uyarı ve durumlar
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Hesap ekleme işlemi
  const handleAddAccount = async () => {
    if (!balance || !currency || !accountName) {
      setError("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const updateDate = new Date(now.getTime() + (3 * 60 * 60 * 1000)).toISOString();

      const response = await fetch('http://localhost:8082/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName,
          balance,
          currency,
          user: { id: parseInt(userId) },
          updateDate,
        }),
      });

      if (!response.ok) throw new Error(t("accountAddFailed"));

      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/account');
      }, 1000);

    } catch (error) {
      console.error('Hata:', error);
      setError("Bir hata oluştu, tekrar deneyiniz.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {t("addAccount")}
        </Typography>

        <TextField
          label={t("accountName")}
          fullWidth
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          margin="normal"
        />
        <TextField
          label={t("balance")}
          type="number"
          fullWidth
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
        <InputLabel id="currency-label">{t("currency")}</InputLabel>
            <Select
                labelId="currency-label"
                id="currency-select"
                label={t("currency")} // ← Bu satır şart
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
            >
            <MenuItem value="EUR">{t("eur")}</MenuItem>
            <MenuItem value="USD">{t("eur")}</MenuItem>
            <MenuItem value="TRY">{t("eur")}</MenuItem>
            </Select>
        </FormControl>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate('/account')}>
            {t("cancel")}
          </Button>
          <Button variant="contained" color="success" onClick={handleAddAccount} startIcon={<SaveIcon />}>
            Kaydet
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {t("accountAddedSuccess")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountCreatePage;
