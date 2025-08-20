package com.crowallet.backend.service;

import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.mapper.UserMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import com.crowallet.backend.comman.GeneralException;
import com.crowallet.backend.entity.User;
import com.crowallet.backend.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO register(String email, String username, String password){
        User usr = userRepository.findByUsername(username).orElse(null);
        if (usr != null) {
            return null;
        }
        usr = userRepository.findByEmail(email).orElse(null);
        if(usr != null){
            return null;
        }
        User user = new User(email, username, password);
        userRepository.save(user);
        return UserMapper.INSTANCE.toUserDTO(user);
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

        existingUser.setUsername(updatedUser.getUsername());
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

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public UserDTO findByEmail(String email) {
        return UserMapper.INSTANCE.toUserDTO(userRepository.findByEmail(email).orElse(null));
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public boolean verify(String password, Long id) {
        User user = userRepository.findById(id).orElse(null);
        if(user != null) {
            return password.equals(user.getPassword());
        } else {
            return false;
        }
    }
}