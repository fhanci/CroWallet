package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.InvestmentHoldingDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.AccountType;
import com.crowallet.backend.entity.AssetType;
import com.crowallet.backend.entity.HoldingType;
import com.crowallet.backend.entity.InvestmentHolding;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-02T08:31:54+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.44.0.v20251118-1623, environment: Java 21.0.9 (Eclipse Adoptium)"
)
public class TransferMapperImpl implements TransferMapper {

    @Override
    public TransferDTO toTransferDTO(Transfer transfer) {
        if ( transfer == null ) {
            return null;
        }

        TransferDTO transferDTO = new TransferDTO();

        transferDTO.setAccount( accountToAccountDTO( transfer.getAccount() ) );
        transferDTO.setAmount( transfer.getAmount() );
        transferDTO.setCategory( transfer.getCategory() );
        transferDTO.setCreateDate( transfer.getCreateDate() );
        transferDTO.setDate( transfer.getDate() );
        transferDTO.setDescription( transfer.getDescription() );
        transferDTO.setDetails( transfer.getDetails() );
        transferDTO.setExchangeRate( transfer.getExchangeRate() );
        transferDTO.setId( transfer.getId() );
        transferDTO.setInputNextBalance( transfer.getInputNextBalance() );
        transferDTO.setInputPreviousBalance( transfer.getInputPreviousBalance() );
        transferDTO.setOutputNextBalance( transfer.getOutputNextBalance() );
        transferDTO.setOutputPreviousBalance( transfer.getOutputPreviousBalance() );
        transferDTO.setPerson( transfer.getPerson() );
        transferDTO.setType( transfer.getType() );
        transferDTO.setUser( userToUserDTO( transfer.getUser() ) );

        return transferDTO;
    }

    @Override
    public Transfer toTransfer(TransferDTO transferDTO) {
        if ( transferDTO == null ) {
            return null;
        }

        Transfer transfer = new Transfer();

        transfer.setAccount( accountDTOToAccount( transferDTO.getAccount() ) );
        transfer.setAmount( transferDTO.getAmount() );
        transfer.setCategory( transferDTO.getCategory() );
        transfer.setCreateDate( transferDTO.getCreateDate() );
        transfer.setDate( transferDTO.getDate() );
        transfer.setDescription( transferDTO.getDescription() );
        transfer.setDetails( transferDTO.getDetails() );
        transfer.setExchangeRate( transferDTO.getExchangeRate() );
        transfer.setId( transferDTO.getId() );
        transfer.setInputNextBalance( transferDTO.getInputNextBalance() );
        transfer.setInputPreviousBalance( transferDTO.getInputPreviousBalance() );
        transfer.setOutputNextBalance( transferDTO.getOutputNextBalance() );
        transfer.setOutputPreviousBalance( transferDTO.getOutputPreviousBalance() );
        transfer.setPerson( transferDTO.getPerson() );
        transfer.setType( transferDTO.getType() );
        transfer.setUser( userDTOToUser( transferDTO.getUser() ) );

        return transfer;
    }

    @Override
    public List<Transfer> toTransferList(List<TransferDTO> transferDTOS) {
        if ( transferDTOS == null ) {
            return null;
        }

        List<Transfer> list = new ArrayList<Transfer>( transferDTOS.size() );
        for ( TransferDTO transferDTO : transferDTOS ) {
            list.add( toTransfer( transferDTO ) );
        }

        return list;
    }

    @Override
    public List<TransferDTO> toTransferDTOList(List<Transfer> transfers) {
        if ( transfers == null ) {
            return null;
        }

        List<TransferDTO> list = new ArrayList<TransferDTO>( transfers.size() );
        for ( Transfer transfer : transfers ) {
            list.add( toTransferDTO( transfer ) );
        }

        return list;
    }

    protected InvestmentHoldingDTO investmentHoldingToInvestmentHoldingDTO(InvestmentHolding investmentHolding) {
        if ( investmentHolding == null ) {
            return null;
        }

        InvestmentHoldingDTO investmentHoldingDTO = new InvestmentHoldingDTO();

        investmentHoldingDTO.setAssetName( investmentHolding.getAssetName() );
        investmentHoldingDTO.setAssetSymbol( investmentHolding.getAssetSymbol() );
        investmentHoldingDTO.setAssetType( investmentHolding.getAssetType() );
        investmentHoldingDTO.setCurrentPrice( investmentHolding.getCurrentPrice() );
        investmentHoldingDTO.setId( investmentHolding.getId() );
        investmentHoldingDTO.setProfitLoss( investmentHolding.getProfitLoss() );
        investmentHoldingDTO.setPurchasePrice( investmentHolding.getPurchasePrice() );
        investmentHoldingDTO.setQuantity( investmentHolding.getQuantity() );
        investmentHoldingDTO.setTotalValue( investmentHolding.getTotalValue() );

        return investmentHoldingDTO;
    }

    protected List<InvestmentHoldingDTO> investmentHoldingListToInvestmentHoldingDTOList(List<InvestmentHolding> list) {
        if ( list == null ) {
            return null;
        }

        List<InvestmentHoldingDTO> list1 = new ArrayList<InvestmentHoldingDTO>( list.size() );
        for ( InvestmentHolding investmentHolding : list ) {
            list1.add( investmentHoldingToInvestmentHoldingDTO( investmentHolding ) );
        }

        return list1;
    }

    protected AccountDTO accountToAccountDTO(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountDTO accountDTO = new AccountDTO();

        accountDTO.setAccountName( account.getAccountName() );
        if ( account.getAccountType() != null ) {
            accountDTO.setAccountType( account.getAccountType().name() );
        }
        accountDTO.setAssetSymbol( account.getAssetSymbol() );
        if ( account.getAssetType() != null ) {
            accountDTO.setAssetType( account.getAssetType().name() );
        }
        accountDTO.setAverageCost( account.getAverageCost() );
        accountDTO.setBalance( account.getBalance() );
        accountDTO.setCurrency( account.getCurrency() );
        accountDTO.setCurrentPrice( account.getCurrentPrice() );
        accountDTO.setHoldingCount( account.getHoldingCount() );
        if ( account.getHoldingType() != null ) {
            accountDTO.setHoldingType( account.getHoldingType().name() );
        }
        accountDTO.setHoldings( investmentHoldingListToInvestmentHoldingDTOList( account.getHoldings() ) );
        accountDTO.setId( account.getId() );
        accountDTO.setProfitLoss( account.getProfitLoss() );
        accountDTO.setQuantity( account.getQuantity() );
        accountDTO.setTotalValue( account.getTotalValue() );
        accountDTO.setUpdateDate( account.getUpdateDate() );

        return accountDTO;
    }

    protected UserDTO userToUserDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setEmail( user.getEmail() );
        userDTO.setId( user.getId() );
        userDTO.setPassword( user.getPassword() );
        userDTO.setUsername( user.getUsername() );

        return userDTO;
    }

    protected InvestmentHolding investmentHoldingDTOToInvestmentHolding(InvestmentHoldingDTO investmentHoldingDTO) {
        if ( investmentHoldingDTO == null ) {
            return null;
        }

        InvestmentHolding investmentHolding = new InvestmentHolding();

        investmentHolding.setAssetName( investmentHoldingDTO.getAssetName() );
        investmentHolding.setAssetSymbol( investmentHoldingDTO.getAssetSymbol() );
        investmentHolding.setAssetType( investmentHoldingDTO.getAssetType() );
        investmentHolding.setCurrentPrice( investmentHoldingDTO.getCurrentPrice() );
        investmentHolding.setId( investmentHoldingDTO.getId() );
        investmentHolding.setPurchasePrice( investmentHoldingDTO.getPurchasePrice() );
        investmentHolding.setQuantity( investmentHoldingDTO.getQuantity() );

        return investmentHolding;
    }

    protected List<InvestmentHolding> investmentHoldingDTOListToInvestmentHoldingList(List<InvestmentHoldingDTO> list) {
        if ( list == null ) {
            return null;
        }

        List<InvestmentHolding> list1 = new ArrayList<InvestmentHolding>( list.size() );
        for ( InvestmentHoldingDTO investmentHoldingDTO : list ) {
            list1.add( investmentHoldingDTOToInvestmentHolding( investmentHoldingDTO ) );
        }

        return list1;
    }

    protected Account accountDTOToAccount(AccountDTO accountDTO) {
        if ( accountDTO == null ) {
            return null;
        }

        Account account = new Account();

        account.setAccountName( accountDTO.getAccountName() );
        if ( accountDTO.getAccountType() != null ) {
            account.setAccountType( Enum.valueOf( AccountType.class, accountDTO.getAccountType() ) );
        }
        account.setAssetSymbol( accountDTO.getAssetSymbol() );
        if ( accountDTO.getAssetType() != null ) {
            account.setAssetType( Enum.valueOf( AssetType.class, accountDTO.getAssetType() ) );
        }
        account.setAverageCost( accountDTO.getAverageCost() );
        account.setBalance( accountDTO.getBalance() );
        account.setCurrency( accountDTO.getCurrency() );
        account.setCurrentPrice( accountDTO.getCurrentPrice() );
        if ( accountDTO.getHoldingType() != null ) {
            account.setHoldingType( Enum.valueOf( HoldingType.class, accountDTO.getHoldingType() ) );
        }
        account.setHoldings( investmentHoldingDTOListToInvestmentHoldingList( accountDTO.getHoldings() ) );
        account.setId( accountDTO.getId() );
        account.setQuantity( accountDTO.getQuantity() );
        account.setUpdateDate( accountDTO.getUpdateDate() );

        return account;
    }

    protected User userDTOToUser(UserDTO userDTO) {
        if ( userDTO == null ) {
            return null;
        }

        User user = new User();

        user.setEmail( userDTO.getEmail() );
        user.setId( userDTO.getId() );
        user.setPassword( userDTO.getPassword() );
        user.setUsername( userDTO.getUsername() );

        return user;
    }
}
