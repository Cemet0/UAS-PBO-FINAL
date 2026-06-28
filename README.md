# EmberLord Emergency Portal

**EmberLord** adalah portal taktis manajemen logistik, tanggap darurat, dan koordinasi bantuan kebencanaan secara _real-time_. Dengan tampilan antarmuka bertema gelap (_tactical dark mode_) yang premium dan dinamis, aplikasi ini mengintegrasikan frontend berbasis _Single Page Application (SPA)_ dengan backend REST API Java Spring Boot, JPA, dan basis data H2.

---

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Konfigurasi Environment (.env)](#konfigurasi-environment-env)
- [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
- [Fitur Utama](#fitur-utama-aplikasi)
- [Arsitektur & Teknologi Stack](#arsitektur--teknologi-stack)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [EmberBot Chatbot](#emberbot-chatbot)
- [Troubleshooting](#troubleshooting)

---

## Prasyarat

Sebelum menjalankan aplikasi, pastikan lingkungan Anda memiliki:

- **Java 17+** — [Download JDK 17](https://adoptium.net/)
- **Maven 3.8+** — [Download Maven](https://maven.apache.org/download.cgi)
- **Browser modern** (Chrome, Firefox, Edge)
- **(Opsional) Ollama** — untuk menjalankan EmberBot chatbot secara lokal ([Download Ollama](https://ollama.com/))

---

## Konfigurasi Environment (.env)

Aplikasi ini mendukung konfigurasi melalui _environment variables_. Backend Spring Boot membaca variabel dari environment sistem, sedangkan frontend menggunakan berkas `config.js`.

### 1. Backend

Salin `.env.example` ke `.env` di **root proyek** lalu sesuaikan:

```bash
cp .env.example .env
```

Spring Boot secara otomatis membaca variabel dari environment. Jika tidak ada `.env`, nilai _default_ akan digunakan (H2 in-memory di port 8080).

### 2. Frontend

Buka `frontend/config.js` dan sesuaikan nilai `API_BASE_URL`, `GITHUB_TOKEN`, dll. sesuai lingkungan Anda.

> **Catatan:** `frontend/config.js` sudah ter-track git. Untuk konfigurasi lokal, buat `frontend/config.local.js` dan load manual.

### Variabel yang Tersedia

| Variabel | Default | Deskripsi |
|---|---|---|
| `SERVER_PORT` | `8080` | Port backend Spring Boot |
| `SPRING_DATASOURCE_URL` | `jdbc:h2:mem:emberlorddb` | JDBC URL database |
| `SPRING_DATASOURCE_USERNAME` | `sa` | Username database |
| `SPRING_DATASOURCE_PASSWORD` | _(kosong)_ | Password database |
| `SPRING_JPA_DDL_AUTO` | `update` | Mode DDL Hibernate |
| `SPRING_JPA_SHOW_SQL` | `true` | Tampilkan query SQL di log |
| `SPRING_H2_CONSOLE_ENABLED` | `true` | Aktifkan H2 web console |
| `MAX_FILE_SIZE` | `15MB` | Maksimal ukuran file upload |
| `MAX_REQUEST_SIZE` | `15MB` | Maksimal ukuran request |
| `GITHUB_TOKEN` | _(kosong)_ | Token API untuk chatbot (GitHub/Ollama) |
| `GITHUB_MODEL` | `llama3.2` | Model LLM untuk chatbot |
| `GITHUB_API_URL` | `http://localhost:11434/v1/chat/completions` | Endpoint API LLM |
| `API_BASE_URL` _(frontend)_ | `http://localhost:8080/api` | Base URL REST API backend |

---

## Cara Menjalankan Aplikasi

### Langkah 1: Jalankan Server Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Atau jalankan dari IDE (VS Code / IntelliJ) dengan membuka `backend/src/main/java/com/emberlord/EmberLordApplication.java` lalu klik tombol **Run**.

Backend akan aktif di **`http://localhost:8080`**.

### Langkah 2: Buka Antarmuka Frontend

Buka `frontend/index.html` di browser Anda.

Untuk pengalaman terbaik, gunakan **Live Server** di VS Code (klik kanan `index.html` > **Open with Live Server**) atau jalankan server statis:

```bash
cd frontend && python3 -m http.server 5500
```

Lalu buka **`http://localhost:5500`** di browser.

### Akses H2 Console

Setelah backend berjalan, buka **`http://localhost:8080/h2-console`** dengan:

- **JDBC URL:** `jdbc:h2:mem:emberlorddb`
- **Username:** `sa`
- **Password:** _(kosongkan)_

---

## Fitur Utama Aplikasi

### 1. Peta Zona Bahaya & Posko Evakuasi
- **Peta Interaktif (Leaflet JS)**: Visualisasi spasial zona bahaya api (_danger zone_) dan posko aman terdekat secara _real-time_.
- **Kontrol Peta Kustom**: Zoom, ganti tipe peta (Satelit / Roadmap), fokus lokasi berbasis GPS perangkat.
- **Kapasitas Posko**: Status sisa kapasitas (_Leluasa, Normal, Hampir Penuh_).

### 2. Portal Donasi Terbuka
- **Donasi Barang Fisik**: Registrasi komitmen donasi logistik, pelacakan status pengiriman (_Pending, Dikirim, Diterima, Diproses_), pencarian cepat & CRUD terintegrasi.
- **Donasi Dana Tunai**: Form input donasi, pencatatan peruntukan dana, nomor rekening/HP pengirim. **Buku Kas Digital** — saldo kas total ter-update otomatis saat status transaksi **Berhasil** (_Verified_).

### 3. Pusat Pemulihan Dokumen Korban
- **Wizard Pendaftaran Profil Korban**: Perekaman identitas (Nama, NIK, No. KK, Alamat Asal, Kelompok Rentan, Status Rumah).
- **Manajemen Profil**: Riwayat terintegrasi penuh dengan CRUD REST API, pencarian global berdasarkan NIK atau Nama.

### 4. Hotline Pengaduan & Bantuan Darurat
- **Tombol Darurat SOS**: Simulasi pengiriman koordinat GPS darurat ke BASARNAS/Ambulans.
- **Hotline Kontak Taktis**: Damkar (113), Ambulans (118/119), BASARNAS.
- **Lapor Kejadian Baru**: Formulir laporan dengan atribut lokasi, kondisi, estimasi korban, **unggah foto** (_Drag & Drop_, konversi Base64).
- **Status Laporan**: Tabel dinamis dengan dot status (merah/biru/hijau) dan modal detail lengkap.

### 5. EmberBot Chatbot Widget
- AI chatbot taktis di pojok kanan bawah untuk informasi posko terdekat, logistik, prosedur dokumen, dan tips keselamatan.

---

## Arsitektur & Teknologi Stack

### Backend
| Teknologi | Keterangan |
|---|---|
| **Java 17 / Spring Boot 3.2.5** | Framework REST API modular |
| **Spring Data JPA & Hibernate** | ORM ke basis data |
| **H2 Database** | Basis data in-memory (_development_) |
| **Maven** | Manajemen dependensi |

### Frontend
| Teknologi | Keterangan |
|---|---|
| **Vanilla HTML5 & CSS3** | Struktur semantik, desain kustom responsif (_tactical dark theme_) |
| **Vanilla JavaScript (ES6)** | State global, DOM manipulation, SPA router, Fetch API |
| **Leaflet.js** | Peta interaktif |
| **FontAwesome** | Paket ikon |

---

## Struktur Proyek

```
├── .env.example              # Contoh konfigurasi environment
├── .gitignore
├── README.md
│
├── backend/                  # Backend Spring Boot (Maven)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/emberlord/
│       │   ├── EmberLordApplication.java
│       │   ├── controller/       # REST Controllers
│       │   │   ├── DonasiController.java
│       │   │   ├── DonasiDanaController.java
│       │   │   ├── KorbanController.java
│       │   │   └── LaporanKejadianController.java
│       │   ├── entity/           # JPA Entities
│       │   │   ├── DonasiBarang.java
│       │   │   ├── DonasiDana.java
│       │   │   ├── Korban.java
│       │   │   └── LaporanKejadian.java
│       │   └── repository/       # JPA Repositories
│       │       ├── DonasiRepository.java
│       │       ├── DonasiDanaRepository.java
│       │       ├── KorbanRepository.java
│       │       └── LaporanKejadianRepository.java
│       └── resources/
│           └── application.properties
│
└── frontend/                 # Frontend SPA
    ├── index.html
    ├── config.js             # Konfigurasi frontend (API URL, Chatbot)
    ├── app.js                # Logika utama SPA
    └── styles.css            # Tema tactical dark mode
```

---

## API Endpoints

Semua endpoint berada di bawah `http://localhost:8080/api/` dengan CORS `*`.

### Donasi Barang (`/api/donasi`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/donasi` | Tambah donasi baru |
| `GET` | `/api/donasi` | Ambil semua donasi |
| `GET` | `/api/donasi/{id}` | Ambil donasi by ID |
| `PUT` | `/api/donasi/{id}` | Update donasi |
| `DELETE` | `/api/donasi/{id}` | Hapus donasi |

### Donasi Dana (`/api/donasi-dana`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/donasi-dana` | Tambah donasi dana baru |
| `GET` | `/api/donasi-dana` | Ambil semua donasi dana |
| `GET` | `/api/donasi-dana/{id}` | Ambil donasi dana by ID |
| `PUT` | `/api/donasi-dana/{id}` | Update donasi dana |
| `DELETE` | `/api/donasi-dana/{id}` | Hapus donasi dana |

### Korban (`/api/korban`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/korban` | Tambah profil korban baru |
| `GET` | `/api/korban` | Ambil semua profil korban |
| `GET` | `/api/korban/{id}` | Ambil profil korban by ID |
| `PUT` | `/api/korban/{id}` | Update profil korban |
| `DELETE` | `/api/korban/{id}` | Hapus profil korban |

### Laporan Kejadian (`/api/laporan-kejadian`)
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/laporan-kejadian` | Tambah laporan baru |
| `GET` | `/api/laporan-kejadian` | Ambil semua laporan |
| `GET` | `/api/laporan-kejadian/{id}` | Ambil laporan by ID |
| `PUT` | `/api/laporan-kejadian/{id}` | Update laporan |
| `DELETE` | `/api/laporan-kejadian/{id}` | Hapus laporan |

---

## EmberBot Chatbot

EmberBot adalah chatbot widget yang menggunakan LLM untuk merespons pertanyaan seputar bencana, posko, dan logistik. Chatbot berjalan **langsung dari browser** (frontend), bukan dari backend.

### Konfigurasi

Buka `frontend/config.js` dan atur:

| Variabel | Deskripsi |
|---|---|
| `GITHUB_TOKEN` | Token API (biarkan kosong jika pakai Ollama lokal) |
| `GITHUB_MODEL` | Model LLM (default: `llama3.2`) |
| `GITHUB_API_URL` | Endpoint API (default: `http://localhost:11434/v1/chat/completions`) |

### Opsi 1: Ollama Lokal (Gratis / Offline)

#### 1. Install & Download Model

```bash
# Download & install dari https://ollama.com/
# Lalu pull model:
ollama pull llama3.2
```

#### 2. Izinkan CORS (Wajib!)

Karena frontend dipanggil dari browser (origin berbeda), Ollama harus diizinkan:

**Windows:**
- Buka **System Properties** → **Environment Variables**
- Tambah **User Variable** baru:
  - Name: `OLLAMA_ORIGINS`
  - Value: `*`
- Restart Ollama (system tray → Quit, lalu jalankan lagi)

**Mac / Linux:**
```bash
export OLLAMA_ORIGINS=*
ollama serve
```

#### 3. Jalankan Ollama

```bash
ollama serve
```

Cek di browser: `http://localhost:11434` — harus muncul `Ollama is running`.

#### 4. Buka Frontend

Jangan buka `index.html` langsung (`file://`). Gunakan **live server**:

| Cara | Perintah |
|---|---|
| VS Code | Install "Live Server" → klik kanan `index.html` → Open with Live Server |
| Python | `python -m http.server 5500` di folder `frontend/` lalu buka `http://localhost:5500` |
| Node.js | `npx serve frontend/` |

#### 5. Test Chatbot

Klik ikon chatbot di pojok kanan bawah, ketik pesan. EmberBot akan merespons menggunakan model llama3.2 lokal.

### Opsi 2: GitHub Models API

Dapatkan token dari [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens) dan set `GITHUB_TOKEN` di `frontend/config.js`.

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| **Port 8080 sudah digunakan** | Set `SERVER_PORT=8081` di `.env` |
| **Backend tidak bisa connect database** | Pastikan Java 17+ sudah terinstal (`java -version`) |
| **Frontend tidak bisa fetch API** | Pastikan backend sudah running di `localhost:8080`. Sesuaikan `API_BASE_URL` di `config.js` jika pakai port berbeda |
| **H2 Console error "Database not found"** | Gunakan JDBC URL: `jdbc:h2:mem:emberlorddb` |
| **Foto tidak terupload** | Periksa ukuran file (max 15MB). Format yang didukung: JPG, PNG |
| **Chatbot tidak merespons** | Pastikan Ollama sudah jalan (`ollama serve`), set `OLLAMA_ORIGINS=*`, dan buka frontend via live server (bukan `file://`) |
| **Chatbot error CORS** | Set environment variable `OLLAMA_ORIGINS=*` lalu restart Ollama |
| **Chatbot error "Authorization"** | Biarkan `GITHUB_TOKEN` kosong di `config.js` jika pakai Ollama lokal |

---

## Lisensi

Proyek ini dikembangkan untuk tujuan edukasi mata kuliah **Pemrograman Berorientasi Objek (PBO)**.
