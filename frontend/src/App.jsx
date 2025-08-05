import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Box } from "@mui/material";
import "./il8n";
import { useTranslation } from "react-i18next";

import Login from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";

import SettingPage from "./components/SettingPage";

import ProfileButton from "./components/ProfileButton";
import NotificationButton from "./components/NotificationButton";

import ProfilePage from "./pages/ProfilePage";
import NotificationPage from "./pages/NotificationPage";

import AccountPage from "./components/AccountPage";
import AccountCreatePage from "./pages/AccountCreatePage";
import AccountEditPage from "./pages/AccountEditPage";
import AccountDeletePage from "./pages/AccountDeletePage";

import TransactionHistoryPage from "./components/TransactionHistoryPage";
import IncomingTransferPage from "./pages/IncomingTransferPage";
import OutgoingTransferPage from "./pages/OutgoingTransferPage";
import AccountToAccountTransferPage from "./pages/AccountToAccountTransferPage";

import DebtPage from "./pages/DebtsPage";
import DebtCreatePage from "./pages/DebtCreatePage";
import DebtEditPage from "./pages/DebtEditPage";
import DebtPayPage from "./pages/DebtPayPage";

const MainApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if (location.pathname === "/login") {
      document.body.className = "unauthenticated";
    } else if (location.pathname === "/account" && isAuthenticated) {
      document.body.className = "authenticated";
    }
  }, [location, isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  return (
    <>
      {/* Sadece login dışında butonları göster */}
      {!isLoginPage && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 9999,
            display: "flex",
            gap: 3,
          }}
        >
          <NotificationButton />
          <ProfileButton />
        </Box>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />

        <Route path="/account" element={<DashboardLayout />}>
          <Route index element={<AccountPage />} />
        </Route>

        <Route path="/settings" element={<DashboardLayout />}>
          <Route index element={<SettingPage />} />
        </Route>

        <Route path="/notification" element={<DashboardLayout />}>
          <Route index element={<NotificationPage />} />
        </Route>

        <Route path="/profile" element={<DashboardLayout />}>
          <Route index element={<ProfilePage />} />
        </Route>

        <Route path="/transactions/:accountId" element={<DashboardLayout />}>
          <Route index element={<TransactionHistoryPage />} />
        </Route>

        <Route path="/account/create" element={<DashboardLayout />}>
          <Route index element={<AccountCreatePage />} />
        </Route>

        <Route path="/account/edit" element={<DashboardLayout />}>
          <Route index element={<AccountEditPage />} />
        </Route>

        <Route path="/account/delete" element={<DashboardLayout />}>
          <Route index element={<AccountDeletePage />} />
        </Route>

        <Route path="/transfer/incoming" element={<DashboardLayout />}>
          <Route index element={<IncomingTransferPage />} />
        </Route>

        <Route path="/transfer/outgoing" element={<DashboardLayout />}>
          <Route index element={<OutgoingTransferPage />} />
        </Route>

        <Route path="/transfer/accounts" element={<DashboardLayout />}>
          <Route index element={<AccountToAccountTransferPage />} />
        </Route>

        <Route path="/debt" element={<DashboardLayout />}>
          <Route index element={<DebtPage />} />
        </Route>

        <Route path="/debt/create" element={<DashboardLayout />}>
          <Route index element={<DebtCreatePage />} />
        </Route>

        <Route path="/debt/edit" element={<DashboardLayout />}>
          <Route index element={<DebtEditPage />} />
        </Route>

        <Route path="/debt/pay" element={<DashboardLayout />}>
          <Route index element={<DebtPayPage />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <MainApp />
    </Router>
  );
};

export default App;
