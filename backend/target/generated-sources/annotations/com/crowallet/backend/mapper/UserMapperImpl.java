package com.crowallet.backend.mapper;

import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-08-19T16:21:56+0300",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.42.50.v20250729-0351, environment: Java 21.0.8 (Eclipse Adoptium)"
)
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toUserDTO(User user) {
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

    @Override
    public User toUser(UserDTO userResponseDto) {
        if ( userResponseDto == null ) {
            return null;
        }

        User user = new User();

        user.setEmail( userResponseDto.getEmail() );
        user.setId( userResponseDto.getId() );
        user.setPassword( userResponseDto.getPassword() );
        user.setUsername( userResponseDto.getUsername() );

        return user;
    }

    @Override
    public List<UserDTO> toUserDTOList(List<User> userList) {
        if ( userList == null ) {
            return null;
        }

        List<UserDTO> list = new ArrayList<UserDTO>( userList.size() );
        for ( User user : userList ) {
            list.add( toUserDTO( user ) );
        }

        return list;
    }

    @Override
    public List<User> toUserList(List<UserDTO> userDtoList) {
        if ( userDtoList == null ) {
            return null;
        }

        List<User> list = new ArrayList<User>( userDtoList.size() );
        for ( UserDTO userDTO : userDtoList ) {
            list.add( toUser( userDTO ) );
        }

        return list;
    }
}
