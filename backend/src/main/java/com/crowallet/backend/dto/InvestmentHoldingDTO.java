package com.crowallet.backend.dto;

import com.crowallet.backend.entity.AssetType;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvestmentHoldingDTO {
    private Long id;
    private Long accountId;
    private AssetType assetType;
    private String assetSymbol;
    private String assetName;
    private BigDecimal quantity;
    private BigDecimal purchasePrice;
    private BigDecimal currentPrice;
    private BigDecimal totalValue;
    private BigDecimal profitLoss;
}

