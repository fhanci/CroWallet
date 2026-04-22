package com.crowallet.backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PositionDTO {

    private Long assetId;
    private BigDecimal costBasis;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
}
