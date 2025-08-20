package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.TransferDTO;
import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.Transfer;
import com.crowallet.backend.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-20T10:10:09+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.2 (Oracle Corporation)"
)
public class TransferMapperImpl implements TransferMapper {

    @Override
    public TransferDTO toTransferDTO(Transfer transfer) {
        if ( transfer == null ) {
            return null;
        }

        TransferDTO transferDTO = new TransferDTO();

        transferDTO.setId( transfer.getId() );
        transferDTO.setCategory( transfer.getCategory() );
        transferDTO.setAmount( transfer.getAmount() );
        transferDTO.setDate( transfer.getDate() );
        transferDTO.setCreateDate( transfer.getCreateDate() );
        transferDTO.setDescription( transfer.getDescription() );
        transferDTO.setReceiverId( transfer.getReceiverId() );
        transferDTO.setType( transfer.getType() );
        transferDTO.setDetails( transfer.getDetails() );
        transferDTO.setExchangeRate( transfer.getExchangeRate() );
        transferDTO.setInputNextBalance( transfer.getInputNextBalance() );
        transferDTO.setInputPreviousBalance( transfer.getInputPreviousBalance() );
        transferDTO.setOutputNextBalance( transfer.getOutputNextBalance() );
        transferDTO.setOutputPreviousBalance( transfer.getOutputPreviousBalance() );
        transferDTO.setUser( userToUserDTO( transfer.getUser() ) );
        transferDTO.setAccount( accountToAccountDTO( transfer.getAccount() ) );

        return transferDTO;
    }

    @Override
    public Transfer toTransfer(TransferDTO transferDTO) {
        if ( transferDTO == null ) {
            return null;
        }

        Transfer transfer = new Transfer();

        transfer.setId( transferDTO.getId() );
        transfer.setCategory( transferDTO.getCategory() );
        transfer.setAmount( transferDTO.getAmount() );
        transfer.setDate( transferDTO.getDate() );
        transfer.setCreateDate( transferDTO.getCreateDate() );
        transfer.setDescription( transferDTO.getDescription() );
        transfer.setReceiverId( transferDTO.getReceiverId() );
        transfer.setType( transferDTO.getType() );
        transfer.setDetails( transferDTO.getDetails() );
        transfer.setExchangeRate( transferDTO.getExchangeRate() );
        transfer.setInputNextBalance( transferDTO.getInputNextBalance() );
        transfer.setInputPreviousBalance( transferDTO.getInputPreviousBalance() );
        transfer.setOutputNextBalance( transferDTO.getOutputNextBalance() );
        transfer.setOutputPreviousBalance( transferDTO.getOutputPreviousBalance() );
        transfer.setUser( userDTOToUser( transferDTO.getUser() ) );
        transfer.setAccount( accountDTOToAccount( transferDTO.getAccount() ) );

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

    protected UserDTO userToUserDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setId( user.getId() );
        userDTO.setUsername( user.getUsername() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setPassword( user.getPassword() );

        return userDTO;
    }

    protected AccountDTO accountToAccountDTO(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountDTO accountDTO = new AccountDTO();

        accountDTO.setId( account.getId() );
        accountDTO.setBalance( account.getBalance() );
        accountDTO.setCurrency( account.getCurrency() );
        accountDTO.setAccountName( account.getAccountName() );
        accountDTO.setUpdateDate( account.getUpdateDate() );
        accountDTO.setUser( userToUserDTO( account.getUser() ) );

        return accountDTO;
    }

    protected User userDTOToUser(UserDTO userDTO) {
        if ( userDTO == null ) {
            return null;
        }

        User user = new User();

        user.setId( userDTO.getId() );
        user.setUsername( userDTO.getUsername() );
        user.setEmail( userDTO.getEmail() );
        user.setPassword( userDTO.getPassword() );

        return user;
    }

    protected Account accountDTOToAccount(AccountDTO accountDTO) {
        if ( accountDTO == null ) {
            return null;
        }

        Account account = new Account();

        account.setId( accountDTO.getId() );
        account.setBalance( accountDTO.getBalance() );
        account.setCurrency( accountDTO.getCurrency() );
        account.setAccountName( accountDTO.getAccountName() );
        account.setUpdateDate( accountDTO.getUpdateDate() );
        account.setUser( userDTOToUser( accountDTO.getUser() ) );

        return account;
    }
}
