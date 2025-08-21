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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@CrossOrigin(origins = "localhost:5050")
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
    @CrossOrigin(allowCredentials = "true")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        CustomUserDetails userDetails;
        UserDTO user = userService.findByEmail(loginRequest.getEmail());
        try {
            userDetails = userDetailsService.loadUserById(user.getId());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Kullanıcı bulunamadı");
        }

        // Şifre kontrolü
        if (!loginRequest.getPassword().equals(userDetails.getPassword()) ||
                !loginRequest.getPassword().equals(userService.findById(user.getId()).getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Geçersiz şifre");
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
