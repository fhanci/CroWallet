import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Box, FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const AccountDeletePage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch('http://localhost:8082/api/accounts');
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter(a => a.user.id === parseInt(userId));
          setAccounts(filtered);
        }
      } catch (err) {
        console.error('Hesaplar alınamadı:', err);
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
        console.error('Kullanıcı bilgileri alınamadı:', err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleVerifyPassword = () => {
    if (password === user?.password) {
      setError('');
      setConfirmOpen(true);
    } else {
      setError('Şifre yanlış, lütfen tekrar deneyin.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`http://localhost:8082/api/accounts/delete/${selectedAccountId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Silme başarısız');

      setOpenSnackbar(true);
      setTimeout(() => navigate('/account'), 1000);
    } catch (err) {
      console.error('Silme hatası:', err);
      setError('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Hesap Sil
        </Typography>

        <FormControl fullWidth margin="normal">
        <InputLabel id="account-label">Silinecek Hesap</InputLabel>
            <Select
                labelId="account-label"
                id="account-select"
                label="Silinecek Hesap" 
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
          label="Şifreniz"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!error}
          helperText={error}
        />

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate('/account')}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleVerifyPassword}
            disabled={!selectedAccountId}
          >
            Sil
          </Button>
        </Box>
      </Box>

      {/* Onay Dialogu */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>
            Seçilen hesabı silmek üzeresiniz. Bu işlem geri alınamaz. Emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Vazgeç</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          Hesap başarıyla silindi!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountDeletePage;
