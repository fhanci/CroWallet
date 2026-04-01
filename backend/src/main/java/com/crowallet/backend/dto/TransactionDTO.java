package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.crowallet.backend.entity.TransactionType;
import lombok.Data;

@Data
public class TransactionDTO {
    private Long assetId;
    private TransactionType transactionType;
    private String assetSymbol;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    private String assetName;
    private BigDecimal totalValue;
    private BigDecimal currentValue;
    private LocalDateTime buyingDateTime;
    private BigDecimal sellingPrice;
}
