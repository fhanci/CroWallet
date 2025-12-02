package com.crowallet.backend.controller;

import com.crowallet.backend.dto.UserDTO;
import com.crowallet.backend.requests.LoginRequest;
import com.crowallet.backend.requests.SignUpRequest;
import com.crowallet.backend.security.CustomUserDetails;
import com.crowallet.backend.security.CustomUserDetailsService;
import com.crowallet.backend.security.JwtUtil;
import com.crowallet.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "localhost:5050")
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;



    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public AuthController( CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
 
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SignUpRequest signUpRequest) {
        String email = signUpRequest.getEmail();
        String username = signUpRequest.getUsername();
        String password = signUpRequest.getPassword();

        // Validate required fields
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "EMAIL_REQUIRED"));
        }
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "USERNAME_REQUIRED"));
        }
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "PASSWORD_REQUIRED"));
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "PASSWORD_TOO_SHORT"));
        }

        // Check if email already exists
        if (userService.findByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "EMAIL_EXISTS"));
        }

        // Check if username already exists
        if (userService.findByUsername(username) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "USERNAME_EXISTS"));
        }

        UserDTO user = userService.register(email, username, password);
        if (user != null)
            return ResponseEntity.ok(user);
        else
            return ResponseEntity.badRequest().body(Map.of("error", "REGISTRATION_FAILED"));
    }

    @PostMapping("/login")
    @CrossOrigin(allowCredentials = "true")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        // Validate required fields
        if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "EMAIL_REQUIRED"));
        }
        if (loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "PASSWORD_REQUIRED"));
        }

        CustomUserDetails userDetails;
        UserDTO user = userService.findByEmail(loginRequest.getEmail());

        // Check if user exists
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "USER_NOT_FOUND"));
        }

        try {
            userDetails = userDetailsService.loadUserById(user.getId());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "USER_NOT_FOUND"));
        }

        // Password check
        if (!loginRequest.getPassword().equals(userDetails.getPassword()) ||
                !loginRequest.getPassword().equals(userService.findById(user.getId()).getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "INVALID_PASSWORD"));
        }

        // Token üretimi
        final String jwt = jwtUtil.generateToken(userDetails.getId());
        final String refresh = jwtUtil.generateRefreshToken(userDetails.getId());

        // Cookie oluştur
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refresh)
                .httpOnly(true)
                .secure(false) // Geliştirme ortamı için false, prod'da true olmalı
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 gün
                .sameSite("Lax") // Cross-origin için Lax veya None
                .build();

        // Cookie'yi response'a ekle
        response.addHeader("Set-Cookie", cookie.toString());

        // Body ile birlikte access token ve kullanıcı bilgileri gönder
        Map<String, Object> responseBody = Map.of(
                "token", jwt,
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail()
        );

        return ResponseEntity.ok(responseBody);
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
