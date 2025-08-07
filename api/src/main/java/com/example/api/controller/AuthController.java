package com.example.api.controller;

import com.example.api.dto.UserDTO;
import com.example.api.entity.User;
import com.example.api.requests.LoginRequest;
import com.example.api.requests.SignUpRequest;
import com.example.api.security.CustomUserDetails;
import com.example.api.security.CustomUserDetailsService;
import com.example.api.security.JwtUtil;
import com.example.api.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final AuthenticationManager authManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authManager, CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SignUpRequest signUpRequest) {
        String email = signUpRequest.getEmail();
        String username = signUpRequest.getUsername();
        String password = signUpRequest.getPassword();
        UserDTO user = userService.register(email, username, password);
        if (user != null)
            return ResponseEntity.ok(user);
        else
            return ResponseEntity.badRequest().body("register failed. Account already exists");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        CustomUserDetails userDetails;
        UserDTO user = userService.findByEmail(loginRequest.getEmail());
        try {
            userDetails = userDetailsService.loadUserById(user.getId());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Kullanıcı bulunamadı");
        }

        if (!(loginRequest.getPassword().equals(userDetails.getPassword()))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Geçersiz şifre");
        }

        if(!loginRequest.getPassword().equals(userService.findById(user.getId()).getPassword())){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Geçersiz şifre");
        }

        final String jwt = jwtUtil.generateToken(userDetails.getId());

        Map<String, Object> response = Map.of(
                "token", jwt,
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("validate-token")
    public ResponseEntity<?> validate(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        String payload = jwtUtil.extractPayload(token);

        Long username = jwtUtil.extractUserId(token);

        return ResponseEntity.ok(Map.of("token", token, "payload", payload, "username", username));
    }
}
