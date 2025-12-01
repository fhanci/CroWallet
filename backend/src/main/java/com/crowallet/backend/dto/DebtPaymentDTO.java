package com.crowallet.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DebtPaymentDTO {
    private Long id;
    private Long debtId;
    private LocalDate paymentDate;
    private BigDecimal amount;
    private Integer paymentNumber;
    private String status;
    private LocalDate paidDate;
    private String note;
    
    // Additional fields for display
    private String debtToWhom;
    private String debtCurrency;
    private String accountName;
}

