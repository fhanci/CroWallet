package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
public class AccountSummaryResponseDTO 
{
    private BigDecimal totalBalanceTRY;
    private Map<String, BigDecimal> currencyTotals;
    private BigDecimal totalInvestmentValue;
    private BigDecimal totalInvestmentProfitLoss;
    private List<MoneyAccountResponseDTO> currencyAccounts;
    private List<UserAccountSummaryInvestmentDTO> investmentAccounts;
    private int currencyAccountCount;
    private int investmentAccountCount;    
}
