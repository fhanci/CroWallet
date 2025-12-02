package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.InvestmentHoldingDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.InvestmentHolding;
import com.crowallet.backend.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-02T08:31:54+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
public class AccountMapperImpl implements AccountMapper {

    @Override
    public AccountDTO toAccountDTO(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountDTO accountDTO = new AccountDTO();

        accountDTO.setUserId( accountUserId( account ) );
        accountDTO.setAccountType( accountTypeToString( account.getAccountType() ) );
        accountDTO.setHoldingType( holdingTypeToString( account.getHoldingType() ) );
        accountDTO.setAssetType( assetTypeToString( account.getAssetType() ) );
        accountDTO.setHoldings( toHoldingDTOList( account.getHoldings() ) );
        accountDTO.setAccountName( account.getAccountName() );
        accountDTO.setAssetSymbol( account.getAssetSymbol() );
        accountDTO.setAverageCost( account.getAverageCost() );
        accountDTO.setBalance( account.getBalance() );
        accountDTO.setCurrency( account.getCurrency() );
        accountDTO.setCurrentPrice( account.getCurrentPrice() );
        accountDTO.setId( account.getId() );
        accountDTO.setQuantity( account.getQuantity() );
        accountDTO.setUpdateDate( account.getUpdateDate() );

        accountDTO.setTotalValue( account.getTotalValue() );
        accountDTO.setProfitLoss( account.getProfitLoss() );
        accountDTO.setHoldingCount( account.getHoldingCount() );

        return accountDTO;
    }

    @Override
    public Account toAccount(AccountDTO accountDTO) {
        if ( accountDTO == null ) {
            return null;
        }

        Account account = new Account();

        account.setAccountType( stringToAccountType( accountDTO.getAccountType() ) );
        account.setHoldingType( stringToHoldingType( accountDTO.getHoldingType() ) );
        account.setAssetType( stringToAssetType( accountDTO.getAssetType() ) );
        account.setAccountName( accountDTO.getAccountName() );
        account.setAssetSymbol( accountDTO.getAssetSymbol() );
        account.setAverageCost( accountDTO.getAverageCost() );
        account.setBalance( accountDTO.getBalance() );
        account.setCurrency( accountDTO.getCurrency() );
        account.setCurrentPrice( accountDTO.getCurrentPrice() );
        account.setId( accountDTO.getId() );
        account.setQuantity( accountDTO.getQuantity() );
        account.setUpdateDate( accountDTO.getUpdateDate() );

        return account;
    }

    @Override
    public List<AccountDTO> toAccountDTOList(List<Account> accounts) {
        if ( accounts == null ) {
            return null;
        }

        List<AccountDTO> list = new ArrayList<AccountDTO>( accounts.size() );
        for ( Account account : accounts ) {
            list.add( toAccountDTO( account ) );
        }

        return list;
    }

    @Override
    public List<Account> toAccountList(List<AccountDTO> accountDTOS) {
        if ( accountDTOS == null ) {
            return null;
        }

        List<Account> list = new ArrayList<Account>( accountDTOS.size() );
        for ( AccountDTO accountDTO : accountDTOS ) {
            list.add( toAccount( accountDTO ) );
        }

        return list;
    }

    @Override
    public InvestmentHoldingDTO toHoldingDTO(InvestmentHolding holding) {
        if ( holding == null ) {
            return null;
        }

        InvestmentHoldingDTO investmentHoldingDTO = new InvestmentHoldingDTO();

        investmentHoldingDTO.setAccountId( holdingAccountId( holding ) );
        investmentHoldingDTO.setAssetName( holding.getAssetName() );
        investmentHoldingDTO.setAssetSymbol( holding.getAssetSymbol() );
        investmentHoldingDTO.setAssetType( holding.getAssetType() );
        investmentHoldingDTO.setCurrentPrice( holding.getCurrentPrice() );
        investmentHoldingDTO.setId( holding.getId() );
        investmentHoldingDTO.setPurchasePrice( holding.getPurchasePrice() );
        investmentHoldingDTO.setQuantity( holding.getQuantity() );

        investmentHoldingDTO.setTotalValue( holding.getTotalValue() );
        investmentHoldingDTO.setProfitLoss( holding.getProfitLoss() );

        return investmentHoldingDTO;
    }

    @Override
    public InvestmentHolding toHolding(InvestmentHoldingDTO dto) {
        if ( dto == null ) {
            return null;
        }

        InvestmentHolding investmentHolding = new InvestmentHolding();

        investmentHolding.setAssetName( dto.getAssetName() );
        investmentHolding.setAssetSymbol( dto.getAssetSymbol() );
        investmentHolding.setAssetType( dto.getAssetType() );
        investmentHolding.setCurrentPrice( dto.getCurrentPrice() );
        investmentHolding.setId( dto.getId() );
        investmentHolding.setPurchasePrice( dto.getPurchasePrice() );
        investmentHolding.setQuantity( dto.getQuantity() );

        return investmentHolding;
    }

    @Override
    public List<InvestmentHoldingDTO> toHoldingDTOList(List<InvestmentHolding> holdings) {
        if ( holdings == null ) {
            return null;
        }

        List<InvestmentHoldingDTO> list = new ArrayList<InvestmentHoldingDTO>( holdings.size() );
        for ( InvestmentHolding investmentHolding : holdings ) {
            list.add( toHoldingDTO( investmentHolding ) );
        }

        return list;
    }

    private Long accountUserId(Account account) {
        User user = account.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getId();
    }

    private Long holdingAccountId(InvestmentHolding investmentHolding) {
        Account account = investmentHolding.getAccount();
        if ( account == null ) {
            return null;
        }
        return account.getId();
    }
}
