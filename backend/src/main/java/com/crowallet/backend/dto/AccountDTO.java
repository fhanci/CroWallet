package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class AccountDTO {
    private Long id;
    private String accountName;
    private BigDecimal balance;
    private String currency;
    private LocalDateTime updateDate;
    private Long userId;

    // Account type: CURRENCY or INVESTMENT
    private String accountType;

    // For CURRENCY accounts: BANK or CASH
    private String holdingType;

    // For INVESTMENT accounts: STOCK or GOLD
    private String assetType;

    // Legacy fields for backward compatibility
    private String assetSymbol;
    private BigDecimal quantity;
    private BigDecimal averageCost;
    private BigDecimal currentPrice;

    // Calculated total value (for investments)
    private BigDecimal totalValue;

    // Calculated profit/loss (for investments)
    private BigDecimal profitLoss;

    // Investment holdings for this account
    private List<InvestmentHoldingDTO> holdings;

    // Number of holdings
    private int holdingCount;
}
