package com.emberlord.controller;

import com.emberlord.entity.Korban;
import com.emberlord.repository.KorbanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller untuk mengelola operasi CRUD profil Korban.
 * Menyediakan endpoint API di /api/korban.
 */
@RestController
@RequestMapping("/api/korban")
@CrossOrigin(origins = "*") // Mengaktifkan Cross-Origin Resource Sharing untuk akses dari frontend
public class KorbanController {

    @Autowired
    private KorbanRepository korbanRepository;

    /**
     * Endpoint untuk membuat profil korban baru (Create).
     * POST /api/korban
     */
    @PostMapping
    public Korban createKorban(@Valid @RequestBody Korban korban) {
        return korbanRepository.save(korban);
    }

    /**
     * Endpoint untuk mendapatkan semua data korban (Read All).
     * GET /api/korban
     */
    @GetMapping
    public List<Korban> getAllKorban() {
        return korbanRepository.findAll();
    }

    /**
     * Endpoint untuk mendapatkan data korban berdasarkan ID (Read by ID).
     * GET /api/korban/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Korban> getKorbanById(@PathVariable Long id) {
        Optional<Korban> korban = korbanRepository.findById(id);
        if (korban.isPresent()) {
            return ResponseEntity.ok(korban.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk memperbarui data korban berdasarkan ID (Update).
     * PUT /api/korban/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Korban> updateKorban(@PathVariable Long id, @Valid @RequestBody Korban korbanDetails) {
        Optional<Korban> optionalKorban = korbanRepository.findById(id);
        if (optionalKorban.isPresent()) {
            Korban korban = optionalKorban.get();
            korban.setNama(korbanDetails.getNama());
            korban.setNIK(korbanDetails.getNIK());
            korban.setNomorKK(korbanDetails.getNomorKK());
            korban.setKelompokRentan(korbanDetails.getKelompokRentan());
            korban.setStatusRumah(korbanDetails.getStatusRumah());
            korban.setAlamatAsal(korbanDetails.getAlamatAsal());
            Korban updatedKorban = korbanRepository.save(korban);
            return ResponseEntity.ok(updatedKorban);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk menghapus data korban berdasarkan ID (Delete).
     * DELETE /api/korban/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKorban(@PathVariable Long id) {
        Optional<Korban> optionalKorban = korbanRepository.findById(id);
        if (optionalKorban.isPresent()) {
            korbanRepository.delete(optionalKorban.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
