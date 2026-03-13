package com.crowallet.backend.requests;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class SellInvestmentRequest {
    private Long key;
    private Long id;
    private String assetName;
    private BigDecimal quantity;
    private BigDecimal sellCount;
    private Long transactionId;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
