import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./il8n";
import { useTranslation } from "react-i18next";

import Login from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";

// MUI Theme with disabled scroll lock
const muiTheme = createTheme({
  components: {
    MuiModal: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiDialog: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiDrawer: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
  },
});

import SettingsPage from "./pages/SettingsPage";
import IncomePage from "./components/IncomePage";

import ProfilePage from "./pages/ProfilePage";
import NotificationPage from "./pages/NotificationPage";

import AccountPage from "./components/AccountPage";
import AccountCreatePage from "./pages/AccountCreatePage";
import MyAccountsPage from "./pages/MyAccountsPage";

import TransactionHistoryPage from "./components/TransactionHistoryPage";
import AllTransactionsPage from "./components/AllTransactionsPage";
import IncomingTransferPage from "./pages/IncomingTransferPage";
import OutgoingTransferPage from "./pages/OutgoingTransferPage";
import AccountToAccountTransferPage from "./pages/AccountToAccountTransferPage";

import DebtPage from "./pages/DebtsPage";
import DebtCreatePage from "./pages/DebtCreatePage";
import InstallmentsPage from "./pages/InstallmentsPage";

import InvestmentAccountDetailPage from "./pages/InvestmentAccountDetailPage";
import MyStockAccountsPage from "./pages/MyStockAccountsPage";
import MyGoldAccountsPage from "./pages/MyGoldAccountsPage";

import { UserProvider } from "./config/UserStore";
import ErrorPage from "./components/ErrorPage";
import { ThemeProvider } from "./config/ThemeContext";
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

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route path="/account" element={<DashboardLayout />}>
          <Route index element={<AccountPage />} />
        </Route>

        <Route path="/settings" element={<DashboardLayout />}>
          <Route index element={<SettingsPage />} />
        </Route>

        <Route path="/income" element={<DashboardLayout />}>
          <Route index element={<IncomePage />} />
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

        <Route path="/all-transactions" element={<DashboardLayout />}>
          <Route index element={<AllTransactionsPage />} />
        </Route>

        <Route path="/account/create" element={<DashboardLayout />}>
          <Route index element={<AccountCreatePage />} />
        </Route>

        <Route path="/accounts/my" element={<DashboardLayout />}>
          <Route index element={<MyAccountsPage />} />
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

        <Route path="/debt/installments" element={<DashboardLayout />}>
          <Route index element={<InstallmentsPage />} />
        </Route>

        <Route path="/investment/:accountId" element={<DashboardLayout />}>
          <Route index element={<InvestmentAccountDetailPage />} />
        </Route>

        <Route path="/investment/stocks" element={<DashboardLayout />}>
          <Route index element={<MyStockAccountsPage />} />
        </Route>

        <Route path="/investment/gold" element={<DashboardLayout />}>
          <Route index element={<MyGoldAccountsPage />} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <UserProvider>
      <ThemeProvider>
        <MuiThemeProvider theme={muiTheme}>
          <CssBaseline />
          <Router>
            <MainApp />
          </Router>
        </MuiThemeProvider>
      </ThemeProvider>
    </UserProvider>
  );
};

export default App;
