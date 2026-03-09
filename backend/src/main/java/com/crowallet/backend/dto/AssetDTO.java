package com.crowallet.backend.dto;

import com.crowallet.backend.entity.AccountType;
import com.crowallet.backend.entity.AssetType;
import com.crowallet.backend.entity.HoldingType;

import lombok.Data;

@Data
public class AssetDTO {
    private String assetName;
    private AccountType accountType;
    private HoldingType holdingType;    
    private AssetType assetType;
    // private Long userId;
}
