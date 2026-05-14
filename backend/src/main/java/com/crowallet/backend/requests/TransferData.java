package com.crowallet.backend.requests;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class TransferData {
    private BigDecimal amount;
    private String category;
    private String details;
    private LocalDate date;
    private LocalDate createDate;
    private Long userId;
    private Long accountId;
    private String type;
    private Long receiverId;
    private BigDecimal inputPreviousBalance;
    private BigDecimal inputNextBalance;

}
