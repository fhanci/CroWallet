package com.crowallet.backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ExchangeRateRequestDTO {
    
    private String currency;
    private BigDecimal rate;
}
