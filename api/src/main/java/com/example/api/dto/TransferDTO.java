package com.example.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TransferDTO {
    private Long id;
    private String category;
    private BigDecimal amount;
    private LocalDate date;
    private LocalDateTime createDate;
    private String description;
    private String person;
    private String type;
    private String details;
    private BigDecimal exchangeRate;
    private BigDecimal inputNextBalance;
    private BigDecimal inputPreviousBalance;
    private BigDecimal outputNextBalance;
    private BigDecimal outputPreviousBalance;
    private Long userId;
    private Long accountId;
}

