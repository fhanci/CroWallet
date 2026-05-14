package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class TransferResponseDTO {
    private String category;
    private BigDecimal amount;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
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
