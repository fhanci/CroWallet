package com.crowallet.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowallet.backend.dto.AssetDTO;
import com.crowallet.backend.dto.PositionDTO;
import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;
import com.crowallet.backend.entity.Transactions;
import com.crowallet.backend.service.AssetService;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/asset")
public class AssetController {


    private AssetService assetService;

    public AssetController(AssetService assetService){
        this.assetService = assetService;
    }

    @PostMapping("/create-asset")
    public Long createAsset(@RequestBody AssetDTO asset) { 
        return assetService.createAsset(asset);
    }   

    @PostMapping("/create-transaction")
    public ResponseEntity<List<TransactionDTO>> createTransaction(@RequestBody List<TransactionDTO> transactions) {
        List<TransactionDTO> transactionDTOList = assetService.createTransaction(transactions);
        return ResponseEntity.ok(transactionDTOList);
    }
    @PostMapping("/create-position")
    public ResponseEntity<PositionDTO> createPosition(@RequestBody PositionDTO position) {
        PositionDTO savedPosition = assetService.createPosition(position);        
        return ResponseEntity.ok(savedPosition);
    }


    

    

    
}
