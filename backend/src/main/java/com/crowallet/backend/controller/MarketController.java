package com.crowallet.backend.controller;

import com.crowallet.backend.entity.StockMetadata;
import com.crowallet.backend.repository.StockMetadataRepository;
import com.crowallet.backend.service.MarketDataService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*")
public class MarketController {

    private final MarketDataService marketDataService;
    private final StockMetadataRepository stockRepository;

    public MarketController(MarketDataService marketDataService, StockMetadataRepository stockRepository) {
        this.marketDataService = marketDataService;
        this.stockRepository = stockRepository;
    }

    @GetMapping("/search")
    public List<StockMetadata> searchStocks(@RequestParam String query) {
        return stockRepository.searchStocks(query);
    }

    @GetMapping("/prices")
    public Map<String, BigDecimal> getPrices(@RequestParam(required = false) List<String> symbols) {
        return marketDataService.getPrices(symbols);
    }
}
