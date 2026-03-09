package com.crowallet.backend.dto;

import java.math.BigDecimal;

import com.crowallet.backend.entity.Asset;

import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
public class PositionDTO {

    private Long assetId;
    private BigDecimal costBasis;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
}
