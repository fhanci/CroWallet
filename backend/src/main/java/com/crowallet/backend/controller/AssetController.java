package com.crowallet.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;
import com.crowallet.backend.entity.Transactions;
import com.crowallet.backend.service.AssetService;

import java.util.List;
import java.util.Optional;

import org.aspectj.weaver.Position;
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
    public Long createAsset(@RequestBody Asset asset) {    
        Long createdAssetId = assetService.createAsset(asset);
        return createdAssetId;
    }

    @PostMapping("/create-transaction")
    public ResponseEntity<List<Transactions>> createTransaction(@RequestBody List<Transactions> transactions) {
        List<Transactions> transactionList = assetService.createTransaction(transactions);
        return ResponseEntity.ok(transactionList);
    }

    @PostMapping("/create-position")
    public ResponseEntity<Positions> createPosition(@RequestBody Positions position) {
        Positions savedPosition = assetService.createPosition(position);        
        return ResponseEntity.ok(savedPosition);
    }


    

    

    
}
