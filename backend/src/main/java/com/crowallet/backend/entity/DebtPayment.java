package com.crowallet.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "debt_payments")
@Data
public class DebtPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JoinColumn(name = "debt_id", nullable = false)
    private Debt debt;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_number")
    private Integer paymentNumber;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // PENDING, PAID

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "note")
    private String note;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "money_account_id")
    private MoneyAccount moneyAccount;

    @Column(name = "paid_currency")
    private String paidCurrency;

    @Column(name = "used_exchange_rate")
    private BigDecimal usedExchangeRate;

    @Column(name = "paid_amount")
    private BigDecimal paidAmount;
}

