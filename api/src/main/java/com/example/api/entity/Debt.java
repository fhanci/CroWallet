package com.example.api.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "debts")
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "amount")
    private BigDecimal debtAmount;

    @Column(name = "currency")
    private String debtCurrency;

    @Column(name = "to_whom")
    private String toWhom;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "status")
    private String status;

    @Column(name = "warning_period")
    private Integer warningPeriod;

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

    public BigDecimal getDebtAmount() {
        return debtAmount;
    }

    public void setDebtAmount(BigDecimal debtAmount) {
        this.debtAmount = debtAmount;
    }

    public String getDebtCurrency() {
        return debtCurrency;
    }

    public void setDebtCurrency(String debtCurrency) {
        this.debtCurrency = debtCurrency;
    }

    public String getToWhom() {
        return toWhom;
    }

    public void setToWhom(String toWhom) {
        this.toWhom = toWhom;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getWarningPeriod() {
        return warningPeriod;
    }

    public void setWarningPeriod(Integer warningPeriod) {
        this.warningPeriod = warningPeriod;
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
