package com.emberlord.controller;

import com.emberlord.entity.LaporanKejadian;
import com.emberlord.repository.LaporanKejadianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller untuk mengelola operasi CRUD Laporan Kejadian.
 * Menyediakan endpoint API di /api/laporan-kejadian.
 */
@RestController
@RequestMapping("/api/laporan-kejadian")
@CrossOrigin(origins = "*") // Mengaktifkan CORS untuk interaksi frontend-backend
public class LaporanKejadianController {

    @Autowired
    private LaporanKejadianRepository laporanKejadianRepository;

    /**
     * Endpoint untuk mendaftarkan laporan kejadian baru (Create).
     * POST /api/laporan-kejadian
     */
    @PostMapping
    public LaporanKejadian createLaporan(@Valid @RequestBody LaporanKejadian laporan) {
        // Set status awal jika kosong
        if (laporan.getStatusLaporan() == null || laporan.getStatusLaporan().trim().isEmpty()) {
            laporan.setStatusLaporan("Pending");
        }
        // Set waktu lapor jika kosong
        if (laporan.getWaktuLapor() == null || laporan.getWaktuLapor().trim().isEmpty()) {
            LocalTime now = LocalTime.now();
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm");
            laporan.setWaktuLapor("Hari ini, " + now.format(dtf));
        }
        return laporanKejadianRepository.save(laporan);
    }

    /**
     * Endpoint untuk melihat seluruh data laporan (Read All).
     * GET /api/laporan-kejadian
     */
    @GetMapping
    public List<LaporanKejadian> getAllLaporan() {
        return laporanKejadianRepository.findAll();
    }

    /**
     * Endpoint untuk mendapatkan data laporan berdasarkan ID (Read by ID).
     * GET /api/laporan-kejadian/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<LaporanKejadian> getLaporanById(@PathVariable Long id) {
        Optional<LaporanKejadian> laporan = laporanKejadianRepository.findById(id);
        if (laporan.isPresent()) {
            return ResponseEntity.ok(laporan.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk memperbarui data laporan (Update).
     * PUT /api/laporan-kejadian/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<LaporanKejadian> updateLaporan(@PathVariable Long id, @Valid @RequestBody LaporanKejadian laporanDetails) {
        Optional<LaporanKejadian> optionalLaporan = laporanKejadianRepository.findById(id);
        if (optionalLaporan.isPresent()) {
            LaporanKejadian laporan = optionalLaporan.get();
            laporan.setLokasi(laporanDetails.getLokasi());
            laporan.setKondisi(laporanDetails.getKondisi());
            laporan.setEstimasiKorban(laporanDetails.getEstimasiKorban());
            laporan.setStatusLaporan(laporanDetails.getStatusLaporan());
            laporan.setFoto(laporanDetails.getFoto());
            if (laporanDetails.getWaktuLapor() != null && !laporanDetails.getWaktuLapor().trim().isEmpty()) {
                laporan.setWaktuLapor(laporanDetails.getWaktuLapor());
            }
            LaporanKejadian updatedLaporan = laporanKejadianRepository.save(laporan);
            return ResponseEntity.ok(updatedLaporan);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Endpoint untuk membatalkan/menghapus laporan kejadian (Delete).
     * DELETE /api/laporan-kejadian/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLaporan(@PathVariable Long id) {
        Optional<LaporanKejadian> optionalLaporan = laporanKejadianRepository.findById(id);
        if (optionalLaporan.isPresent()) {
            laporanKejadianRepository.delete(optionalLaporan.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
