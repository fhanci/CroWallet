package com.crowallet.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crowallet.backend.dto.AccountSummaryResponseDTO;
import com.crowallet.backend.dto.AssetDTO;
import com.crowallet.backend.dto.AssetResponse;
import com.crowallet.backend.dto.MoneyAccountResponseDTO;
import com.crowallet.backend.dto.PositionDTO;
import com.crowallet.backend.dto.TransactionDTO;
import com.crowallet.backend.requests.SellInvestmentRequest;
import com.crowallet.backend.requests.UpdateTransaction;
import com.crowallet.backend.service.AssetService;
import com.crowallet.backend.service.StockService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;




@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/asset")

public class AssetController {


    private AssetService assetService;
    private StockService stockService;

    public AssetController(AssetService assetService, StockService stockService){
        this.assetService = assetService;
        this.stockService = stockService;
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
    public ResponseEntity<List<AssetResponse>> myAssets() {
        List<AssetResponse> assetsByUserId = assetService.getAssetsByUserId();
        return ResponseEntity.status(200).body(assetsByUserId);
    }

    @GetMapping("/isFirstAsset")
    public Boolean isFirstAsset(){
        return assetService.isFirstAsset();
    }

    @GetMapping("/get-asset-size-by-user-id")
    public ResponseEntity<Long> getAssetSizeByUserId() {
        Long assetExistsSize = assetService.findAssetByUserId();
        return ResponseEntity.ok(assetExistsSize);
    }
    

    @PutMapping("/after-deleting-add-money")
    public String afterDeletingAddMoney(@RequestParam Long transactionId, @RequestParam Long selectedMoneyAccountId,  @RequestBody List<Map<String, BigDecimal>> exchangeRate) {
        System.out.println("Test Deneme");
        return assetService.afterDeletingAddMoney(transactionId, selectedMoneyAccountId, exchangeRate);
    }
    

    @DeleteMapping("/delete-asset/{assetId}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long assetId) {
        boolean deleted = assetService.deleteAsset(assetId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/get-transaction-by-asset-id/{assetId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionByAssetId(@PathVariable Long assetId) {
        List<TransactionDTO> transactions = assetService.getTransactionByAssetId(assetId);
        return ResponseEntity.ok(transactions);
    }
    

    @GetMapping("/get-selling-count")
    public Long getSellingCount(@RequestParam Long transactionId) {
        return assetService.getSellingCount(transactionId);
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

    @GetMapping("/getYahoo/{symbol}")
    public String getStock(@PathVariable String symbol) {
        return stockService.getYahooStock(symbol);
    }

    @PostMapping("/sellInvestment")
    public List<SellInvestmentRequest> sellInvestments(@RequestBody List<SellInvestmentRequest> sellInvestmentRequestsList) {
        System.out.println("Datalar Gedli Artık Bende");
        System.out.println(sellInvestmentRequestsList);
        return assetService.sellInvestments(sellInvestmentRequestsList);
    }
    
    
    @GetMapping("/accountSummary")
    public AccountSummaryResponseDTO getAccountSummary() {
        return assetService.getAccountSummary();
    }

    @DeleteMapping("/delete-money-account/{accountId}")
    public ResponseEntity<Void> deleteMoneyAccount(@PathVariable Long accountId) {
        boolean deleted = assetService.deleteMoneyAccount(accountId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }


    @PutMapping("/update-money-account")
    public ResponseEntity<MoneyAccountResponseDTO> updateMoneyAccount(@RequestParam(required = true) Boolean updatedAccount,@RequestParam(required = true) BigDecimal exchangeRate, @RequestBody MoneyAccountResponseDTO moneyAccountResponseDTO) {
        System.out.println(moneyAccountResponseDTO);
        MoneyAccountResponseDTO updatedMoneyAccount = assetService.updateMoneyAccount(updatedAccount,exchangeRate,moneyAccountResponseDTO);
        return ResponseEntity.ok(updatedMoneyAccount);
    }

    @GetMapping("/isDeleteTransactionBefore")
    public Boolean isDeleteTransactionBefore(@RequestParam Long transactionId) {
        return assetService.isDeleteTransactionBefore(transactionId);
    }
    
    
    @GetMapping("/isThereThisAssetNameBefore")
    public Boolean isThereThisAssetNameBefore(@RequestParam String assetName) {
        return assetService.isThereThisAssetNameBefore(assetName);
    }
    
    


    

    

    
}
