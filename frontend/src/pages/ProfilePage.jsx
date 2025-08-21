import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUserInfo } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [deleteVerifyDialogOpen, setDeleteVerifyDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteVerifyError, setDeleteVerifyError] = useState("");

  const currentLang = i18n.language;

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    if (user)
      setEditData({
        name: user.name,
        email: user.email,
        password: user.password,
      });
    setIsEditing(false);
  };
  const handleVerifyAndSave = async () => {
    try {
      const verifyResponse = await axios.post(
        "http://localhost:8082/api/users/verify-password",
        {
          password: currentPassword,
          id: user.id,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      if (!verifyResponse.data) {
        setVerifyError(t("invalidCurrentPassword"));
        return;
      }

      const updateResponse = await axios.put(
        `http://localhost:8082/api/users/update/${user.id}`,
        editData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      setUserInfo(updateResponse.data);
      setIsEditing(false);
      setVerifyDialogOpen(false);
      setCurrentPassword("");
      setVerifyError("");
      setSnackbar({
        open: true,
        message: t("profileUpdated"),
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: t("updateFailed"),
        severity: "error",
      });
    }
  };

  const handleVerifyAndDelete = async () => {
    try {
      const verifyResponse = await axios.post(
        "http://localhost:8082/api/users/verify-password",
        {
          password: deletePassword,
          id: user.id,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      if (!verifyResponse.data) {
        setDeleteVerifyError(t("invalidCurrentPassword"));
        return;
      }

      await axios.delete(`http://localhost:8082/api/users/delete/${user.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      setSnackbar({
        open: true,
        message: t("accountDeleted"),
        severity: "info",
      });
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: t("deleteFailed"),
        severity: "error",
      });
    } finally {
      setDeleteVerifyDialogOpen(false);
      setDeletePassword("");
      setDeleteVerifyError("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h4">{t("profileTitle")}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {t("profileSubtitle")}
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
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
          onChange={(e) =>
            setEditData({ ...editData, password: e.target.value })
          }
          disabled={!isEditing}
          fullWidth
        />

        <Divider />

        <Box display="flex" justifyContent="space-between">
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              {t("edit")}
            </Button>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={handleCancel}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={() => setVerifyDialogOpen(true)}
                >
                  {t("save")}
                </Button>
              </Box>
            </Box>
          )}

          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            {t("deleteConfirmTitle")}
          </Button>
        </Box>
      </Box>

      {/* Hesap Silme Onay Dialogu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("deleteConfirmText")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => setDeleteVerifyDialogOpen(true)}
            color="error"
            variant="contained"
          >
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
      >
        <DialogTitle>{t("verifyPasswordTitle")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("currentPassword")}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            required
          />
          {verifyError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {verifyError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="contained" onClick={handleVerifyAndSave}>
            {t("confirm")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteVerifyDialogOpen}
        onClose={() => setDeleteVerifyDialogOpen(false)}
      >
        <DialogTitle>{t("verifyPasswordTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("deleteConfirmText")}</Typography>
          <TextField
            label={t("currentPassword")}
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            fullWidth
            required
            sx={{ mt: 2 }}
          />
          {deleteVerifyError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {deleteVerifyError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVerifyDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleVerifyAndDelete}
          >
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dil Seçici */}
      <FormControl fullWidth sx={{ mt: 4 }}>
        <InputLabel id="language-select-label">
          {t("chooseLanguage")}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={currentLang}
          label={t("chooseLanguage")}
          onChange={changeLanguage}
        >
          <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
          <MenuItem value="en">🇬🇧 English</MenuItem>
          <MenuItem value="ar">🇸🇦 العربية</MenuItem>
          <MenuItem value="es">🇪🇸 Español</MenuItem>
        </Select>
      </FormControl>
    </Container>
  );
};

export default ProfilePage;
