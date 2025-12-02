package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.dto.DebtPaymentDTO;
import com.crowallet.backend.dto.InvestmentHoldingDTO;
import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.Debt;
import com.crowallet.backend.entity.DebtPayment;
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
public class DebtMapperImpl implements DebtMapper {

    @Override
    public Debt toDebt(DebtDTO debtDTO) {
        if ( debtDTO == null ) {
            return null;
        }

        Debt debt = new Debt();

        debt.setDebtType( stringToDebtType( debtDTO.getDebtType() ) );
        debt.setPaymentType( stringToPaymentType( debtDTO.getPaymentType() ) );
        debt.setPaymentFrequency( stringToPaymentFrequency( debtDTO.getPaymentFrequency() ) );
        debt.setDebtAmount( debtDTO.getDebtAmount() );
        debt.setDebtCurrency( debtDTO.getDebtCurrency() );
        debt.setDescription( debtDTO.getDescription() );
        debt.setDueDate( debtDTO.getDueDate() );
        debt.setId( debtDTO.getId() );
        debt.setInstallmentAmount( debtDTO.getInstallmentAmount() );
        debt.setPaidInstallments( debtDTO.getPaidInstallments() );
        debt.setRemainingAmount( debtDTO.getRemainingAmount() );
        debt.setStartDate( debtDTO.getStartDate() );
        debt.setStatus( debtDTO.getStatus() );
        debt.setToWhom( debtDTO.getToWhom() );
        debt.setTotalInstallments( debtDTO.getTotalInstallments() );
        debt.setWarningPeriod( debtDTO.getWarningPeriod() );

        return debt;
    }

    @Override
    public DebtDTO toDebtDTO(Debt debt) {
        if ( debt == null ) {
            return null;
        }

        DebtDTO debtDTO = new DebtDTO();

        debtDTO.setDebtType( debtTypeToString( debt.getDebtType() ) );
        debtDTO.setPaymentType( paymentTypeToString( debt.getPaymentType() ) );
        debtDTO.setPaymentFrequency( paymentFrequencyToString( debt.getPaymentFrequency() ) );
        debtDTO.setAccount( accountToAccountDTO( debt.getAccount() ) );
        debtDTO.setDebtAmount( debt.getDebtAmount() );
        debtDTO.setDebtCurrency( debt.getDebtCurrency() );
        debtDTO.setDescription( debt.getDescription() );
        debtDTO.setDueDate( debt.getDueDate() );
        debtDTO.setId( debt.getId() );
        debtDTO.setInstallmentAmount( debt.getInstallmentAmount() );
        debtDTO.setPaidInstallments( debt.getPaidInstallments() );
        debtDTO.setRemainingAmount( debt.getRemainingAmount() );
        debtDTO.setStartDate( debt.getStartDate() );
        debtDTO.setStatus( debt.getStatus() );
        debtDTO.setToWhom( debt.getToWhom() );
        debtDTO.setTotalInstallments( debt.getTotalInstallments() );
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

    @Override
    public DebtPaymentDTO toPaymentDTO(DebtPayment payment) {
        if ( payment == null ) {
            return null;
        }

        DebtPaymentDTO debtPaymentDTO = new DebtPaymentDTO();

        debtPaymentDTO.setDebtId( paymentDebtId( payment ) );
        debtPaymentDTO.setDebtToWhom( paymentDebtToWhom( payment ) );
        debtPaymentDTO.setDebtCurrency( paymentDebtDebtCurrency( payment ) );
        debtPaymentDTO.setAccountName( getAccountName( payment ) );
        debtPaymentDTO.setAmount( payment.getAmount() );
        debtPaymentDTO.setId( payment.getId() );
        debtPaymentDTO.setNote( payment.getNote() );
        debtPaymentDTO.setPaidDate( payment.getPaidDate() );
        debtPaymentDTO.setPaymentDate( payment.getPaymentDate() );
        debtPaymentDTO.setPaymentNumber( payment.getPaymentNumber() );
        debtPaymentDTO.setStatus( payment.getStatus() );

        return debtPaymentDTO;
    }

    @Override
    public DebtPayment toPayment(DebtPaymentDTO dto) {
        if ( dto == null ) {
            return null;
        }

        DebtPayment debtPayment = new DebtPayment();

        debtPayment.setAmount( dto.getAmount() );
        debtPayment.setId( dto.getId() );
        debtPayment.setNote( dto.getNote() );
        debtPayment.setPaidDate( dto.getPaidDate() );
        debtPayment.setPaymentDate( dto.getPaymentDate() );
        debtPayment.setPaymentNumber( dto.getPaymentNumber() );
        debtPayment.setStatus( dto.getStatus() );

        return debtPayment;
    }

    @Override
    public List<DebtPaymentDTO> toPaymentDTOList(List<DebtPayment> payments) {
        if ( payments == null ) {
            return null;
        }

        List<DebtPaymentDTO> list = new ArrayList<DebtPaymentDTO>( payments.size() );
        for ( DebtPayment debtPayment : payments ) {
            list.add( toPaymentDTO( debtPayment ) );
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

    private Long paymentDebtId(DebtPayment debtPayment) {
        Debt debt = debtPayment.getDebt();
        if ( debt == null ) {
            return null;
        }
        return debt.getId();
    }

    private String paymentDebtToWhom(DebtPayment debtPayment) {
        Debt debt = debtPayment.getDebt();
        if ( debt == null ) {
            return null;
        }
        return debt.getToWhom();
    }

    private String paymentDebtDebtCurrency(DebtPayment debtPayment) {
        Debt debt = debtPayment.getDebt();
        if ( debt == null ) {
            return null;
        }
        return debt.getDebtCurrency();
    }
}
