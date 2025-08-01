package com.example.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TransferDTO {
    private Integer id;
    private String category;
    private BigDecimal amount;
    private LocalDate date;
    private LocalDateTime createDate;
    private String description;
    private String person;
    private String type;
    private String details;
    private BigDecimal exchangeRate;
    private BigDecimal inputNextBalance;
    private BigDecimal inputPreviousBalance;
    private BigDecimal outputNextBalance;
    private BigDecimal outputPreviousBalance;
    private Integer userId;
    private Integer accountId;

    // Getter ve Setter metodları
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getCreateDate() { return createDate; }
    public void setCreateDate(LocalDateTime createDate) { this.createDate = createDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPerson() { return person; }
    public void setPerson(String person) { this.person = person; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public BigDecimal getExchangeRate() { return exchangeRate; }
    public void setExchangeRate(BigDecimal exchangeRate) { this.exchangeRate = exchangeRate; }

    public BigDecimal getInputNextBalance() { return inputNextBalance; }
    public void setInputNextBalance(BigDecimal inputNextBalance) { this.inputNextBalance = inputNextBalance; }

    public BigDecimal getInputPreviousBalance() { return inputPreviousBalance; }
    public void setInputPreviousBalance(BigDecimal inputPreviousBalance) { this.inputPreviousBalance = inputPreviousBalance; }

    public BigDecimal getOutputNextBalance() { return outputNextBalance; }
    public void setOutputNextBalance(BigDecimal outputNextBalance) { this.outputNextBalance = outputNextBalance; }

    public BigDecimal getOutputPreviousBalance() { return outputPreviousBalance; }
    public void setOutputPreviousBalance(BigDecimal outputPreviousBalance) { this.outputPreviousBalance = outputPreviousBalance; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getAccountId() { return accountId; }
    public void setAccountId(Integer accountId) { this.accountId = accountId; }
}

