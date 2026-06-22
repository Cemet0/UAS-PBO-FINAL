package com.emberlord.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Entitas JPA untuk data Laporan Kejadian bencana.
 * Dipetakan ke tabel 'laporan_kejadian' di database.
 */
@Entity
@Table(name = "laporan_kejadian")
public class LaporanKejadian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Lokasi kejadian tidak boleh kosong")
    private String lokasi;

    @NotBlank(message = "Kondisi kejadian tidak boleh kosong")
    private String kondisi;

    @NotNull(message = "Estimasi korban tidak boleh kosong")
    @Min(value = 0, message = "Estimasi korban tidak boleh negatif")
    private Integer estimasiKorban;

    private String waktuLapor;

    private String statusLaporan;

    @Lob
    private String foto; // Menyimpan string Base64 gambar

    // Konstruktor Default
    public LaporanKejadian() {
    }

    // Konstruktor Lengkap
    public LaporanKejadian(Long id, String lokasi, String kondisi, Integer estimasiKorban, String waktuLapor, String statusLaporan, String foto) {
        this.id = id;
        this.lokasi = lokasi;
        this.kondisi = kondisi;
        this.estimasiKorban = estimasiKorban;
        this.waktuLapor = waktuLapor;
        this.statusLaporan = statusLaporan;
        this.foto = foto;
    }

    // Getter dan Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLokasi() {
        return lokasi;
    }

    public void setLokasi(String lokasi) {
        this.lokasi = lokasi;
    }

    public String getKondisi() {
        return kondisi;
    }

    public void setKondisi(String kondisi) {
        this.kondisi = kondisi;
    }

    public Integer getEstimasiKorban() {
        return estimasiKorban;
    }

    public void setEstimasiKorban(Integer estimasiKorban) {
        this.estimasiKorban = estimasiKorban;
    }

    public String getWaktuLapor() {
        return waktuLapor;
    }

    public void setWaktuLapor(String waktuLapor) {
        this.waktuLapor = waktuLapor;
    }

    public String getStatusLaporan() {
        return statusLaporan;
    }

    public void setStatusLaporan(String statusLaporan) {
        this.statusLaporan = statusLaporan;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
}
