import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Divider,
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../config/ThemeContext";
import { backendUrl } from "../utils/envVariables";

const StockMarketPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await axios.get(`${backendUrl}/api/market/search?query=${searchQuery}`);
      setSearchResults(response.data);
      
      // If we have results, fetch their prices
      if (response.data.length > 0) {
        const symbols = response.data.map(stock => stock.symbol).join(",");
        fetchPrices(symbols);
      }
    } catch (error) {
      console.error("Error searching stocks:", error);
    } finally {
      setSearching(false);
    }
  };

  const fetchPrices = async (symbols) => {
    if (!symbols) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/market/prices?symbols=${symbols}`);
      setPrices(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error("Error fetching prices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Borsa Takip
        </Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Hisse senedi ara (örn: THYAO, GARAN)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="medium"
            />
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={searching}
              sx={{ px: 4 }}
            >
              {searching ? <CircularProgress size={24} color="inherit" /> : "Ara"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ p: 0 }}>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {searchResults.map((stock, index) => {
                const price = prices[stock.symbol];
                return (
                  <React.Fragment key={stock.id || index}>
                    <ListItem alignItems="center" sx={{ py: 2, px: 3 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                              {stock.symbol}
                            </Typography>
                            <Chip 
                              label={stock.type || "STOCK"} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {stock.name}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ textAlign: "right" }}>
                          {loading && !price ? (
                            <CircularProgress size={20} />
                          ) : (
                            <Typography variant="h6" sx={{ color: "success.main", fontWeight: 600 }}>
                              {price ? `${price} ₺` : "-"}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" display="block">
                            Son Fiyat
                          </Typography>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < searchResults.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}

      {searchResults.length === 0 && searchQuery && !searching && (
        <Box sx={{ textAlign: "center", mt: 4, opacity: 0.7 }}>
          <Typography variant="body1">
            Sonuç bulunamadı. Lütfen sembol veya şirket adı ile arama yapın.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default StockMarketPage;
