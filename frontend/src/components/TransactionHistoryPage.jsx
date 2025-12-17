import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { useUser } from "../config/UserStore";
import { useTheme } from "../config/ThemeContext";
import axios from "axios";
import Graph from "./Graph";
import { backendUrl } from "../utils/envVariables";

const TransactionHistoryPage = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [error, setError] = useState();
  const [filterType, setFilterType] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountName, setAccountName] = useState();
  const [dateFilterDialogOpen, setDateFilterDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [searchQuery, setSearchQuery] = useState();
  const [accountBalance, setAccountBalance] = useState(null);
  const [accountCurrency, setAccountCurrency] = useState();
  const token = localStorage.getItem("token");
  const [graphTransactions, setGraphTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/transfers/get/${accountId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );

        // Filter transactions by accountId
        const accountTransactions = response.data.filter(
          (t) => t.account && t.account.id.toString() === accountId.toString()
        );

        if (accountTransactions.length > 0) {
          setAccountName(
            `${accountTransactions[0].account.accountName} - ${accountTransactions[0].account.currency}`
          );
        }

        const sortedData = accountTransactions.sort(
          (a, b) => new Date(b.createDate) - new Date(a.createDate)
        );
        setTransactions(sortedData);
        setFilteredTransactions(sortedData);
        setGraphTransactions(sortedData);
      } catch (error) {
        console.error("Hata:", error);
        setError("Bir hata oluştu, lütfen tekrar deneyin.");
      }
    };

    if (accountId) {
      fetchData();
      fetchAccountBalance();
    }
  }, [accountId]);

  // güncel bakiye için
  const fetchAccountBalance = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/accounts/${accountId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      setAccountBalance(res.data.balance);
      setAccountCurrency(res.data.currency);
    } catch (e) {
      console.error("Bakiye çekme hatası:", e);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filterType) {
      filtered = filtered.filter((t) => t.type === filterType);
      console.log(filterTyp)
    }
    if (startDate && endDate) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.createDate);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
      setGraphTransactions(filtered);
    }
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.details ? t.details.toLowerCase() : "").includes(sq) ||
          (t.category ? t.category.toLowerCase() : "").includes(sq) ||
          (t.person ? t.person.toLowerCase() : "").includes(sq)
      );
    }

    filtered.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
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
    setFilterType();
    setStartDate();
    setEndDate();
    setSearchQuery();
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const getIncomeOrExpense = (transaction) => {
    if (transaction.type === "inter-account") {
      if (transaction.account.id.toString() === accountId.toString()) {
        return t("expense");
      }
      if (transaction.receiverId.toString() === accountId.toString()) {
        return t("income");
      }
      return "problem var";
    }

    return transaction.type === "incoming" ? t("income") : t("expense");
  };

  const getTransactionTypeLabel = (transaction) => {
    const incomeOrExpense = getIncomeOrExpense(transaction);

    if (transaction.type === "inter-account") {
      const otherAccountName = transaction.person || "";
      return `${t("interAccount")} - ${incomeOrExpense}${
        otherAccountName ? " - " + otherAccountName : ""
      }`;
    }

    const kategori = transaction.category || "";
    const detay = transaction.details || "";
    return `${kategori} - ${incomeOrExpense}${detay ? " - " + detay : ""}`;
  };

  return (
    <Container sx={{ px: { xs: 1, sm: 2, md: 4 }, mt: 2 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, textAlign: { xs: "center", sm: "left" } }}
      >
        {accountName
          ? `${accountName} - ${t("transactionHistoryTitle")}`
          : t("transactionHistoryTitle")}
      </Typography>

      {/* güncel bakiye için */}
      {accountBalance !== null && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: "rgba(159, 177, 240, 0.35)",
            borderRadius: 1,
            maxWidth: 300,
            mx: "auto",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              mb: 1,
              color: "darkgreen",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {t("currentBalance")}: {accountBalance} {accountCurrency}
          </Typography>
        </Box>
      )}

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
      {filteredTransactions.length > 0 && (
        <Box
          sx={{
            mt: 4,
            mx: "auto",
            px: { xs: 2, sm: 4 },
            width: "100%",
            maxWidth: "1000px",
            minHeight: 400,
            borderRadius: 2,
            boxShadow: 3,
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("AccountBalanceChart")}
          </Typography>
          <Graph transactions={graphTransactions} accountId={accountId} />
        </Box>
      )}
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
        <MenuItem onClick={handleOpenDateFilter}>{t("filterByDate")}</MenuItem>
      </Menu>

      <TableContainer
        component={Paper}
        sx={{ mt: 4, mx: { xs: 0, sm: 2, md: 6 } }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>
                <strong>{t("transactionType")}</strong>
              </TableCell>
              <TableCell align="right">
                <strong>{t("amount")} </strong>
              </TableCell>
              <TableCell align="center">
                <strong>{t("enteredDate")} </strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, idx) => {
                const incomeOrExpense = getIncomeOrExpense(transaction);
                const isIncome = incomeOrExpense === t("income");
                const textColor = isIncome 
                  ? (isDarkMode ? "#4caf50" : "#0f5132") 
                  : (isDarkMode ? "#f44336" : "#842029");

                return (
                  <React.Fragment key={transaction.id}>
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
                        <IconButton>
                          <ExpandMoreIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ color: textColor }}>
                        {getTransactionTypeLabel(transaction)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: textColor }}>
                        {(isIncome ? "+ " : "- ") +
                          Math.abs(transaction.amount) +
                          " " +
                          transaction.account.currency}
                      </TableCell>
                      <TableCell align="center" sx={{ color: textColor }}>
                        {transaction.date}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Collapse
                          in={expandedTransaction === transaction.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ mt: 2, pl: 2 }}>
                            <Typography variant="body2">
                              {t("category")}: {transaction.category}
                            </Typography>
                            <Typography variant="body2">
                              {t("description")}: {transaction.description}
                            </Typography>
                            <Typography variant="body2">
                              {t("transactionDate")}:{" "}
                              {new Date(transaction.createDate).toLocaleString(
                                "tr-TR"
                              )}
                            </Typography>
                            <Typography variant="body2">
                              {t("enteredDate")}: {transaction.date}
                            </Typography>
                            {transaction.inputPreviousBalance !== null && (
                              <Typography variant="body2">
                                {t("previousBalance")}:{" "}
                                {transaction.inputPreviousBalance}
                              </Typography>
                            )}
                            {transaction.inputNextBalance !== null && (
                              <Typography variant="body2">
                                {t("nextBalance")}:{" "}
                                {transaction.inputNextBalance}
                              </Typography>
                            )}
                            {transaction.outputPreviousBalance !== null && (
                              <Typography variant="body2">
                                {t("previousBalance")}:{" "}
                                {transaction.outputPreviousBalance}
                              </Typography>
                            )}
                            {transaction.outputNextBalance !== null && (
                              <Typography variant="body2">
                                {t("nextBalance")}:{" "}
                                {transaction.outputNextBalance}
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
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="textSecondary">
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
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t("endDateLabel")}
            type="datetime-local"
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

export default TransactionHistoryPage;
