/* ==========================================================================
   LOGIKA CLIENT-SIDE EMBERLORD (SPA & INTEGRASI CRUD REST API BACKEND)
   Bahasa Komentar: Bahasa Indonesia
   ========================================================================== */

// Konfigurasi Endpoint REST API Java Spring Boot
const API_BASE_URL = 'http://localhost:8080/api';

// State global aplikasi
let currentEditingDonasiId = null;
let currentEditingKorbanId = null;

// Elemen DOM saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    initSPARouter();
    initAuthModal();
    initChatbot();
    initSOSButton();
    
    // Muat data awal dari API backend
    fetchDonasi();
    fetchKorban();

    // Event handler untuk form submit CRUD
    document.getElementById('form-donasi').addEventListener('submit', handleDonasiSubmit);
    document.getElementById('form-korban').addEventListener('submit', handleKorbanSubmit);
    document.getElementById('form-laporan-kejadian').addEventListener('submit', handleLaporanKejadianSubmit);

    // Event listener untuk tombol muat ulang data
    document.getElementById('btn-refresh-donasi').addEventListener('click', fetchDonasi);
    document.getElementById('btn-refresh-korban').addEventListener('click', fetchKorban);
    
    // Batalkan pengeditan
    document.getElementById('btn-cancel-edit-donasi').addEventListener('click', cancelDonasiEdit);
    document.getElementById('btn-cancel-edit-korban').addEventListener('click', cancelKorbanEdit);

    // Filter pencarian global sederhana
    document.getElementById('global-search').addEventListener('input', handleGlobalSearch);
});

/* ==========================================================================
   1. ROUTER SPA (SINGLE PAGE APPLICATION) SISI KLIEN
   ========================================================================== */
function initSPARouter() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.dashboard-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Hapus kelas aktif dari semua nav
            navItems.forEach(nav => nav.classList.remove('active'));
            // Tambahkan kelas aktif pada item terpilih
            item.classList.add('active');

            // Ambil view target
            const targetViewId = item.getAttribute('data-target');

            // Sembunyikan semua view, tampilkan view target
            views.forEach(view => {
                if (view.id === targetViewId) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });
}

/* ==========================================================================
   2. OPERASI CRUD DONASI BARANG (FETCH API)
   ========================================================================== */

// READ: Mendapatkan semua data donasi
async function fetchDonasi() {
    const tbody = document.getElementById('tbody-donasi');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Menghubungi server backend...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/donasi`);
        if (!response.ok) throw new Error('Gagal mengambil data donasi');
        
        const donasiList = await response.json();
        renderDonasiTable(donasiList);
    } catch (error) {
        console.error('Error fetchDonasi:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red">
            <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat data dari server backend (${error.message}). <br>
            Pastikan server Spring Boot menyala di port 8080.
        </td></tr>`;
    }
}

// RENDER: Merender array donasi ke tabel UI
function renderDonasiTable(donasiList) {
    const tbody = document.getElementById('tbody-donasi');
    tbody.innerHTML = '';
    
    if (donasiList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada komitmen donasi barang terdaftar.</td></tr>';
        return;
    }
    
    donasiList.forEach(donasi => {
        const tr = document.createElement('tr');
        
        // Pilih badge berdasarkan status pengiriman
        let badgeClass = 'status-warning';
        if (donasi.statusPengiriman === 'Pending') badgeClass = 'status-danger';
        else if (donasi.statusPengiriman === 'Dikirim') badgeClass = 'status-warning';
        else if (donasi.statusPengiriman === 'Diterima') badgeClass = 'status-success';
        else if (donasi.statusPengiriman === 'Diproses') badgeClass = 'status-warning';

        tr.innerHTML = `
            <td><span class="text-cyan font-bold">#DB-${donasi.id}</span></td>
            <td>${escapeHTML(donasi.namaDonatur)}</td>
            <td>${escapeHTML(donasi.namaBarang)}</td>
            <td><span class="value-highlight">${donasi.jumlah} Unit</span></td>
            <td><span class="badge-status ${badgeClass}">${donasi.statusPengiriman.toUpperCase()}</span></td>
            <td class="text-right">
                <button class="btn-action-icon" onclick="editDonasi(${donasi.id})" title="Perbarui Status / Edit"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deleteDonasi(${donasi.id})" title="Batalkan Donasi"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// CREATE / UPDATE: Submit form komitmen donasi
async function handleDonasiSubmit(e) {
    e.preventDefault();
    
    const namaDonatur = document.getElementById('donasi-donatur').value;
    const namaBarang = document.getElementById('donasi-barang').value;
    const jumlah = parseInt(document.getElementById('donasi-jumlah').value);
    const statusPengiriman = document.getElementById('donasi-status').value;
    
    const donasiData = { namaDonatur, namaBarang, jumlah, statusPengiriman };
    
    try {
        let response;
        if (currentEditingDonasiId) {
            // Mode UPDATE (PUT)
            response = await fetch(`${API_BASE_URL}/donasi/${currentEditingDonasiId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donasiData)
            });
        } else {
            // Mode CREATE (POST)
            response = await fetch(`${API_BASE_URL}/donasi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donasiData)
            });
        }
        
        if (!response.ok) throw new Error('Gagal mengirim komitmen donasi ke database');
        
        // Reset form & reload data
        document.getElementById('form-donasi').reset();
        cancelDonasiEdit();
        fetchDonasi();
        alert(currentEditingDonasiId ? 'Data donasi berhasil diperbarui!' : 'Komitmen donasi berhasil didaftarkan secara transparan!');
    } catch (error) {
        console.error('Error submit donasi:', error);
        alert(`Gagal menyimpan data donasi: ${error.message}`);
    }
}

// EDIT TRIGGER: Memasukkan data ke form untuk diedit
async function editDonasi(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/donasi/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil detail donasi');
        
        const donasi = await response.json();
        
        // Isi nilai input form
        document.getElementById('donasi-id').value = donasi.id;
        document.getElementById('donasi-donatur').value = donasi.namaDonatur;
        document.getElementById('donasi-barang').value = donasi.namaBarang;
        document.getElementById('donasi-jumlah').value = donasi.jumlah;
        document.getElementById('donasi-status').value = donasi.statusPengiriman;
        
        // Set mode edit
        currentEditingDonasiId = donasi.id;
        document.getElementById('btn-submit-donasi').innerHTML = '<i class="fa-solid fa-pen-fancy"></i> PERBARUI DONASI';
        document.getElementById('btn-cancel-edit-donasi').classList.remove('d-none');
        
        // Scroll ke form
        document.getElementById('form-donasi').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editDonasi:', error);
        alert(`Gagal memuat detail donasi: ${error.message}`);
    }
}

// CANCEL EDIT: Keluar dari mode edit donasi
function cancelDonasiEdit() {
    currentEditingDonasiId = null;
    document.getElementById('donasi-id').value = '';
    document.getElementById('btn-submit-donasi').innerHTML = '<i class="fa-solid fa-paper-plane"></i> KIRIM DONASI SEKARANG';
    document.getElementById('btn-cancel-edit-donasi').classList.add('d-none');
    document.getElementById('form-donasi').reset();
}

// DELETE: Membatalkan/menghapus donasi barang
async function deleteDonasi(id) {
    if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus komitmen donasi ini?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/donasi/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Gagal menghapus donasi dari server');
        
        fetchDonasi();
        alert('Klaim pembatalan donasi diproses, entri berhasil dihapus.');
    } catch (error) {
        console.error('Error deleteDonasi:', error);
        alert(`Gagal menghapus donasi: ${error.message}`);
    }
}


/* ==========================================================================
   3. OPERASI CRUD KORBAN BENCANA (FETCH API)
   ========================================================================== */

// READ: Mendapatkan semua data korban
async function fetchKorban() {
    const tbody = document.getElementById('tbody-korban');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin"></i> Menghubungi server backend...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/korban`);
        if (!response.ok) throw new Error('Gagal mengambil data korban');
        
        const korbanList = await response.json();
        renderKorbanTable(korbanList);
    } catch (error) {
        console.error('Error fetchKorban:', error);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-red">
            <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat data korban dari server (${error.message}). <br>
            Pastikan Spring Boot berjalan di port 8080.
        </td></tr>`;
    }
}

// RENDER: Merender array korban ke tabel UI
function renderKorbanTable(korbanList) {
    const tbody = document.getElementById('tbody-korban');
    tbody.innerHTML = '';
    
    if (korbanList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Belum ada profil korban bencana terdaftar.</td></tr>';
        return;
    }
    
    korbanList.forEach(korban => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><span class="text-cyan font-bold">#K-${korban.id}</span></td>
            <td>${escapeHTML(korban.nama)}</td>
            <td><code>${escapeHTML(korban.nik)}</code></td>
            <td><code>${escapeHTML(korban.nomorKK)}</code></td>
            <td><span class="badge-status status-warning">${escapeHTML(korban.kelompokRentan)}</span></td>
            <td><span class="text-orange font-bold">${escapeHTML(korban.statusRumah)}</span></td>
            <td><span class="text-muted">${escapeHTML(korban.alamatAsal)}</span></td>
            <td class="text-right">
                <button class="btn-action-icon" onclick="editKorban(${korban.id})" title="Edit Profil"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btn-action-icon btn-delete" onclick="deleteKorban(${korban.id})" title="Hapus Profil"><i class="fa-regular fa-trash-can"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// CREATE / UPDATE: Submit form profil korban
async function handleKorbanSubmit(e) {
    e.preventDefault();
    
    const nama = document.getElementById('korban-nama').value;
    const NIK = document.getElementById('korban-nik').value;
    const nomorKK = document.getElementById('korban-kk').value;
    const kelompokRentan = document.getElementById('korban-kelompok').value;
    const statusRumah = document.getElementById('korban-rumah').value;
    const alamatAsal = document.getElementById('korban-alamat').value;
    
    const korbanData = { nama, NIK, nomorKK, kelompokRentan, statusRumah, alamatAsal };
    
    try {
        let response;
        if (currentEditingKorbanId) {
            // Mode UPDATE (PUT)
            response = await fetch(`${API_BASE_URL}/korban/${currentEditingKorbanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(korbanData)
            });
        } else {
            // Mode CREATE (POST)
            response = await fetch(`${API_BASE_URL}/korban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(korbanData)
            });
        }
        
        if (!response.ok) throw new Error('Gagal menyimpan profil korban');
        
        // Reset form & reload data
        document.getElementById('form-korban').reset();
        cancelKorbanEdit();
        fetchKorban();
        alert(currentEditingKorbanId ? 'Profil korban berhasil diperbarui!' : 'Profil korban baru berhasil didaftarkan ke basis data pusat!');
    } catch (error) {
        console.error('Error submit korban:', error);
        alert(`Gagal menyimpan data korban: ${error.message}`);
    }
}

// EDIT TRIGGER: Memasukkan data korban ke form untuk diedit
async function editKorban(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/korban/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil data korban');
        
        const korban = await response.json();
        
        // Isi nilai input form
        document.getElementById('korban-id').value = korban.id;
        document.getElementById('korban-nama').value = korban.nama;
        document.getElementById('korban-nik').value = korban.nik; // H2 memetakan NIK ke nik (case-insensitive JSON key)
        document.getElementById('korban-kk').value = korban.nomorKK;
        document.getElementById('korban-kelompok').value = korban.kelompokRentan;
        document.getElementById('korban-rumah').value = korban.statusRumah;
        document.getElementById('korban-alamat').value = korban.alamatAsal;
        
        // Set mode edit
        currentEditingKorbanId = korban.id;
        document.getElementById('form-korban-title').innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Profil Korban';
        document.getElementById('btn-submit-korban').innerHTML = '<i class="fa-solid fa-user-check"></i> SIMPAN PERUBAHAN PROFIL';
        document.getElementById('btn-cancel-edit-korban').classList.remove('d-none');
        
        // Scroll ke form
        document.getElementById('form-korban').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error editKorban:', error);
        alert(`Gagal memuat profil korban: ${error.message}`);
    }
}

// CANCEL EDIT: Keluar dari mode edit korban
function cancelKorbanEdit() {
    currentEditingKorbanId = null;
    document.getElementById('korban-id').value = '';
    document.getElementById('form-korban-title').innerHTML = '<i class="fa-solid fa-user-plus"></i> Registrasi Akun & Profil Korban';
    document.getElementById('btn-submit-korban').innerHTML = '<i class="fa-solid fa-user-check"></i> DAFTARKAN PROFIL KORBAN';
    document.getElementById('btn-cancel-edit-korban').classList.add('d-none');
    document.getElementById('form-korban').reset();
}

// DELETE: Menghapus data korban
async function deleteKorban(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus profil korban bencana ini secara permanen?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/korban/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Gagal menghapus profil dari database');
        
        fetchKorban();
        alert('Data profil korban berhasil dihapus dari database.');
    } catch (error) {
        console.error('Error deleteKorban:', error);
        alert(`Gagal menghapus data korban: ${error.message}`);
    }
}


/* ==========================================================================
   4. MODAL MASUK / DAFTAR AKUN
   ========================================================================== */
function initAuthModal() {
    const modal = document.getElementById('modal-login');
    const openBtn = document.getElementById('btn-login-trigger');
    const closeBtn = document.getElementById('btn-close-login-modal');
    
    openBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    
    // Klik di luar area modal untuk menutup
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Handle Auth Tabs (Masuk vs Daftar)
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const btnSubmit = document.getElementById('btn-login-submit');

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        btnSubmit.innerHTML = 'Masuk Sekarang <i class="fa-solid fa-arrow-right-to-bracket ml-2"></i>';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        btnSubmit.innerHTML = 'Daftar Akun Baru <i class="fa-solid fa-user-plus ml-2"></i>';
    });

    // Handle Role Selectors
    const roleKorban = document.getElementById('role-korban');
    const roleRelawan = document.getElementById('role-relawan');

    roleKorban.addEventListener('click', () => {
        roleKorban.classList.add('active');
        roleRelawan.classList.remove('active');
    });

    roleRelawan.addEventListener('click', () => {
        roleRelawan.classList.add('active');
        roleKorban.classList.remove('active');
    });

    // Password Toggle Visibility
    const togglePass = document.getElementById('toggle-password');
    const passInput = document.getElementById('auth-password');
    
    togglePass.addEventListener('click', () => {
        const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passInput.setAttribute('type', type);
        togglePass.classList.toggle('fa-eye');
        togglePass.classList.toggle('fa-eye-slash');
    });

    // Submit Auth Form (Simulasi)
    document.getElementById('form-auth-submit').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        alert(`Autentikasi berhasil untuk: ${email}. Akses portal darurat diizinkan.`);
        modal.classList.remove('active');
    });
}


/* ==========================================================================
   5. INTERAKSI WIDGET AI CHATBOT (EMBERBOT SUPPORT)
   ========================================================================== */
function initChatbot() {
    const trigger = document.getElementById('chatbot-trigger');
    const windowEl = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('btn-close-chat');
    const sendBtn = document.getElementById('btn-send-chat');
    const chatInput = document.getElementById('chatbot-input');
    const messagesBody = document.getElementById('chatbot-messages');

    // Buka / Tutup chat window
    trigger.addEventListener('click', () => {
        windowEl.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('active');
    });

    // Kirim pesan dengan tombol kirim
    sendBtn.addEventListener('click', () => {
        sendChatMessage();
    });

    // Kirim pesan dengan Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Kirim pesan
    function sendChatMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Tambah pesan user
        appendMessage('user', text);
        chatInput.value = '';

        // Tampilkan indikator mengetik
        const typingId = appendTypingIndicator();
        messagesBody.scrollTop = messagesBody.scrollHeight;

        // Simulasi respon bot Gemini Flash (1.2 detik delay)
        setTimeout(() => {
            removeTypingIndicator(typingId);
            const responseText = getBotResponse(text);
            appendMessage('bot', responseText);
            messagesBody.scrollTop = messagesBody.scrollHeight;
        }, 1200);
    }

    function appendMessage(sender, content) {
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        
        msgDiv.innerHTML = `
            <p>${content}</p>
            <span class="message-time">${time}</span>
        `;
        
        messagesBody.appendChild(msgDiv);
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator-msg';
        typingDiv.id = id;
        typingDiv.innerHTML = `
            <p><i class="fa-solid fa-circle-notch fa-spin"></i> EmberBot sedang berpikir...</p>
        `;
        messagesBody.appendChild(typingDiv);
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // Generator respon bot taktis berbasis kata kunci
    function getBotResponse(query) {
        const cleanQuery = query.toLowerCase();
        
        if (cleanQuery.includes('posko') || cleanQuery.includes('lokasi') || cleanQuery.includes('tempat') || cleanQuery.includes('peta')) {
            return `Posko aman terdekat dari lokasi kebakaran utama saat ini adalah:
            <br>1. <b>GOR Pemuda</b> (Sisa Kapasitas: 142 Slot - Status: Normal)
            <br>2. <b>Masjid Al-Ikhlas</b> (Sisa Kapasitas: 300+ Slot - Status: Leluasa)
            <br><br>Anda dapat melihat lokasinya secara visual di tab <b>'Peta Informasi & Posko'</b>.`;
        }
        
        if (cleanQuery.includes('logistik') || cleanQuery.includes('donasi') || cleanQuery.includes('barang') || cleanQuery.includes('bantuan')) {
            return `Kebutuhan logistik darurat yang mendesak saat ini:
            <br>• Popok Bayi (70% terpenuhi)
            <br>• Selimut Hangat (40% terpenuhi)
            <br>• Tenda Darurat Keluarga (20% terpenuhi)
            <br><br>Anda dapat mendaftarkan bantuan barang logistik Anda langsung melalui form di tab <b>'Portal Donasi Terbuka'</b> untuk pelacakan transparan.`;
        }
        
        if (cleanQuery.includes('dokumen') || cleanQuery.includes('ktp') || cleanQuery.includes('kk') || cleanQuery.includes('hilang') || cleanQuery.includes('surat')) {
            return `Untuk mengurus dokumen yang hilang/rusak akibat bencana:
            <br>1. Daftarkan profil korban di menu <b>'Pusat Pemulihan Dokumen'</b>.
            <br>2. Gunakan menu Wizard Pemulihan untuk E-KTP atau KK.
            <br>3. Unit Dukcapil Keliling akan berada di <b>Posko 3 Sukamaju</b> besok pukul 08:00 - 12:00 WIB untuk membantu cetak fisik dokumen Anda.`;
        }

        if (cleanQuery.includes('halo') || cleanQuery.includes('hai') || cleanQuery.includes('pagi') || cleanQuery.includes('siang') || cleanQuery.includes('sore') || cleanQuery.includes('malam')) {
            return `Halo! Ada yang bisa saya bantu terkait logistik, posko evakuasi, atau pemulihan dokumen hari ini?`;
        }

        return `Pertanyaan Anda diterima. Saya menyarankan Anda untuk:
        <br>• Mengisi <b>Formulir Registrasi Korban</b> jika Anda membutuhkan posko dan bantuan harian.
        <br>• Membuka <b>Hotline Pengaduan</b> untuk mengontak Damkar atau BASARNAS jika mendesak.
        <br>• Menghubungi pusat posko terdekat untuk info logistik.`;
    }
}


/* ==========================================================================
   6. TOMBOL DARURAT SOS & PELAPORAN INCIDENT
   ========================================================================== */
function initSOSButton() {
    const sosBtn = document.getElementById('btn-sos-trigger');
    if (sosBtn) {
        sosBtn.addEventListener('click', () => {
            alert('🚨 PROTOKOL SOS DIKIRIM! Koordinasi GPS Anda telah dikirim ke server BASARNAS & Ambulans terdekat. Tetap tenang dan cari tempat perlindungan.');
        });
    }
}

// Laporan Kejadian Baru
function handleLaporanKejadianSubmit(e) {
    e.preventDefault();
    const lokasi = document.getElementById('incident-loc').value;
    const kondisi = document.getElementById('incident-condition').value;
    alert(`Laporan Kejadian Berhasil Terkirim!\nLokasi: ${lokasi}\nKondisi: ${kondisi}\nPetugas akan segera memverifikasi laporan Anda.`);
    document.getElementById('form-laporan-kejadian').reset();
}


/* ==========================================================================
   7. PENCARIAN GLOBAL SEDERHANA & UTILITY
   ========================================================================== */
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    
    // Cari di tabel donasi
    const donasiRows = document.querySelectorAll('#tbody-donasi tr');
    donasiRows.forEach(row => {
        if (row.cells.length < 5) return;
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    // Cari di tabel korban
    const korbanRows = document.querySelectorAll('#tbody-korban tr');
    korbanRows.forEach(row => {
        if (row.cells.length < 7) return;
        const text = row.innerText.toLowerCase();
        if (text.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Helper untuk menghindari serangan XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
