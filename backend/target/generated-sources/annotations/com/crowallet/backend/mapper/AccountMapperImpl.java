package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-19T15:04:08+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 24.0.2 (Oracle Corporation)"
)
public class AccountMapperImpl implements AccountMapper {

    @Override
    public AccountDTO toAccountDTO(Account account) {
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

    @Override
    public Account toAccount(AccountDTO accountDTO) {
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

        userDTO.setId( user.getId() );
        userDTO.setUsername( user.getUsername() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setPassword( user.getPassword() );

        return userDTO;
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
}
