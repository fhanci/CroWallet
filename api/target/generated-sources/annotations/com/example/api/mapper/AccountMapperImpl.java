package com.example.api.mapper;

import com.example.api.dto.AccountDTO;
import com.example.api.dto.UserDTO;
import com.example.api.entity.Account;
import com.example.api.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-06T07:40:08+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.42.50.v20250729-0351, environment: Java 21.0.8 (Eclipse Adoptium)"
)
public class AccountMapperImpl implements AccountMapper {

    @Override
    public AccountDTO toAccountDTO(Account account) {
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

    @Override
    public Account toAccount(AccountDTO accountDTO) {
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
}
