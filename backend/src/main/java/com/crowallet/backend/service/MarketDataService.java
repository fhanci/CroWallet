package com.crowallet.backend.service;

import com.crowallet.backend.entity.StockMetadata;
import com.crowallet.backend.repository.StockMetadataRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MarketDataService {

    private static final Logger logger = LoggerFactory.getLogger(MarketDataService.class);
    private static final String YAHOO_FINANCE_URL = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=";

    private final StockMetadataRepository stockRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // In-memory cache for real-time prices
    private final ConcurrentHashMap<String, BigDecimal> priceCache = new ConcurrentHashMap<>();

    public MarketDataService(StockMetadataRepository stockRepository) {
        this.stockRepository = stockRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, BigDecimal> getPrices(List<String> symbols) {
        if (symbols == null || symbols.isEmpty()) {
            return priceCache;
        }
        return priceCache.entrySet().stream()
                .filter(entry -> symbols.contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
    
    public BigDecimal getPrice(String symbol) {
        return priceCache.get(symbol);
    }

    @Scheduled(fixedRate = 900000) // 15 minutes
    @PostConstruct
    public void updateMarketData() {
        logger.info("Starting market data update...");
        List<StockMetadata> allStocks = stockRepository.findAll();
        if (allStocks.isEmpty()) {
            logger.info("No stocks found in database.");
            return;
        }

        List<String> symbols = allStocks.stream()
                .map(StockMetadata::getSymbol)
                .collect(Collectors.toList());

        // Chunk symbols into groups of 20
        int chunkSize = 20;
        for (int i = 0; i < symbols.size(); i += chunkSize) {
            List<String> chunk = symbols.subList(i, Math.min(i + chunkSize, symbols.size()));
            fetchAndCachePrices(chunk);
        }
        logger.info("Market data update completed. Cached {} prices.", priceCache.size());
    }

    private void fetchAndCachePrices(List<String> symbols) {
        String joinedSymbols = String.join(",", symbols);
        String url = YAHOO_FINANCE_URL + joinedSymbols;

        try {
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode results = root.path("quoteResponse").path("result");

            if (results.isArray()) {
                for (JsonNode quote : results) {
                    String symbol = quote.path("symbol").asText();
                    double price = quote.path("regularMarketPrice").asDouble();
                    
                    if (price > 0) {
                        priceCache.put(symbol, BigDecimal.valueOf(price));
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching data for chunk: {}", joinedSymbols, e);
        }
    }
}
