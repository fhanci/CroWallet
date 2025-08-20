package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.Debt;
import com.crowallet.backend.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-19T16:21:56+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.42.50.v20250729-0351, environment: Java 21.0.8 (Eclipse Adoptium)"
)
public class DebtMapperImpl implements DebtMapper {

    @Override
    public Debt toDebt(DebtDTO debtDTO) {
        if ( debtDTO == null ) {
            return null;
        }

        Debt debt = new Debt();

        debt.setAccount( accountDTOToAccount( debtDTO.getAccount() ) );
        debt.setDebtAmount( debtDTO.getDebtAmount() );
        debt.setDebtCurrency( debtDTO.getDebtCurrency() );
        debt.setDueDate( debtDTO.getDueDate() );
        debt.setId( debtDTO.getId() );
        debt.setStatus( debtDTO.getStatus() );
        debt.setToWhom( debtDTO.getToWhom() );
        debt.setUser( userDTOToUser( debtDTO.getUser() ) );
        debt.setWarningPeriod( debtDTO.getWarningPeriod() );

        return debt;
    }

    @Override
    public DebtDTO toDebtDTO(Debt debt) {
        if ( debt == null ) {
            return null;
        }

        DebtDTO debtDTO = new DebtDTO();

        debtDTO.setAccount( accountToAccountDTO( debt.getAccount() ) );
        debtDTO.setDebtAmount( debt.getDebtAmount() );
        debtDTO.setDebtCurrency( debt.getDebtCurrency() );
        debtDTO.setDueDate( debt.getDueDate() );
        debtDTO.setId( debt.getId() );
        debtDTO.setStatus( debt.getStatus() );
        debtDTO.setToWhom( debt.getToWhom() );
        debtDTO.setUser( userToUserDTO( debt.getUser() ) );
        debtDTO.setWarningPeriod( debt.getWarningPeriod() );

        return debtDTO;
    }

    @Override
    public List<Debt> toDebtList(List<DebtDTO> debts) {
        if ( debts == null ) {
            return null;
        }

        List<Debt> list = new ArrayList<Debt>( debts.size() );
        for ( DebtDTO debtDTO : debts ) {
            list.add( toDebt( debtDTO ) );
        }

        return list;
    }

    @Override
    public List<DebtDTO> toDebtDTOList(List<Debt> debts) {
        if ( debts == null ) {
            return null;
        }

        List<DebtDTO> list = new ArrayList<DebtDTO>( debts.size() );
        for ( Debt debt : debts ) {
            list.add( toDebtDTO( debt ) );
        }

        return list;
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
}
