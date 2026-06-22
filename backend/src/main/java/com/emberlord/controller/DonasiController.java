package com.emberlord.controller;

import com.emberlord.entity.DonasiBarang;
import com.emberlord.repository.DonasiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller untuk mengelola operasi CRUD Donasi Barang.
 * Menyediakan endpoint API di /api/donasi.
 */
@RestController
@RequestMapping("/api/donasi")
@CrossOrigin(origins = "*") // Mengaktifkan CORS untuk interaksi frontend-backend
public class DonasiController {

    @Autowired
    private DonasiRepository donasiRepository;

    /**
     * Endpoint untuk mendaftarkan komitmen donasi barang baru (Create).
     * POST /api/donasi
     */
    @PostMapping
    public DonasiBarang createDonasi(@Valid @RequestBody DonasiBarang donasi) {
        // Set status awal pengiriman jika kosong
        if (donasi.getStatusPengiriman() == null || donasi.getStatusPengiriman().trim().isEmpty()) {
            donasi.setStatusPengiriman("Pending");
        }
        return donasiRepository.save(donasi);
    }

    /**
     * Endpoint untuk melihat seluruh data donasi barang (Read All).
     * GET /api/donasi
     */
    @GetMapping
    public List<DonasiBarang> getAllDonasi() {
        return donasiRepository.findAll();
    }

    /**
     * Endpoint untuk mendapatkan data donasi berdasarkan ID (Read by ID).
     * GET /api/donasi/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DonasiBarang> getDonasiById(@PathVariable Long id) {
        Optional<DonasiBarang> donasi = donasiRepository.findById(id);
        if (donasi.isPresent()) {
            return ResponseEntity.ok(donasi.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk memperbarui data donasi atau status pengiriman (Update).
     * PUT /api/donasi/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DonasiBarang> updateDonasi(@PathVariable Long id, @Valid @RequestBody DonasiBarang donasiDetails) {
        Optional<DonasiBarang> optionalDonasi = donasiRepository.findById(id);
        if (optionalDonasi.isPresent()) {
            DonasiBarang donasi = optionalDonasi.get();
            donasi.setNamaDonatur(donasiDetails.getNamaDonatur());
            donasi.setNamaBarang(donasiDetails.getNamaBarang());
            donasi.setJumlah(donasiDetails.getJumlah());
            donasi.setStatusPengiriman(donasiDetails.getStatusPengiriman());
            DonasiBarang updatedDonasi = donasiRepository.save(donasi);
            return ResponseEntity.ok(updatedDonasi);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk membatalkan donasi dengan menghapus datanya (Delete).
     * DELETE /api/donasi/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonasi(@PathVariable Long id) {
        Optional<DonasiBarang> optionalDonasi = donasiRepository.findById(id);
        if (optionalDonasi.isPresent()) {
            donasiRepository.delete(optionalDonasi.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
