package com.crowallet.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.crowallet.backend.dto.InvestmentDTO;
import com.crowallet.backend.entity.Investment;

@Mapper(componentModel = "spring")
public interface InvestmentMapper {

    Investment toEntity(InvestmentDTO dto);

    InvestmentDTO toDto(Investment entity);

    List<InvestmentDTO> toDtoList(List<Investment> entities);

    List<Investment> toEntityList(List<InvestmentDTO> dtos);
    
}
