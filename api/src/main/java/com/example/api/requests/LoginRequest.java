package com.example.api.requests;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}