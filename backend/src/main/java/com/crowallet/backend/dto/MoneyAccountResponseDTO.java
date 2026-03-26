package com.crowallet.backend.dto;

import java.math.BigDecimal;

import com.crowallet.backend.entity.HoldingType;

import lombok.Data;

@Data
public class MoneyAccountResponseDTO {
    private String accountName;
    private BigDecimal balance;
    private String currency;
    private HoldingType holdingType;
    private Long id;

}
