package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.AccountDTO;
import com.crowallet.backend.dto.InvestmentHoldingDTO;
import com.crowallet.backend.entity.Account;
import com.crowallet.backend.entity.AccountType;
import com.crowallet.backend.entity.AssetType;
import com.crowallet.backend.entity.HoldingType;
import com.crowallet.backend.entity.InvestmentHolding;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface AccountMapper {
    AccountMapper INSTANCE = Mappers.getMapper(AccountMapper.class);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "accountType", target = "accountType", qualifiedByName = "accountTypeToString")
    @Mapping(source = "holdingType", target = "holdingType", qualifiedByName = "holdingTypeToString")
    @Mapping(source = "assetType", target = "assetType", qualifiedByName = "assetTypeToString")
    @Mapping(target = "totalValue", expression = "java(account.getTotalValue())")
    @Mapping(target = "profitLoss", expression = "java(account.getProfitLoss())")
    @Mapping(target = "holdingCount", expression = "java(account.getHoldingCount())")
    @Mapping(source = "holdings", target = "holdings")
    AccountDTO toAccountDTO(Account account);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "holdings", ignore = true)
    @Mapping(source = "accountType", target = "accountType", qualifiedByName = "stringToAccountType")
    @Mapping(source = "holdingType", target = "holdingType", qualifiedByName = "stringToHoldingType")
    @Mapping(source = "assetType", target = "assetType", qualifiedByName = "stringToAssetType")
    Account toAccount(AccountDTO accountDTO);

    List<AccountDTO> toAccountDTOList(List<Account> accounts);

    List<Account> toAccountList(List<AccountDTO> accountDTOS);

    // InvestmentHolding mappings
    @Mapping(source = "account.id", target = "accountId")
    @Mapping(target = "totalValue", expression = "java(holding.getTotalValue())")
    @Mapping(target = "profitLoss", expression = "java(holding.getProfitLoss())")
    InvestmentHoldingDTO toHoldingDTO(InvestmentHolding holding);

    @Mapping(target = "account", ignore = true)
    InvestmentHolding toHolding(InvestmentHoldingDTO dto);

    List<InvestmentHoldingDTO> toHoldingDTOList(List<InvestmentHolding> holdings);

    @Named("accountTypeToString")
    default String accountTypeToString(AccountType accountType) {
        return accountType != null ? accountType.name() : null;
    }

    @Named("stringToAccountType")
    default AccountType stringToAccountType(String accountType) {
        return accountType != null ? AccountType.valueOf(accountType) : AccountType.CURRENCY;
    }

    @Named("holdingTypeToString")
    default String holdingTypeToString(HoldingType holdingType) {
        return holdingType != null ? holdingType.name() : null;
    }

    @Named("stringToHoldingType")
    default HoldingType stringToHoldingType(String holdingType) {
        return holdingType != null ? HoldingType.valueOf(holdingType) : null;
    }

    @Named("assetTypeToString")
    default String assetTypeToString(AssetType assetType) {
        return assetType != null ? assetType.name() : null;
    }

    @Named("stringToAssetType")
    default AssetType stringToAssetType(String assetType) {
        return assetType != null ? AssetType.valueOf(assetType) : null;
    }
}
