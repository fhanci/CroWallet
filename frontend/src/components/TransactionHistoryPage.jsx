import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TextField, TableHead, Dialog, DialogTitle, DialogContent, DialogActions,
  TableRow, IconButton, Collapse, Paper, Button, Menu, MenuItem, InputAdornment
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const TransactionHistoryPage = () => {
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountName, setAccountName] = useState("");
  const [dateFilterDialogOpen, setDateFilterDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountBalance, setAccountBalance] = useState(null); // güncel bakiye için
  const [accountCurrency, setAccountCurrency] = useState("");// güncel bakiye için


  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8082/api/transfers`);
        if (!response.ok) throw new Error("Hesap hareketleri getirilemedi.");
        const data = await response.json();

        const filteredData = data.filter(
          (transaction) => transaction.account.id.toString() === accountId.toString()
        );
        

        if (filteredData.length > 0) {
          setAccountName(`${filteredData[0].account.accountName} - ${filteredData[0].account.currency}`);
        }

        const sortedData = filteredData.sort(
          (a, b) => new Date(b.createDate) - new Date(a.createDate)
        );

        setTransactions(sortedData);
        setFilteredTransactions(sortedData);
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
      const res = await fetch(`http://localhost:8082/api/accounts/${accountId}`);
      if (!res.ok) throw new Error("Hesap bilgileri getirilemedi.");
      const account = await res.json();
      setAccountBalance(account.balance);
      setAccountCurrency(account.currency);
    } catch (e) {
      console.error("Bakiye çekme hatası:", e);
    }
  };

  
  const applyFilters = () => {
    let filtered = [...transactions];

    if (filterType) {
      filtered = filtered.filter((t) => t.type === filterType);
    }
    if (startDate && endDate) {
      filtered = filtered.filter((t) => {
        const date = new Date(t.createDate);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
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
    setExpandedTransaction((prev) => (prev === transactionId ? null : transactionId));
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
      if (transaction.outputPreviousBalance !== null && transaction.account.id.toString() === accountId.toString()) {
        return "Gider";
      }
      if (transaction.inputPreviousBalance !== null && transaction.account.id.toString() === accountId.toString()) {
        return "Gelir";
      }
      return "problem var";
    }
  
    return transaction.type === "incoming" ? "Gelir" : "Gider";
  };
  
  const getTransactionTypeLabel = (transaction) => {
    const incomeOrExpense = getIncomeOrExpense(transaction);
  
    if (transaction.type === "inter-account") {
      const otherAccountName = transaction.person || "";
      return `Hesaplar Arası - ${incomeOrExpense}${otherAccountName ? " - " + otherAccountName : ""}`;
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
        {accountName ? `${accountName} - Hesap Hareketleri` : "Hesap Hareketleri"}
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
            Güncel Bakiye: {accountBalance} {accountCurrency}
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
          Filtrele
        </Button>
        <Button
          variant="contained"
          onClick={clearFilter}
          disabled={!filterType && !startDate && !endDate && !searchQuery}
        >
          Kaldır
        </Button>

        <Box sx={{ minWidth: 200, maxWidth: 300 }}>
          <TextField
            variant="outlined"
            size="small"
            onChange={handleSearch}
            placeholder="Ara..."
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => applyFilter("incoming")}>Gelen İşlem</MenuItem>
        <MenuItem onClick={() => applyFilter("outgoing")}>Giden İşlem</MenuItem>
        <MenuItem onClick={() => applyFilter("inter-account")}>Hesaplar Arası</MenuItem>
        <MenuItem onClick={handleOpenDateFilter}>Tarihe Göre Filtrele</MenuItem>
      </Menu>

      <TableContainer component={Paper} sx={{ mt: 4, mx: { xs: 0, sm: 2, md: 6 } }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell><strong>İşlem Türü</strong></TableCell>
              <TableCell align="right"><strong>Miktar</strong></TableCell>
              <TableCell align="center"><strong>Girilen Tarih</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, idx) => {
                const incomeOrExpense = getIncomeOrExpense(transaction);
                const isIncome = incomeOrExpense === "Gelir";
                const textColor = isIncome ? "#0f5132" : "#842029";

                return (
                  <React.Fragment key={transaction.id}>
                    <TableRow
                      onClick={() => handleExpandTransaction(transaction.id)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                        "&:hover": {
                          backgroundColor: "#e6f2ff",
                        },
                      }}
                    >
                      <TableCell>
                        <IconButton>
                          <ExpandMoreIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ color: textColor }}>{getTransactionTypeLabel(transaction)}</TableCell>
                      <TableCell align="right" sx={{ color: textColor }}>
                        {(isIncome ? "+ " : "- ") + Math.abs(transaction.amount) + " " + transaction.account.currency}
                      </TableCell>
                      <TableCell align="center" sx={{ color: textColor }}>
                        {transaction.date}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Collapse in={expandedTransaction === transaction.id} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2, pl: 2 }}>
                            <Typography variant="body2">Kategori: {transaction.category}</Typography>
                            <Typography variant="body2">Açıklama: {transaction.description}</Typography>
                            <Typography variant="body2">
                              İşlem Tarihi: {new Date(transaction.createDate).toLocaleString("tr-TR")}
                            </Typography>
                            <Typography variant="body2">Girilen Tarih: {transaction.date}</Typography>
                            {transaction.inputPreviousBalance !== null && (
                              <Typography variant="body2">Önceki Bakiye: {transaction.inputPreviousBalance}</Typography>
                            )}
                            {transaction.inputNextBalance !== null && (
                              <Typography variant="body2">Sonraki Bakiye: {transaction.inputNextBalance}</Typography>
                            )}
                            {transaction.outputPreviousBalance !== null && (
                              <Typography variant="body2">Önceki Bakiye: {transaction.outputPreviousBalance}</Typography>
                            )}
                            {transaction.outputNextBalance !== null && (
                              <Typography variant="body2">Sonraki Bakiye: {transaction.outputNextBalance}</Typography>
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
                    Bu hesapta henüz hareket bulunmuyor.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dateFilterDialogOpen}>
        <DialogTitle>Tarihe Göre Filtrele</DialogTitle>
        <DialogContent>
          <TextField
            label="Başlangıç Tarihi ve Saati"
            type="datetime-local"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Bitiş Tarihi ve Saati"
            type="datetime-local"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDateFilter}>İptal</Button>
          <Button onClick={applyDateFilter} variant="contained" color="success">Filtrele</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransactionHistoryPage;
