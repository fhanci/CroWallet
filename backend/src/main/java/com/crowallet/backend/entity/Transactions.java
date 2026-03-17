package com.crowallet.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transactions extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", referencedColumnName = "id")
    private Asset asset;

    // FOR INVESTMENT ACCOUNT
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType transactionType;

    // FOR INVESTMENT ACCOUNT
    @Column(name = "asset_symbol")
    private String assetSymbol;
    // FOR INVESTMENT ACCOUNT
    @Column(name = "unit_price")
    private BigDecimal unitPrice;

    // FOR INVESTMENT ACCOUNT
    @Column(name = "quantity")
    private BigDecimal quantity;

    @Column(name = "asset-name")
    private String assetName;

    @Column(name = "total-value")
    private BigDecimal totalValue;

    @Column(name = "current_value")
    private BigDecimal currentValue;


    
}
