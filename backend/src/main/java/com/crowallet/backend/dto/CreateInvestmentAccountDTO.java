package com.crowallet.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateInvestmentAccountDTO {
    private Long userId;
    private String accountName;
    private String assetType; // GOLD or STOCK
    private List<HoldingItemDTO> holdings;

    @Data
    public static class HoldingItemDTO {
        private String assetSymbol;
        private String assetName;
        private Double quantity;
        private Double purchasePrice;
        private Double currentPrice;
    }
}

