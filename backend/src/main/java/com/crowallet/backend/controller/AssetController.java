package com.crowallet.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowallet.backend.dto.AssetDTO;
import com.crowallet.backend.dto.AssetResponse;
import com.crowallet.backend.dto.PositionDTO;
import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.entity.Asset;
import com.crowallet.backend.entity.Positions;
import com.crowallet.backend.entity.Transactions;
import com.crowallet.backend.requests.UpdateTransaction;
import com.crowallet.backend.service.AssetService;

import java.util.List;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;




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

    @GetMapping({"/my-assets"})
    public ResponseEntity<List<AssetResponse>> getMethodName() {
        List<AssetResponse> assetsByUserId = assetService.getAssetsByUserId();
        return ResponseEntity.status(200).body(assetsByUserId);

    }

    @PutMapping("/updateAsset")
    public UpdateTransaction updateTransaction(@RequestBody UpdateTransaction updateTransaction) {
        UpdateTransaction updatedAssetResponse = assetService.updateAssetResponse(updateTransaction);
        return updatedAssetResponse;
    }

    @DeleteMapping("/delete_transaction")
    public ResponseEntity<Boolean> deleteTransaction(@RequestBody AssetResponse assetResponse){
        Boolean deleteTransaction = assetService.deleteTransaction(assetResponse,assetResponse.getTransactionId());
        if (deleteTransaction)
            return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/addTransaction")
    public List<TransactionDTO> addTransaction(@RequestBody List<TransactionDTO> transactionDTO) { 
        System.out.println("Burayı Gördük mü?");
        System.out.println(transactionDTO);
        List<TransactionDTO> transactionDTOs = assetService.addTransaction(transactionDTO);
        return transactionDTOs;
        
    }
    
    


    

    

    
}
