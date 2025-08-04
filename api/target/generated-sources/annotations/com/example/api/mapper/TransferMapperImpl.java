package com.example.api.mapper;

import com.example.api.dto.AccountDTO;
import com.example.api.dto.TransferDTO;
import com.example.api.dto.UserDTO;
import com.example.api.entity.Account;
import com.example.api.entity.Transfer;
import com.example.api.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-04T13:48:01+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.42.50.v20250729-0351, environment: Java 21.0.8 (Eclipse Adoptium)"
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

    protected UserDTO userToUserDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setEmail( user.getEmail() );
        userDTO.setId( user.getId() );
        userDTO.setName( user.getName() );
        userDTO.setPassword( user.getPassword() );

        return userDTO;
    }

    protected AccountDTO accountToAccountDTO(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountDTO accountDTO = new AccountDTO();

        accountDTO.setAccountName( account.getAccountName() );
        accountDTO.setBalance( account.getBalance() );
        accountDTO.setCurrency( account.getCurrency() );
        accountDTO.setId( account.getId() );
        accountDTO.setUpdateDate( account.getUpdateDate() );
        accountDTO.setUser( userToUserDTO( account.getUser() ) );

        return accountDTO;
    }

    protected User userDTOToUser(UserDTO userDTO) {
        if ( userDTO == null ) {
            return null;
        }

        User user = new User();

        user.setEmail( userDTO.getEmail() );
        user.setId( userDTO.getId() );
        user.setName( userDTO.getName() );
        user.setPassword( userDTO.getPassword() );

        return user;
    }

    protected Account accountDTOToAccount(AccountDTO accountDTO) {
        if ( accountDTO == null ) {
            return null;
        }

        Account account = new Account();

        account.setAccountName( accountDTO.getAccountName() );
        account.setBalance( accountDTO.getBalance() );
        account.setCurrency( accountDTO.getCurrency() );
        account.setId( accountDTO.getId() );
        account.setUpdateDate( accountDTO.getUpdateDate() );
        account.setUser( userDTOToUser( accountDTO.getUser() ) );

        return account;
    }
}
