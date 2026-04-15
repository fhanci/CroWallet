package com.crowallet.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "debts")
@Data
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "debt_type")
    private DebtType debtType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_frequency")
    private PaymentFrequency paymentFrequency;

    @Column(name = "total_installments")
    private Integer totalInstallments;

    @Column(name = "paid_installments")
    private Integer paidInstallments = 0;

    @Column(name = "installment_amount")
    private BigDecimal installmentAmount;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "remaining_amount") //Kalan Miktar
    private BigDecimal remainingAmount;

    @Column(name = "description")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "money_account_id", referencedColumnName = "id")
    private MoneyAccount moneyAccount;

    @OneToMany(mappedBy = "debt",fetch = FetchType.EAGER)    
    @JsonManagedReference
    private List<DebtPayment> payments = new ArrayList<>();

    @PrePersist
    @PreUpdate
    public void calculateRemainingAmount() {
        if (remainingAmount == null && debtAmount != null) {
            remainingAmount = debtAmount;
        }
    }
}
