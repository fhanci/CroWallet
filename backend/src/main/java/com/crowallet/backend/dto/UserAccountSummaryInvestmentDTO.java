package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UserAccountSummaryInvestmentDTO {
    private Long id;
    private String accountName;
    private BigDecimal balance;
    private Long userId;
    private String assetType;
    private BigDecimal profitLoss;
    private List<AssetResponse> holdings;
    private int holdingCount;
    private String accountType;
    private BigDecimal totalValue;
    
}
