package com.crowallet.backend.requests;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PayDebt {
    private Long accountId;
    private Long userId;
    private BigDecimal amount;
    private BigDecimal exchangeRate;
}
