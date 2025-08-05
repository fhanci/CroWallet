import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, TextField, Button, Divider, Avatar, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', password: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`http://localhost:8082/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setEditData({ name: data.name, email: data.email, password: data.password });
      }
    };
    fetchUser();
  }, [userId]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    if (user) setEditData({ name: user.name, email: user.email, password: user.password });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const response = await fetch(`http://localhost:8082/api/users/update/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    if (response.ok) {
      setUser(editData);
      setIsEditing(false);
      setSnackbar({ open: true, message: 'Profil başarıyla güncellendi.', severity: 'success' });
    }
  };

  const handleDelete = async () => {
    const response = await fetch(`http://localhost:8082/api/users/delete/${userId}`, { method: 'DELETE' });
    if (response.ok) {
      setSnackbar({ open: true, message: 'Hesap silindi.', severity: 'info' });
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", p: 2 }}>
            <Typography variant="h4">KULLANICI BİLGİLERİ</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "left", width: "100%", mb: 4, fontSize: "1rem"}}>
            Hesap bilgilerinizi görüntüleyin ve yönetin.
        </Typography>

      <Box display="flex" flexDirection="column" gap={3} mt={4}>
        <TextField
          label={t("name")}
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          disabled={!isEditing}
          fullWidth
        />

        <TextField
          label="Email"
          value={editData.email}
          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
          disabled={!isEditing}
          fullWidth
        />

        <TextField
          label={t("password")}
          type="password"
          value={editData.password}
          onChange={(e) => setEditData({ ...editData, password: e.target.value })}
          disabled={!isEditing}
          fullWidth
        />

        <Divider />

        <Box display="flex" justifyContent="space-between">
          {!isEditing ? (
            <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
              Düzenle
            </Button>
          ) : (
            <Box display="flex" gap={2}>
              <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleCancel}>
                {t("cancel")}
              </Button>
              <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave}>
                {t("save")}
              </Button>
            </Box>
          )}

          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)}>
            Hesabı Sil
          </Button>
        </Box>
      </Box>

      {/* Hesap Silme Onay Dialogu */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Hesabı Sil</DialogTitle>
        <DialogContent>
          <Typography>Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t("cancel")}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">{t("delete")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;
