package com.crowallet.backend.entity;

import java.math.BigDecimal;

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
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Table(name = "investment_holdings")
@Data
public class InvestmentHolding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false)
    private AssetType assetType;

    @Column(name = "asset_symbol", nullable = false, length = 50)
    private String assetSymbol;

    @Column(name = "asset_name")
    private String assetName;

    @Column(name = "quantity", precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "purchase_price", precision = 15, scale = 4)
    private BigDecimal purchasePrice;

    @Column(name = "current_price", precision = 15, scale = 4)
    private BigDecimal currentPrice;

    @Transient
    public BigDecimal getTotalValue() {
        if (quantity != null && currentPrice != null) {
            return quantity.multiply(currentPrice);
        }
        return BigDecimal.ZERO;
    }

    @Transient
    public BigDecimal getProfitLoss() {
        if (quantity != null && currentPrice != null && purchasePrice != null) {
            return quantity.multiply(currentPrice.subtract(purchasePrice));
        }
        return BigDecimal.ZERO;
    }
}

