package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.crowallet.backend.entity.DebtPayment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DebtResponseDTO {
    private Long id;
    private Long userId;
    private MoneyAccountResponseDTO moneyAccount;
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
    private BigDecimal remainingAmount;
    private List<DebtPayment> payments;
}
