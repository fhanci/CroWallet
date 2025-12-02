package com.crowallet.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DebtSummaryDTO {
    private BigDecimal totalDebtAmount;
    private BigDecimal totalRemainingAmount;
    private BigDecimal totalPaidAmount;
    private Map<String, BigDecimal> debtsByCurrency;
    private int totalDebts;
    private int activeDebts;
    private int completedDebts;
    private List<DebtPaymentDTO> upcomingPayments;
    private List<DebtDTO> debts;
}

