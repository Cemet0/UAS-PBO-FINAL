package com.emberlord.controller;

import com.emberlord.entity.DonasiDana;
import com.emberlord.repository.DonasiDanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller untuk mengelola operasi CRUD Donasi Dana Tunai.
 * Menyediakan endpoint API di /api/donasi-dana.
 */
@RestController
@RequestMapping("/api/donasi-dana")
@CrossOrigin(origins = "*") // Mengaktifkan CORS untuk interaksi frontend-backend
public class DonasiDanaController {

    @Autowired
    private DonasiDanaRepository donasiDanaRepository;

    /**
     * Endpoint untuk mendaftarkan komitmen donasi dana baru (Create).
     * POST /api/donasi-dana
     */
    @PostMapping
    public DonasiDana createDonasiDana(@Valid @RequestBody DonasiDana donasiDana) {
        // Set status awal transaksi jika kosong
        if (donasiDana.getStatusTransaksi() == null || donasiDana.getStatusTransaksi().trim().isEmpty()) {
            donasiDana.setStatusTransaksi("Pending");
        }
        return donasiDanaRepository.save(donasiDana);
    }

    /**
     * Endpoint untuk melihat seluruh data donasi dana (Read All).
     * GET /api/donasi-dana
     */
    @GetMapping
    public List<DonasiDana> getAllDonasiDana() {
        return donasiDanaRepository.findAll();
    }

    /**
     * Endpoint untuk mendapatkan data donasi dana berdasarkan ID (Read by ID).
     * GET /api/donasi-dana/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DonasiDana> getDonasiDanaById(@PathVariable Long id) {
        Optional<DonasiDana> donasiDana = donasiDanaRepository.findById(id);
        if (donasiDana.isPresent()) {
            return ResponseEntity.ok(donasiDana.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk memperbarui data donasi dana (Update).
     * PUT /api/donasi-dana/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DonasiDana> updateDonasiDana(@PathVariable Long id, @Valid @RequestBody DonasiDana donasiDanaDetails) {
        Optional<DonasiDana> optionalDonasiDana = donasiDanaRepository.findById(id);
        if (optionalDonasiDana.isPresent()) {
            DonasiDana donasiDana = optionalDonasiDana.get();
            donasiDana.setNamaDonatur(donasiDanaDetails.getNamaDonatur());
            donasiDana.setJumlahDana(donasiDanaDetails.getJumlahDana());
            donasiDana.setMetodePembayaran(donasiDanaDetails.getMetodePembayaran());
            donasiDana.setStatusTransaksi(donasiDanaDetails.getStatusTransaksi());
            donasiDana.setNoRekeningHp(donasiDanaDetails.getNoRekeningHp());
            donasiDana.setPeruntukanDana(donasiDanaDetails.getPeruntukanDana());
            DonasiDana updatedDonasiDana = donasiDanaRepository.save(donasiDana);
            return ResponseEntity.ok(updatedDonasiDana);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk membatalkan donasi dana dengan menghapus datanya (Delete).
     * DELETE /api/donasi-dana/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonasiDana(@PathVariable Long id) {
        Optional<DonasiDana> optionalDonasiDana = donasiDanaRepository.findById(id);
        if (optionalDonasiDana.isPresent()) {
            donasiDanaRepository.delete(optionalDonasiDana.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
