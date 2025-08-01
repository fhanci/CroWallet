import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const clearFields = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (!response.ok) throw new Error('Sunucuyla bağlantı kurulamadı!');
      const users = await response.json();

      const user = users.find(u => u.email.trim() === email.trim() && u.password === password);
      if (user) {
        localStorage.setItem('userId', user.id);
        onLoginSuccess(user.id);
        navigate('/account');
        clearFields();
      } else {
        setMessage('Girilen bilgiler hatalı!');
      }
    } catch (error) {
      setMessage('Bir hata oluştu, lütfen daha sonra tekrar deneyiniz.');
      console.error('Hata:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email || !password || !name || !confirmPassword) {
      setMessage('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor!');
      return;
    }

    try {
      const checkResponse = await fetch('http://localhost:8080/api/users');
      if (!checkResponse.ok) throw new Error('Sunucuyla bağlantı kurulamadı!');
      const users = await checkResponse.json();

      if (users.some(user => user.email.trim() === email.trim())) {
        setMessage('Bu e-posta zaten kayıtlı!');
        return;
      }

      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      });

      if (!response.ok) throw new Error('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyiniz.');
      setOpenSnackbar(true);
      setTimeout(() => {
        setIsRegistering(false);
        clearFields();
      }, 1000);
    } catch (error) {
      setMessage('Bir hata oluştu, lütfen daha sonra tekrar deneyiniz.');
      console.error('Hata:', error);
    }
  };

  const commonTextFieldStyles = {
    InputLabelProps: { style: { color: '#fff' } },
    InputProps: { style: { color: '#fff' } },
    margin: 'normal',
    fullWidth: true
  };

  return (
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Kayıt Başarılı!
        </Alert>
      </Snackbar>

      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: '100vh',
          width: '100vw',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1C2B44, #B3D8BD)',
          padding: 2,
        }}
      >
        {/* Logo Bölümü */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={{ xs: '100%', md: '50%' }}
          sx={{ px: 2 }}
        >
          <img
            src="/images/CroWallet.png"
            alt="CroWallet Logo"
            style={{
              width: '100%',
              maxWidth: '400px',
              objectFit: 'contain'
            }}
          />
        </Box>

        {/* Form Bölümü */}
        <Box
          sx={{
            p: 3,
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'transparent'
          }}
        >
          <Typography variant="h5" align="center" sx={{ color: '#fff' }}>
            {isRegistering ? 'Kayıt Ol' : 'Giriş Yap'}
          </Typography>

          {message && (
            <Typography color="error" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}

          <TextField
            label="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...commonTextFieldStyles}
          />
          <TextField
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...commonTextFieldStyles}
          />

          {isRegistering && (
            <>
              <TextField
                label="Ad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                {...commonTextFieldStyles}
              />
              <TextField
                label="Şifre Tekrar"
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
            sx={{ mt: 2, bgcolor: '#1C2B44', '&:hover': { bgcolor: '#162033' } }}
          >
            {isRegistering ? 'Kayıt Ol' : 'Giriş Yap'}
          </Button>

          <Button
            onClick={() => { setIsRegistering(!isRegistering); setMessage(''); }}
            fullWidth
            sx={{ mt: 2, color: '#fff', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
