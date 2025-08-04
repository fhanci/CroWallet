package com.example.api.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
@Data
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "category")
    private String category;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "description")
    private String description;

    @Column(name = "person")
    private String person;

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
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private Long userId;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Long accountId;

}