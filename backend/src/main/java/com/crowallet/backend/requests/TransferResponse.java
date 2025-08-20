package com.crowallet.backend.requests;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransferResponse {
    private LocalDate date;
    private BigDecimal amount;
}
