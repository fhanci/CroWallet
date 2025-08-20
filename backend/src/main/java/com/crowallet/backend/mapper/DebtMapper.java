package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.DebtDTO;
import com.crowallet.backend.entity.Debt;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface DebtMapper {
    DebtMapper INSTANCE = Mappers.getMapper(DebtMapper.class);

    public Debt toDebt(DebtDTO debtDTO);

    public DebtDTO toDebtDTO(Debt debt);

    public List<Debt> toDebtList(List<DebtDTO> debts);

    public List<DebtDTO> toDebtDTOList(List<Debt> debts);
}
