package com.crowallet.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crowallet.backend.dto.ExchangeRateDTO;
import com.crowallet.backend.service.CurrencyService;

@RestController
@RequestMapping("/api/currencies")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    /**
     * Get all exchange rates.
     * Returns EUR, USD, and TRY rates with EUR as base currency.
     */
    @GetMapping("/rates")
    public ResponseEntity<ExchangeRateDTO> getRates() {
        return ResponseEntity.ok(currencyService.getExchangeRates());
    }

    /**
     * Get rate for a specific currency.
     */
    @GetMapping("/rate")
    public ResponseEntity<Map<String, Object>> getRate(@RequestParam String currency) {
        Double rate = currencyService.getRate(currency);
        if (rate == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Currency not found",
                "currency", currency
            ));
        }
        return ResponseEntity.ok(Map.of(
            "currency", currency.toUpperCase(),
            "rate", rate,
            "base", "EUR"
        ));
    }

    /**
     * Convert amount from one currency to another.
     * Supported currencies: EUR, USD, TRY
     */
    @GetMapping("/convert")
    public ResponseEntity<Map<String, Object>> convert(
            @RequestParam Double amount,
            @RequestParam String from,
            @RequestParam String to) {
        
        Double convertedAmount = currencyService.convert(amount, from, to);
        
        if (convertedAmount == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Conversion failed. Check currency codes.",
                "supportedCurrencies", "EUR, USD, TRY"
            ));
        }
        
        return ResponseEntity.ok(Map.of(
            "amount", amount,
            "from", from.toUpperCase(),
            "to", to.toUpperCase(),
            "convertedAmount", convertedAmount,
            "rate", currencyService.getRate(to) / currencyService.getRate(from)
        ));
    }

    /**
     * Force refresh exchange rates from Frankfurter API.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ExchangeRateDTO> refreshRates() {
        return ResponseEntity.ok(currencyService.refreshRates());
    }
}
