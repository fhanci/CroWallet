package com.example.api.dto;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DebtDTO {
    private Long id;
    private BigDecimal debtAmount;
    private String debtCurrency;
    private String toWhom;
    private LocalDate dueDate;
    private String status;
    private Integer warningPeriod;
    private Long userId;
    private Long accountId;
}
