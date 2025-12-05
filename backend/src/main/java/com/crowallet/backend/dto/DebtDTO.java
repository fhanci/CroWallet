package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class DebtDTO {
    private Long id;
    private BigDecimal debtAmount;
    private String debtCurrency;
    private String toWhom;
    private LocalDate dueDate;
    private String status;
    private Integer warningPeriod;
    
    // New fields
    private String debtType;
    private String paymentType;
    private String paymentFrequency;
    private Integer totalInstallments;
    private Integer paidInstallments;
    private BigDecimal installmentAmount;
    private LocalDate startDate;
    private BigDecimal remainingAmount;
    private String description;
    
    // Related entities
    private UserDTO user;
    private AccountDTO account;
    private List<DebtPaymentDTO> payments;
    
    // Calculated fields
    private DebtPaymentDTO nextPayment;
    private Integer remainingInstallments;
}
