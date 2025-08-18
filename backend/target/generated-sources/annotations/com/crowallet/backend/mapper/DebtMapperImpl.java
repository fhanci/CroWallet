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
    date = "2025-08-18T13:17:57+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 22.0.2 (Oracle Corporation)"
)
public class DebtMapperImpl implements DebtMapper {

    @Override
    public Debt toDebt(DebtDTO debtDTO) {
        if ( debtDTO == null ) {
            return null;
        }

        Debt debt = new Debt();

        debt.setId( debtDTO.getId() );
        debt.setDebtAmount( debtDTO.getDebtAmount() );
        debt.setDebtCurrency( debtDTO.getDebtCurrency() );
        debt.setToWhom( debtDTO.getToWhom() );
        debt.setDueDate( debtDTO.getDueDate() );
        debt.setStatus( debtDTO.getStatus() );
        debt.setWarningPeriod( debtDTO.getWarningPeriod() );
        debt.setUser( userDTOToUser( debtDTO.getUser() ) );
        debt.setAccount( accountDTOToAccount( debtDTO.getAccount() ) );

        return debt;
    }

    @Override
    public DebtDTO toDebtDTO(Debt debt) {
        if ( debt == null ) {
            return null;
        }

        DebtDTO debtDTO = new DebtDTO();

        debtDTO.setId( debt.getId() );
        debtDTO.setDebtAmount( debt.getDebtAmount() );
        debtDTO.setDebtCurrency( debt.getDebtCurrency() );
        debtDTO.setToWhom( debt.getToWhom() );
        debtDTO.setDueDate( debt.getDueDate() );
        debtDTO.setStatus( debt.getStatus() );
        debtDTO.setWarningPeriod( debt.getWarningPeriod() );
        debtDTO.setUser( userToUserDTO( debt.getUser() ) );
        debtDTO.setAccount( accountToAccountDTO( debt.getAccount() ) );

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
}
