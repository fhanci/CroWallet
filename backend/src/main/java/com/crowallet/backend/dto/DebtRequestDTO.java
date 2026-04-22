package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class DebtRequestDTO {
    private Long userId;
    private Long moneyAccountId;
    private String toWhom;
    private String description;
    private String debtCurrency;
    private String debtType;
    private String paymentType;
    private String paymentFrequency;
    private Integer totalInstallments;
    private BigDecimal debtAmount;
    private LocalDate dueDate;
    private BigDecimal installmentAmount;
    private LocalDate startDate;
    private String status; 
    private Integer warningPeriod;
}
