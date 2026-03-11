package com.crowallet.backend.requests;

import java.math.BigDecimal;

import com.crowallet.backend.entity.AssetType;

import lombok.Data;

@Data
public class UpdateTransaction {
    private Long accountId;
    private String accountName;
    private String assetName;  
    private String assetSymbol;
    private AssetType assetType;
    private BigDecimal currentPrice;
    private Long id;
    private BigDecimal profitLoss;
    private BigDecimal purchasePrice;
    private BigDecimal quantity;
    private BigDecimal totalValue;
    private Long userId;
    private Long transactionId;
    private Long updatedId;
    private BigDecimal updatedQuantity;
    private BigDecimal updatedPurchasePrice;    
}
