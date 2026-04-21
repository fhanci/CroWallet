package com.crowallet.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.crowallet.backend.dto.ExchangeRateRequestDTO;
import com.crowallet.backend.entity.ExchangeRate;

@Mapper(componentModel = "spring")
public interface ExchangeRateMapper {

    
    ExchangeRate toEntity(ExchangeRateRequestDTO dto);

    ExchangeRateRequestDTO toDto(ExchangeRate entity);


    List<ExchangeRate> toEntityList(List<ExchangeRateRequestDTO> dtos);

    List<ExchangeRateRequestDTO> toDtoList(List<ExchangeRate> entities);
}
