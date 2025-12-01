package com.crowallet.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "accounts")
@Data
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String accountName;

    @Column(name = "balance")
    private BigDecimal balance;

    @Column(name = "currency")
    private String currency;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    // Account type: CURRENCY or INVESTMENT
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type")
    private AccountType accountType = AccountType.CURRENCY;

    // For CURRENCY accounts: BANK or CASH
    @Enumerated(EnumType.STRING)
    @Column(name = "holding_type")
    private HoldingType holdingType;

    // For INVESTMENT accounts: STOCK or GOLD
    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type")
    private AssetType assetType;

    // Legacy fields - kept for backward compatibility
    @Column(name = "asset_symbol")
    private String assetSymbol;

    @Column(name = "quantity")
    private BigDecimal quantity;

    @Column(name = "average_cost")
    private BigDecimal averageCost;

    @Column(name = "current_price")
    private BigDecimal currentPrice;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    // Investment holdings for this account
    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<InvestmentHolding> holdings = new ArrayList<>();

    // Calculate total value for investment accounts from holdings
    public BigDecimal getTotalValue() {
        if (accountType == AccountType.INVESTMENT) {
            if (holdings != null && !holdings.isEmpty()) {
                return holdings.stream()
                    .map(InvestmentHolding::getTotalValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            // Fallback for legacy single-item accounts
            if (quantity != null && currentPrice != null) {
                return quantity.multiply(currentPrice);
            }
        }
        return balance;
    }

    // Calculate profit/loss for investment accounts from holdings
    public BigDecimal getProfitLoss() {
        if (accountType == AccountType.INVESTMENT) {
            if (holdings != null && !holdings.isEmpty()) {
                return holdings.stream()
                    .map(InvestmentHolding::getProfitLoss)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            // Fallback for legacy single-item accounts
            if (quantity != null && currentPrice != null && averageCost != null) {
                BigDecimal totalCost = quantity.multiply(averageCost);
                BigDecimal currentValue = quantity.multiply(currentPrice);
                return currentValue.subtract(totalCost);
            }
        }
        return BigDecimal.ZERO;
    }

    // Get holding count
    public int getHoldingCount() {
        if (holdings != null) {
            return holdings.size();
        }
        return 0;
    }
}
