package com.example.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AccountDTO {
    private Long id;
    private BigDecimal balance;
    private String currency;
    private String accountName;
    private LocalDateTime updateDate;
    private Long userId;

}
