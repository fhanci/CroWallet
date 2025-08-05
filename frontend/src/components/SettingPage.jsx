import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SettingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const defaultIncomeOptions = t("defaultIncomeOptions", {
    returnObjects: true,
  });
  const defaultExpenseOptions = t("defaultExpenseOptions", {
    returnObjects: true,
  });

  const [incomeSources, setIncomeSources] = useState([]);
  const [expenseSources, setExpenseSources] = useState([]);
  const [incomeOptions, setIncomeOptions] = useState(defaultIncomeOptions);
  const [expenseOptions, setExpenseOptions] = useState(defaultExpenseOptions);
  const [newIncome, setNewIncome] = useState("");
  const [newExpense, setNewExpense] = useState("");

  useEffect(() => {
    const savedIncome =
      JSON.parse(localStorage.getItem(`incomeSources_${userId}`)) || [];
    const savedExpense =
      JSON.parse(localStorage.getItem(`expenseSources_${userId}`)) || [];

    setIncomeSources(savedIncome);
    setExpenseSources(savedExpense);
    setIncomeOptions([...new Set([...defaultIncomeOptions, ...savedIncome])]);
    setExpenseOptions([
      ...new Set([...defaultExpenseOptions, ...savedExpense]),
    ]);
  }, [userId]);

  const handleAddIncome = () => {
    if (newIncome.trim() && !incomeOptions.includes(newIncome)) {
      setIncomeOptions([...incomeOptions, newIncome]);
      setIncomeSources([...incomeSources, newIncome]);
      setNewIncome("");
    }
  };

  const handleAddExpense = () => {
    if (newExpense.trim() && !expenseOptions.includes(newExpense)) {
      setExpenseOptions([...expenseOptions, newExpense]);
      setExpenseSources([...expenseSources, newExpense]);
      setNewExpense("");
    }
  };

  const handleClose = () => navigate("/account");

  const handleSave = () => {
    localStorage.setItem(
      `incomeSources_${userId}`,
      JSON.stringify(incomeSources)
    );
    localStorage.setItem(
      `expenseSources_${userId}`,
      JSON.stringify(expenseSources)
    );
    handleClose();
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        color: "black",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 4, sm: 6 },
        maxWidth: 600,
        mx: "auto",
        mt: { xs: 2, sm: 5 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          textAlign: "center",
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        {t("settings")}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Autocomplete
          multiple
          options={incomeOptions}
          freeSolo
          value={incomeSources}
          onChange={(event, newValues) => setIncomeSources(newValues)}
          renderInput={(params) => (
            <TextField {...params} label={t("incomeSources")} fullWidth />
          )}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            label={t("newIncomeSource")}
            value={newIncome}
            onChange={(e) => setNewIncome(e.target.value)}
            fullWidth
          />
          <Button
            onClick={handleAddIncome}
            variant="contained"
            fullWidth
            sx={{ maxWidth: { sm: 150 } }}
          >
            {t("add")}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Autocomplete
          multiple
          options={expenseOptions}
          freeSolo
          value={expenseSources}
          onChange={(event, newValues) => setExpenseSources(newValues)}
          renderInput={(params) => (
            <TextField {...params} label="Gider Kaynakları" fullWidth />
          )}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mt: 2,
          }}
        >
          <TextField
            label={t("newExpenseSource")}
            value={newExpense}
            onChange={(e) => setNewExpense(e.target.value)}
            fullWidth
          />
          <Button
            onClick={handleAddExpense}
            variant="contained"
            fullWidth
            sx={{ maxWidth: { sm: 150 } }}
          >
            {t("add")}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Button onClick={handleClose} variant="outlined">
          {t("cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {t("apply")}
        </Button>
      </Box>
    </Box>
  );
};

export default SettingPage;
