package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    // entity to dto
    UserDTO toUserDTO(User user);

    // dto to entity
    User toUser(UserDTO userResponseDto);

    // list of entities to list of dto
    List<UserDTO> toUserDTOList(List<User> userList);

    List<User> toUserList(List<UserDTO> userDtoList);
}
