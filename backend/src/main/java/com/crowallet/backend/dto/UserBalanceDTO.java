package com.crowallet.backend.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UserBalanceDTO {
    private BigDecimal totalUSD;
    private BigDecimal totalEUR;
    private BigDecimal totalTRY;

    public UserBalanceDTO(BigDecimal totalUSD, BigDecimal totalEUR, BigDecimal totalTRY) {
        this.totalUSD = totalUSD;
        this.totalEUR = totalEUR;
        this.totalTRY = totalTRY;
    }
}
