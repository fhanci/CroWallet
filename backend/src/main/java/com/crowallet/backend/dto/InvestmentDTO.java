package com.crowallet.backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class InvestmentDTO {

    private String assetSymbol;
    private BigDecimal price;
    
}
