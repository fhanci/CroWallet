package com.example.api.service;

import com.example.api.dto.UserDTO;
import com.example.api.mapper.UserMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import com.example.api.comman.GeneralException;
import com.example.api.entity.User;
import com.example.api.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO createUser(UserDTO user) {
        User user1 = UserMapper.INSTANCE.toUser(user);
        userRepository.save(user1);
        return user;
    }

    public List<UserDTO> getAllUsers() {
        return UserMapper.INSTANCE.toUserDTOList(userRepository.findAll());
    }

    public UserDTO getUserById(Long id) {
        return UserMapper.INSTANCE.toUserDTO(userRepository.findById(id)
                .orElseThrow(() -> new GeneralException("User not found: " + id)));
    }

    @Transactional
    public UserDTO updateUser(Long id, UserDTO updatedUser) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new GeneralException("User to be updated not found: " + id));

        existingUser.setName(updatedUser.getName());
        existingUser.setPassword(updatedUser.getPassword());
        existingUser.setEmail(updatedUser.getEmail());

        userRepository.save(existingUser);
        return UserMapper.INSTANCE.toUserDTO(existingUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new GeneralException("User to be deleted not found: " + id);
        }
        userRepository.deleteById(id);
    }
}