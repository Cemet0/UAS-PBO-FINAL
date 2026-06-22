package com.emberlord.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler untuk menangkap error validasi (@Valid)
 * dan mengembalikan response JSON yang rapi dengan pesan error per field.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Menangani error validasi dari anotasi @Valid / @NotBlank / @NotNull / @Min.
     * Mengembalikan HTTP 400 Bad Request dengan detail field yang gagal validasi.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();

        // Kumpulkan semua field yang gagal validasi beserta pesannya
        ex.getBindingResult().getFieldErrors().forEach(error ->
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        Map<String, Object> response = new HashMap<>();
        response.put("status", 400);
        response.put("error", "Validasi Gagal");
        response.put("pesan", "Data yang dikirim tidak valid. Periksa field berikut:");
        response.put("detail", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
