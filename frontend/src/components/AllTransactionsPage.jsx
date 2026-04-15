import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TextField,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableRow,
  IconButton,
  Collapse,
  Paper,
  Button,
  Menu,
  MenuItem,
  InputAdornment,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import axios from "axios";
import { backendUrl } from "../utils/envVariables";

const AllTransactionsPage = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [dateFilterDialogOpen, setDateFilterDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("token");
  const [allMoneyAccounts, setAllMoneyAccounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/transfers/getUserAllTransfers?userId=${user.id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        const allMoneyAccounts = await axios.get(`${backendUrl}/api/accounts/get-money-accounts-active-passive?userId=${user.id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        setAllMoneyAccounts(allMoneyAccounts.data);
        console.log("Tüm para hesapları:", allMoneyAccounts.data);

        const sortedData = response.data.sort(
          (b,a) => new Date(b.transactionDateTime) - new Date(a.transactionDateTime)
        );

        const transactionsWithAccountInfo = await Promise.all(
          sortedData.map(async (transaction,idx) => {
            const accountInfo = await getMoneyAccountInfo(transaction.moneyAccountId);
            return { ...transaction, accountName: accountInfo?.accountName || "-", id: idx};
          })
        );

        //console.log(transactionsWithAccountInfo)


        setTransactions(transactionsWithAccountInfo);
        setFilteredTransactions(transactionsWithAccountInfo);
      } catch (error) {
        console.error("Hata:", error);
        setError("Bir hata oluştu, lütfen tekrar deneyin.");
      }
    };

    fetchData();
  }, [user.id]);

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filterType) {
      filtered = filtered.filter((t) => t.type === filterType);
    }
    if (startDate && endDate) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.transactionDateTime);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.details ? t.details.toLowerCase() : "").includes(sq) ||
          (t.category ? t.category.toLowerCase() : "").includes(sq) ||
          (t.person ? t.person.toLowerCase() : "").includes(sq) || ///////////////////////////////////////////////////////////////////////////////
          (t.account?.accountName ? t.account.accountName.toLowerCase() : "").includes(sq)
      );
    }

    filtered.sort((a, b) => new Date(b.transactionDateTime) - new Date(a.transactionDateTime));
    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [transactions, filterType, startDate, endDate, searchQuery]);

  const handleExpandTransaction = (transactionId) => {
    setExpandedTransaction((prev) =>
      prev === transactionId ? null : transactionId
    );
  };

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const applyFilter = (type) => {
    setFilterType(type);
    handleCloseMenu();
  };

  const handleOpenDateFilter = () => {
    setDateFilterDialogOpen(true);
    handleCloseMenu();
  };
  const handleCloseDateFilter = () => setDateFilterDialogOpen(false);
  const applyDateFilter = () => handleCloseDateFilter();
  const clearFilter = () => {
    setFilterType("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const getIncomeOrExpense = (transaction) => {
    if (transaction.type === "inter-account") {
      if (transaction.outputPreviousBalance !== null) {
        return t("expense");
      }
      if (transaction.inputPreviousBalance !== null) {
        return t("income");
      }
      return "-";
    }
    return transaction.type === "incoming" ? t("income") : transaction.type === "debt_payment" ? t("debtPayment") : t("expense");
  };

  const getMoneyAccountInfo = async (moneyAccountId) => {
     const response = await axios.get(
      `${backendUrl}/api/accounts/get-money-account?moneyAccountId=${moneyAccountId}`,
      {
        headers:
        {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );
    return response.data;
  };

  const getTransactionTypeLabel = (transaction) => {
    const incomeOrExpense = getIncomeOrExpense(transaction);

    if (transaction.type === "inter-account") {
      const otherAccountName = transaction.person || "";
      return `${t("interAccount")} - ${incomeOrExpense}${
        otherAccountName ? " - " + otherAccountName : ""
      }`;
    }

    if (transaction.type === "debt_payment") {
      const detay = transaction.details || "";
      return `${t("debtPayment")}${detay ? " - " + detay : ""}`;
    }

    const kategori = transaction.category || "";
    const detay = transaction.details || "";
    return `${kategori} - ${incomeOrExpense}${detay ? " - " + detay : ""}`;
  };

  return (
    <Container sx={{ px: { xs: 1, sm: 2, md: 4 }, mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/account")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          Tüm Hesap Hareketleri
        </Typography>
        <Chip label={`${transactions.length} işlem`} size="small" color="primary" />
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "flex-start",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
          px: { xs: 1, sm: 3 },
        }}
      >
        <Button variant="contained" onClick={handleOpenMenu}>
          {t("filter")}
        </Button>
        <Button
          variant="contained"
          onClick={clearFilter}
          disabled={!filterType && !startDate && !endDate && !searchQuery}
        >
          {t("clear")}
        </Button>

        <Box sx={{ minWidth: 200, maxWidth: 300 }}>
          <TextField
            variant="outlined"
            size="small"
            onChange={handleSearch}
            placeholder={t("searchPlaceholder")}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => applyFilter("incoming")}>
          {t("incomingTransaction")}
        </MenuItem>
        <MenuItem onClick={() => applyFilter("outgoing")}>
          {t("outgoingTransaction")}
        </MenuItem>
        <MenuItem onClick={() => applyFilter("inter-account")}>
          {t("interAccount")}
        </MenuItem>
        <MenuItem onClick={() => applyFilter("debt_payment")}>
          {t("debtPayment")}
        </MenuItem>
        <MenuItem onClick={handleOpenDateFilter}>{t("filterByDate")}</MenuItem>
      </Menu>

      <TableContainer
        component={Paper}
        sx={{ mt: 4, mx: { xs: 0, sm: 2, md: 6 } }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "grey.100" }}>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "inherit" }}></TableCell>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "inherit" }}>
                <strong>Hesap</strong>
              </TableCell>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "inherit" }}>
                <strong>{t("transactionType")}</strong>
              </TableCell>
              <TableCell align="right" sx={{ color: isDarkMode ? "#fff" : "inherit" }}>
                <strong>{t("amount")} </strong>
              </TableCell>
              <TableCell align="center" sx={{ color: isDarkMode ? "#fff" : "inherit" }}>
                <strong>{t("enteredDate")} </strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, idx) => {
                const isActive = allMoneyAccounts.find((acc) => acc.id === transaction.moneyAccountId)?.isActive;
                const textColorisPassive = "rgba(69, 60, 60, 0.2)";
                const incomeOrExpense = getIncomeOrExpense(transaction);
                const isIncome = incomeOrExpense === t("income");
                const textColor = isIncome 
                  ? (isDarkMode ? "#4caf50" : "#0f5132") 
                  : (isDarkMode ? "#f44336" : "#842029");

                return (
                  <React.Fragment key={idx}>
                    <TableRow
                      onClick={() => handleExpandTransaction(transaction.id)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isDarkMode 
                          ? (idx % 2 === 0 ? "rgba(255, 255, 255, 0.03)" : "transparent")
                          : (idx % 2 === 0 ? "#f9f9f9" : "white"),
                        "&:hover": {
                          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e6f2ff",
                        },
                      }}
                    >
                      <TableCell>
                        <IconButton size="small">
                          <ExpandMoreIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.accountName + (isActive ? "" : " (Pasif Hesap)")} 
                          size="small" 
                          variant="outlined"
                          color= {isActive ? textColor : textColorisPassive }
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/transactions/${transaction.moneyAccountId}`);
                          }}
                          sx={{ cursor: "pointer" }}
                        />
                      </TableCell>
                      
                      <TableCell sx={{ color: isActive ? textColor : textColorisPassive }}>
                        {getTransactionTypeLabel(transaction)}
                      </TableCell>
                      <TableCell sx={{ color: isActive ? textColor : textColorisPassive }}>
                        {(isIncome ? "+ " : "- ") +
                          Math.abs(transaction.amount).toLocaleString("tr-TR") +
                          " " +
                          (transaction.currency || "")}
                      </TableCell>
                      <TableCell sx={{ color: isActive ? textColor : textColorisPassive }}>
                        {new Date(transaction.transactionDateTime).toLocaleString("tr-TR")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0 }}>
                        <Collapse
                          in={expandedTransaction === transaction.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ py: 2, px: 4, bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "grey.50" }}>
                            <Typography variant="body2">
                              <strong>Hesap:</strong> {transaction.accountName}
                            </Typography>
                            <Typography variant="body2">
                              <strong>{t("category")}:</strong> {transaction.category}
                            </Typography>
                            <Typography variant="body2">
                              <strong>{t("description")}:</strong> {transaction.description || "-"}
                            </Typography>
                            <Typography variant="body2">
                              <strong>{t("transactionDate")}:</strong>{" "}
                              {new Date(transaction.transactionDateTime).toLocaleString("tr-TR")}
                            </Typography>
                            {transaction.inputPreviousBalance !== null && (
                              <Typography variant="body2">
                                <strong>{t("previousBalance")}:</strong> {transaction.inputPreviousBalance.toLocaleString("tr-TR")}
                              </Typography>
                            )}
                            {transaction.inputNextBalance !== null && (
                              <Typography variant="body2">
                                <strong>{t("nextBalance")}:</strong> {transaction.inputNextBalance.toLocaleString("tr-TR")}
                              </Typography>
                            )}
                            {transaction.outputPreviousBalance !== null && (
                              <Typography variant="body2">
                                <strong>{t("previousBalance")}:</strong> {transaction.outputPreviousBalance.toLocaleString("tr-TR")}
                              </Typography>
                            )}
                            {transaction.outputNextBalance !== null && (
                              <Typography variant="body2">
                                <strong>{t("nextBalance")}:</strong> {transaction.outputNextBalance.toLocaleString("tr-TR")}
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", py: 3 }}>
                    {t("noTransaction")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dateFilterDialogOpen} disableScrollLock>
        <DialogTitle>{t("filterByDate")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("startDateLabel")}
            type="datetime-local"
            inputProps={{step: 1}}
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t("endDateLabel")}
            type="datetime-local"
            inputProps={{step: 1}}
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDateFilter}>
            {t("cancel")}
          </Button>
          <Button onClick={applyDateFilter} variant="contained" color="success">
            {t("filter")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AllTransactionsPage;

