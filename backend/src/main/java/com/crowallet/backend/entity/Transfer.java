package com.crowallet.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "transfers")
@Data
public class Transfer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "category")
    private String category;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "description")
    private String description;

    @Column(name = "transaction_date_time")
    private LocalDateTime transactionDateTime;

    @Column(name = "type")
    private String type;

    @Column(name = "details")
    private String details;

    @Column(name = "exchange_rate")
    private BigDecimal exchangeRate;

    @Column(name = "input_next_balance")
    private BigDecimal inputNextBalance;

    @Column(name = "input_previous_balance")
    private BigDecimal inputPreviousBalance;

    @Column(name = "output_next_balance")
    private BigDecimal outputNextBalance;

    @Column(name = "output_previous_balance")
    private BigDecimal outputPreviousBalance;

    @ManyToOne
    @JoinColumn(name = "money_account_id", referencedColumnName = "id")
    private MoneyAccount moneyAccount;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "currency")
    private String currency;

    @Column(name = "is_account_to_account_transfer")    
    private Boolean isAccountToAccountTransfer;
}