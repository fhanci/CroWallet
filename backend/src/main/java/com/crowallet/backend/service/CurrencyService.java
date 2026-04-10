package com.crowallet.backend.service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.crowallet.backend.dto.ExchangeRateDTO;

import jakarta.annotation.PostConstruct;

@Service
public class CurrencyService {

    private static final Logger logger = LoggerFactory.getLogger(CurrencyService.class);
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Frankfurter API - Free, no API key required
    // Base currency is TRY, getting rates for USD and EUR
    private static final String FRANKFURTER_API_URL = "https://api.frankfurter.dev/v1/latest?base=TRY&symbols=USD,EUR";
    
    private Map<String, Double> cachedRates = new HashMap<>();
    private LocalDate lastUpdated;
    private String baseCurrency = "TRY";

    @PostConstruct
    public void init() {
        fetchExchangeRates();
    }

    /**
     * Fetches exchange rates from Frankfurter API every hour.
     * Frankfurter provides free exchange rates with EUR as base.
     */
    @Scheduled(fixedRate = 3600000) // Refresh every hour (3600000 ms)
    public void fetchExchangeRates() {
        try {
            logger.info("Fetching exchange rates from Frankfurter API...");
            
            FrankfurterResponse response = restTemplate.getForObject(
                FRANKFURTER_API_URL, 
                FrankfurterResponse.class
            );
            
            if (response != null && response.getRates() != null) {
                this.cachedRates = new HashMap<>();
                // Add TRY as base (1.0)
                this.cachedRates.put("TRY", 1.0);
                // Add other rates
                this.cachedRates.putAll(response.getRates());
                this.lastUpdated = response.getDate();
                this.baseCurrency = response.getBase();
                
                logger.info("Exchange rates updated successfully. Base: {}, Date: {}, Rates: {}", 
                    baseCurrency, lastUpdated, cachedRates);
            }
        } catch (Exception e) {
            logger.error("Failed to fetch exchange rates: {}", e.getMessage());
            // Keep using cached rates if fetch fails
        }
    }

    /**
     * Gets all cached exchange rates.
     */
    public ExchangeRateDTO getExchangeRates() {
        return new ExchangeRateDTO(baseCurrency, lastUpdated, cachedRates);
    }

    /**
     * Gets the exchange rate for a specific currency.
     */
    public Double getRate(String currency) {
        return cachedRates.get(currency.toUpperCase());
    }

    /**
     * Converts an amount from one currency to another.
     * All rates are based on EUR, so we convert through EUR.
     */
    public Double convert(Double amount, String fromCurrency, String toCurrency) {
        if (amount == null || fromCurrency == null || toCurrency == null) {
            return null;
        }
        
        String from = fromCurrency.toUpperCase();
        String to = toCurrency.toUpperCase();
        
        if (from.equals(to)) {
            return amount;
        }
        
        Double fromRate = cachedRates.get(from);
        Double toRate = cachedRates.get(to);
        
        if (fromRate == null || toRate == null) {
            logger.warn("Currency not found. From: {}, To: {}", from, to);
            return null;
        }
        
        // Convert to EUR first, then to target currency
        Double amountInEur = amount / fromRate;
        return amountInEur * toRate;
    }

    /**
     * Gets all supported currencies.
     */
    public Map<String, Double> getCachedRates() {
        return new HashMap<>(cachedRates);
    }

    /**
     * Forces a refresh of exchange rates.
     */
    public ExchangeRateDTO refreshRates() {
        fetchExchangeRates();
        return getExchangeRates();
    }

    /**
     * Inner class to deserialize Frankfurter API response.
     */
    private static class FrankfurterResponse {
        private String base;
        private LocalDate date;
        private Map<String, Double> rates;

        public String getBase() {
            return base;
        }

        public void setBase(String base) {
            this.base = base;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public Map<String, Double> getRates() {
            return rates;
        }

        public void setRates(Map<String, Double> rates) {
            this.rates = rates;
        }
    }
}
