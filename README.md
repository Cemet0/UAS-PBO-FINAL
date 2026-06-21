# EmberLord Emergency Portal

**EmberLord** adalah portal taktis manajemen logistik, tanggap darurat, dan koordinasi bantuan kebencanaan secara real-time. Dengan tampilan antarmuka bertema gelap (*tactical dark mode*) yang premium dan dinamis, aplikasi ini mengintegrasikan frontend berbasis *Single Page Application (SPA)* dengan backend tangguh menggunakan Java Spring Boot, JPA, dan basis data H2.

---

## Deskripsi Aplikasi

EmberLord dirancang untuk mempercepat koordinasi bantuan kemanusiaan serta pelaporan darurat saat terjadi bencana (seperti kebakaran hutan, asap pekat, dan evakuasi darurat). Portal ini menyediakan platform transparan bagi donatur untuk menyalurkan dana maupun barang fisik, membantu korban memulihkan dokumen penting yang hilang, dan memberikan sarana bagi masyarakat untuk melaporkan insiden terkini di lapangan secara langsung kepada petugas penyelamat beserta lampiran foto.

---

## Fitur Utama Aplikasi

### 1. Peta Zona Bahaya & Posko Evakuasi
* **Peta Interaktif (Leaflet JS)**: Visualisasi spasial zona bahaya api (*danger zone*) dan posko aman terdekat secara real-time.
* **Kontrol Peta Kustom**: Zoom in, zoom out, penukaran tipe peta (Satelit / Roadmap), dan fokus lokasi berbasis GPS perangkat.
* **Kapasitas Posko**: Status sisa kapasitas dan status kerawanan posko terdekat (*Leluasa, Normal, Hampir Penuh*).

### 2. Portal Donasi Terbuka (Donasi Transparan)
* **Donasi Barang Fisik**:
  * Pendaftaran komitmen donasi logistik (contoh: selimut, masker, popok bayi).
  * Pelacakan status pengiriman (*Pending, Dikirim, Diterima, Diproses*).
  * Fitur pencarian cepat dan CRUD terintegrasi.
* **Donasi Dana Tunai**:
  * Form input donasi dana yang rapi berdampingan dengan informasi rekening bank resmi EmberLord.
  * Pencatatan peruntukan dana dan nomor rekening/HP pengirim secara aman.
  * **Buku Kas Digital & Transparansi Finansial**: Saldo kas total dan alokasi dana akan ter-update secara dinamis di dashboard hanya jika status transaksi donasi diset menjadi **Berhasil** (*Verified*).

### 3. Pusat Pemulihan Dokumen Korban
* **Wizard Pendaftaran Profil Korban**: Perekaman identitas korban bencana (Nama, NIK, No. KK, Alamat Asal, Kelompok Rentan, dan Status Kerusakan Rumah).
* **Manajemen Profil**: Riwayat pendaftaran terintegrasi penuh dengan CRUD REST API backend, mendukung pencarian global berdasarkan NIK atau Nama korban.

### 4. Hotline Pengaduan & Bantuan Darurat
* **Tombol Darurat SOS**: Pemicu cepat untuk mensimulasikan pengiriman koordinat GPS darurat ke BASARNAS/Ambulans terdekat.
* **Hotline Kontak Taktis**: Hubungan cepat ke Damkar (113), Ambulans (118/119), dan BASARNAS.
* **Lapor Kejadian Baru**:
  * Formulir pelaporan kejadian dengan atribut Lokasi, Kondisi Terkini (Kategori), dan Estimasi Korban.
  * **Unggah Foto Lapangan**: Pengguna dapat mengunggah file foto atau menyeret gambar (*Drag & Drop*) ke area upload. Foto dikonversi menjadi data Base64 dan disimpan di database.
  * **Status Laporan Saya**: Tabel dinamis untuk memantau status penanganan petugas (dot status merah/biru/hijau).
  * **Modal Detail Kustom**: Melihat detail lengkap laporan beserta foto kondisi lapangan dalam modal pop-up modern.
  * **Aksi Batalkan Laporan**: Menghapus laporan kejadian secara real-time dari database.

### 5. Asisten Virtual (EmberBot Chatbot Widget)
* AI Chatbot taktis mengambang di pojok kanan bawah yang merespons pertanyaan pengguna secara cerdas seputar lokasi posko terdekat, kebutuhan logistik mendesak, prosedur pemulihan dokumen, dan tips keselamatan darurat.

---

## Arsitektur & Teknologi Stack

### Backend
* **Java 17 / Spring Boot**: Kerangka kerja backend REST API yang cepat dan modular.
* **Spring Data JPA & Hibernate**: Pemetaan objek ke basis data (*ORM*).
* **H2 Database (In-Memory)**: Basis data dalam memori untuk portabilitas tinggi dengan skema tabel otomatis (`ddl-auto=update`).
* **Maven**: Manajemen dependensi proyek Java.

### Frontend
* **Vanilla HTML5 & CSS3**: Struktur halaman semantik dan desain CSS kustom (tanpa framework/Tailwind CSS) yang responsif dan berestetika premium.
* **Vanilla Javascript (ES6)**: Manajemen state global, manipulasi DOM interaktif, penukaran tab, router SPA, penanganan Base64, dan integrasi AJAX Fetch API ke backend.
* **Leaflet JS & FontAwesome**: Rendering peta interaktif dan paket ikon modern.

---

## Cara Menjalankan Aplikasi

### Langkah 1: Jalankan Server Backend (Spring Boot)
Pastikan Anda memiliki Maven terinstal, masuk ke direktori `/backend`, lalu jalankan perintah:
```bash
mvn spring-boot:run
```
Server backend akan berjalan di **`http://localhost:8080`**.

### Langkah 2: Buka Antarmuka Frontend
Buka file `index.html` yang terletak di direktori `/frontend` menggunakan browser favorit Anda (atau gunakan ekstensi *Live Server* di VS Code pada port `5500`).
