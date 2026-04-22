package com.crowallet.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TransferDTO {
    private String category;
    private BigDecimal amount;
    private String description;
    private String type;
    private String details;
    private BigDecimal exchangeRate;
    private BigDecimal inputNextBalance;
    private BigDecimal inputPreviousBalance;
    private BigDecimal outputNextBalance;
    private BigDecimal outputPreviousBalance;
    private Long moneyAccountId;
    private String currency;
    private LocalDateTime transactionDateTime;
    private Boolean isAccountToAccountTransfer;
    private Long transferId;
}

