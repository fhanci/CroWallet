package com.crowallet.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class AccountSummaryDTO {
   
    private BigDecimal totalBalanceTRY;
    
    
    private Map<String, BigDecimal> currencyTotals;
    
    
    private BigDecimal totalInvestmentValue;
    private BigDecimal totalInvestmentProfitLoss;
    
  
    private List<AccountDTO> currencyAccounts;
    private List<AccountDTO> investmentAccounts;
    
    
    private int currencyAccountCount;
    private int investmentAccountCount;
}

