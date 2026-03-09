package com.crowallet.backend.dto;

import java.math.BigDecimal;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.TransactionType;

import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
public class TransactionDTO {
    private Long assetId;
    private TransactionType transactionType;
    private String assetSymbol;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    
}
