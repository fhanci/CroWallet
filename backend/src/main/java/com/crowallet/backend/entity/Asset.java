package com.crowallet.backend.entity;

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
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "assets")
public class Asset extends BaseEntity{
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_name")
    private String assetName;

    // INVESTMENT or CURRENCY
    @Column(name = "account_type")
    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    // For CURRENCY accounts: BANK or CASH
    @Enumerated(EnumType.STRING)
    @Column(name = "holding_type", nullable = true)
    private HoldingType holdingType;    
    
    // For INVESTMENT accounts: STOCK or GOLD
    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = true)
    private AssetType assetType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;


}
