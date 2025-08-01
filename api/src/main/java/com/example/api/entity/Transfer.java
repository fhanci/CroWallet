package com.example.api.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

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
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;

    // Getter and Setter methods
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPerson() {
        return person;
    }

    public void setPerson(String person) {
        this.person = person;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(BigDecimal exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public BigDecimal getInputNextBalance() {
        return inputNextBalance;
    }

    public void setInputNextBalance(BigDecimal inputNextBalance) {
        this.inputNextBalance = inputNextBalance;
    }

    public BigDecimal getInputPreviousBalance() {
        return inputPreviousBalance;
    }

    public void setInputPreviousBalance(BigDecimal inputPreviousBalance) {
        this.inputPreviousBalance = inputPreviousBalance;
    }

    public BigDecimal getOutputNextBalance() {
        return outputNextBalance;
    }

    public void setOutputNextBalance(BigDecimal outputNextBalance) {
        this.outputNextBalance = outputNextBalance;
    }

    public BigDecimal getOutputPreviousBalance() {
        return outputPreviousBalance;
    }

    public void setOutputPreviousBalance(BigDecimal outputPreviousBalance) {
        this.outputPreviousBalance = outputPreviousBalance;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }
}