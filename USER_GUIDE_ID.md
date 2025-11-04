# ZMath LMS - Panduan Pengguna

## Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Peran Pengguna](#peran-pengguna)
3. [Memulai](#memulai)
4. [Alur Siswa](#alur-siswa)
5. [Alur Guru](#alur-guru)
6. [Alur Admin](#alur-admin)
7. [Fitur Berdasarkan Peran](#fitur-berdasarkan-peran)

---

## Gambaran Umum

ZMath LMS adalah Sistem Manajemen Pembelajaran yang dirancang untuk pendidikan matematika. Sistem ini mendukung tiga tipe pengguna: **Siswa**, **Guru**, dan **Admin**, masing-masing dengan kemampuan dan alur kerja yang spesifik.

---

## Peran Pengguna

### 1. **Siswa**
- Dapat mendaftar ke kursus
- Mengakses materi kursus (video, PDF, dokumen)
- Mengerjakan kuis dan melihat riwayat percobaan
- Melacak kemajuan belajar melalui pelajaran

### 2. **Guru**
- Membuat dan mengelola kursus
- Membuat pelajaran dalam kursus
- Mengunggah materi pembelajaran (video YouTube, PDF, dokumen, gambar)
- Membuat kuis dengan soal pilihan ganda
- Mengelola pendaftaran siswa
- **Memerlukan persetujuan admin** untuk mengakses sistem

### 3. **Admin**
- Semua kemampuan guru
- Menyetujui atau menolak pendaftaran guru
- Melihat dan mengelola semua pengguna dalam sistem
- Mengakses pengaturan pengguna dan manajemen sistem

---

## Memulai

### Pendaftaran

1. **Buka Halaman Pendaftaran**
   - Kunjungi `/register`
   - Isi: Nama Lengkap, Email, Kata Sandi, Konfirmasi Kata Sandi
   - Pilih peran Anda: Siswa atau Guru

2. **Untuk Siswa:**
   - ✅ Akun dibuat dan disetujui secara otomatis
   - ✅ Login otomatis
   - ✅ Diarahkan ke dashboard siswa (`/dashboard/student`)

3. **Untuk Guru:**
   - ⏳ Akun dibuat tetapi **menunggu persetujuan**
   - ℹ️ Pesan ditampilkan: "Akun guru Anda sedang menunggu persetujuan"
   - ❌ Tidak dapat login sampai disetujui oleh admin
   - 📧 Tunggu admin menyetujui pendaftaran Anda

### Login

1. **Buka Halaman Login**
   - Kunjungi `/login`
   - Masukkan email dan kata sandi Anda

2. **Setelah Login:**
   - Siswa → Diarahkan ke `/dashboard/student`
   - Guru (disetujui) → Diarahkan ke `/dashboard/teacher`
   - Admin → Diarahkan ke `/dashboard/admin`

3. **Pembatasan Login:**
   - ❌ Guru yang belum disetujui akan melihat: "Akun guru Anda sedang menunggu persetujuan"
   - ❌ Kredensial yang tidak valid akan menampilkan pesan kesalahan

---

## Alur Siswa

### Gambaran Dashboard
**Lokasi:** `/dashboard/student`

Dashboard siswa menampilkan semua kursus yang Anda ikuti dalam bentuk kartu dengan judul dan deskripsi kursus.

### Perjalanan Belajar

```
Dashboard Siswa → Detail Kursus → Detail Pelajaran → Tampilan Materi
                                ↘ Detail Kuis → Mengerjakan Kuis
```

#### 1. **Melihat Kursus yang Diikuti**
- Buka `/dashboard/student`
- Lihat semua kursus yang Anda ikuti
- Klik kartu kursus untuk melihat detail

#### 2. **Halaman Detail Kursus**
**Lokasi:** `/dashboard/student/courses/[courseId]`

Menampilkan dua bagian:
- **Pelajaran:** Daftar semua pelajaran dalam kursus
- **Kuis:** Daftar semua kuis untuk kursus tersebut

#### 3. **Halaman Detail Pelajaran**
**Lokasi:** `/dashboard/student/courses/[courseId]/lessons/[lessonId]`

- Lihat judul dan deskripsi pelajaran
- Lihat semua materi yang tersedia untuk pelajaran
- Klik materi apa pun untuk melihatnya

#### 4. **Tampilan Materi**
**Lokasi:** `/dashboard/student/courses/[courseId]/lessons/[lessonId]/materials/[materialId]`

Mendukung berbagai jenis materi:
- **📹 Video YouTube:** Pemutar video tertanam
- **📄 File PDF:** Penampil PDF di browser
- **📁 Dokumen:** Tombol unduh untuk file Word, Excel, PPT
- **🖼️ Gambar:** Tampilan gambar langsung

#### 5. **Alur Kuis**

##### Melihat Detail Kuis
**Lokasi:** `/dashboard/student/quizzes/detail/[quizId]`

- Lihat judul dan deskripsi kuis
- Lihat riwayat percobaan Anda (skor, tanggal selesai)
- Klik "Mulai Percobaan" (pertama kali) atau "Coba Lagi"

##### Mengerjakan Kuis
**Lokasi:** `/dashboard/student/quizzes/attempt/[quizId]`

- Jawab soal pilihan ganda
- Kirim jawaban Anda
- Lihat skor Anda
- Hasil disimpan dalam riwayat percobaan

---

## Alur Guru

### Prasyarat
- ✅ Akun guru harus disetujui oleh admin
- ❌ Guru yang belum disetujui tidak dapat login

### Gambaran Dashboard
**Lokasi:** `/dashboard/teacher`

Tautan cepat untuk mengelola:
- 🎓 Kursus
- 📖 Pelajaran
- 📝 Kuis
- 📚 Materi
- 👨‍🎓 Pendaftaran Siswa

### Alur Manajemen Konten

```
Buat Kursus → Buat Pelajaran → Unggah Materi
                            ↘ Buat Kuis
                            
Daftarkan Siswa → Siswa Mengakses Konten
```

#### 1. **Kelola Kursus**
**Lokasi:** `/dashboard/teacher/courses`

**Membuat Kursus:**
- Klik "Tambah Kursus Baru"
- Isi: Judul, Deskripsi, Mata Pelajaran (misalnya, Aljabar, Geometri)
- Klik "Kirim"

**Edit/Hapus Kursus:**
- Lihat semua kursus dalam tabel data
- Klik ikon Edit untuk mengubah detail kursus
- Klik ikon Hapus untuk menghapus kursus

#### 2. **Kelola Pelajaran**
**Lokasi:** `/dashboard/teacher/lessons`

**Membuat Pelajaran:**
- Klik "Tambah Pelajaran Baru"
- Isi: Judul, Deskripsi, Urutan
- Pilih kursus tempat pelajaran ini berada
- Klik "Kirim"

**Edit/Hapus Pelajaran:**
- Lihat semua pelajaran dengan kursus terkait
- Klik ikon Edit untuk mengubah detail pelajaran
- Klik ikon Hapus untuk menghapus pelajaran

#### 3. **Kelola Materi**
**Lokasi:** `/dashboard/teacher/materials`

**Mengunggah Materi:**
- Klik "Tambah Materi Baru"
- Isi: Judul, Deskripsi, Urutan
- Pilih pelajaran tempat materi ini berada
- Pilih jenis materi:
  - **YouTube:** Masukkan URL video
  - **PDF:** Unggah file PDF
  - **Dokumen:** Unggah file Word/Excel/PPT
  - **Gambar:** Unggah file gambar
- Klik "Kirim"

**Edit/Hapus Materi:**
- Lihat semua materi dengan lencana jenis
- Klik ikon Edit untuk mengubah detail materi
- Klik ikon Hapus untuk menghapus materi

#### 4. **Kelola Kuis**
**Lokasi:** `/dashboard/teacher/quizzes`

**Membuat Kuis:**
- Klik "Tambah Kuis Baru"
- Isi: Judul, Deskripsi, Durasi (menit), Nilai Lulus
- Pilih kursus tempat kuis ini berada
- Tambahkan soal:
  - Masukkan teks soal
  - Tambahkan 4 pilihan jawaban (A, B, C, D)
  - Pilih jawaban yang benar
  - Tambahkan beberapa soal
- Klik "Kirim"

**Edit/Hapus Kuis:**
- Lihat semua kuis dengan kursusnya
- Klik ikon Edit untuk mengubah kuis dan soal
- Klik ikon Hapus untuk menghapus kuis

#### 5. **Kelola Pendaftaran**
**Lokasi:** `/dashboard/teacher/enrollments`

**Mendaftarkan Siswa:**
- Klik "Daftarkan Siswa"
- Pilih siswa dari dropdown
- Pilih kursus untuk mendaftarkan mereka
- Klik "Daftarkan"

**Melihat Pendaftaran:**
- Lihat semua pendaftaran siswa-kursus
- Lihat nama siswa, kursus, dan tanggal pendaftaran
- Klik ikon Hapus untuk menghapus pendaftaran

---

## Alur Admin

### Gambaran Dashboard
**Lokasi:** `/dashboard/admin`

Dua bagian utama:

#### **1. Aksi Admin**
- 👥 Pengaturan Pengguna
- ✅ Persetujuan Pendaftaran Guru

#### **2. Manajemen Konten**
- Semua fitur guru (Kursus, Pelajaran, Kuis, Materi, Pendaftaran)

### Fitur Khusus Admin

#### 1. **Pengaturan Pengguna**
**Lokasi:** `/dashboard/admin/users`

**Melihat Semua Pengguna:**
- Lihat daftar lengkap pengguna dalam tabel data
- Kolom: Username, Nama Lengkap, Email, Peran, Status Persetujuan, Tanggal Pendaftaran
- Filter berdasarkan peran: Semua, Siswa, Guru, Admin

**Informasi Pengguna:**
- Lencana peran dengan warna:
  - 🟡 Admin (Oranye)
  - 🔵 Guru (Biru)
  - 🟢 Siswa (Hijau)
- Status persetujuan untuk guru:
  - ✅ Disetujui
  - ⏳ Menunggu

#### 2. **Persetujuan Pendaftaran Guru**
**Lokasi:** `/dashboard/admin/teacher-approvals`

**Alur Persetujuan Guru:**

1. **Melihat Guru yang Menunggu:**
   - Lihat daftar guru yang menunggu persetujuan
   - Menampilkan: Username, Nama Lengkap, Email, Tanggal Pendaftaran
   - Penghitung menunjukkan jumlah persetujuan yang menunggu

2. **Menyetujui Guru:**
   - Klik ikon tanda centang ✅
   - Status `is_approved` guru diatur ke `true`
   - Guru sekarang dapat login dan mengakses sistem
   - Pesan sukses ditampilkan
   - Guru dihapus dari daftar menunggu

3. **Menolak Guru:**
   - Klik ikon silang ❌
   - Akun guru dihapus dari sistem
   - Pesan sukses ditampilkan
   - Guru dihapus dari daftar menunggu

**Status Kosong:**
- Jika tidak ada guru yang menunggu: "Tidak ada pendaftaran guru yang menunggu"

---

## Fitur Berdasarkan Peran

| Fitur | Siswa | Guru | Admin |
|-------|-------|------|-------|
| Lihat kursus yang diikuti | ✅ | ❌ | ❌ |
| Akses materi | ✅ | ❌ | ❌ |
| Kerjakan kuis | ✅ | ❌ | ❌ |
| Lihat riwayat kuis | ✅ | ❌ | ❌ |
| Buat kursus | ❌ | ✅ | ✅ |
| Buat pelajaran | ❌ | ✅ | ✅ |
| Unggah materi | ❌ | ✅ | ✅ |
| Buat kuis | ❌ | ✅ | ✅ |
| Kelola pendaftaran | ❌ | ✅ | ✅ |
| Lihat semua pengguna | ❌ | ❌ | ✅ |
| Setujui guru | ❌ | ❌ | ✅ |
| Tolak guru | ❌ | ❌ | ✅ |

---

## Hierarki Konten

Memahami hubungan antar jenis konten:

```
Kursus
├── Pelajaran
│   └── Materi (YouTube, PDF, Dokumen, Gambar)
└── Kuis
    └── Soal (Pilihan Ganda)

Pendaftaran (Siswa → Kursus)
```

### Hubungan:
- **Kursus** berisi beberapa **Pelajaran** dan **Kuis**
- **Pelajaran** berisi beberapa **Materi**
- **Kuis** berisi beberapa **Soal**
- **Siswa** mendaftar ke **Kursus** (bukan pelajaran individual)

---

## Praktik Terbaik

### Untuk Guru:
1. **Buat konten secara berurutan:** Kursus → Pelajaran → Materi/Kuis
2. **Gunakan judul yang bermakna** untuk navigasi siswa yang mudah
3. **Atur urutan pelajaran** untuk menyusun jalur pembelajaran
4. **Uji kuis** sebelum siswa mengaksesnya
5. **Daftarkan siswa** setelah konten siap

### Untuk Siswa:
1. **Ikuti urutan pelajaran** untuk pemahaman yang lebih baik
2. **Selesaikan materi** sebelum mencoba kuis
3. **Tinjau riwayat kuis** untuk melacak kemajuan
4. **Coba lagi kuis** untuk meningkatkan skor

### Untuk Admin:
1. **Tinjau profil guru** sebelum persetujuan
2. **Pantau aktivitas pengguna** melalui pengaturan pengguna
3. **Periksa secara berkala** persetujuan guru yang menunggu
4. **Gunakan fitur guru** untuk memahami sistem

---

## Ringkasan Navigasi

### Rute Publik
- `/` - Halaman beranda
- `/login` - Halaman login
- `/register` - Halaman pendaftaran

### Rute Siswa
- `/dashboard/student` - Dashboard siswa
- `/dashboard/student/courses/[id]` - Detail kursus
- `/dashboard/student/courses/[id]/lessons/[lessonId]` - Detail pelajaran
- `/dashboard/student/courses/[id]/lessons/[lessonId]/materials/[materialId]` - Tampilan materi
- `/dashboard/student/quizzes/detail/[id]` - Detail kuis
- `/dashboard/student/quizzes/attempt/[id]` - Mengerjakan kuis

### Rute Guru
- `/dashboard/teacher` - Dashboard guru
- `/dashboard/teacher/courses` - Kelola kursus
- `/dashboard/teacher/lessons` - Kelola pelajaran
- `/dashboard/teacher/materials` - Kelola materi
- `/dashboard/teacher/quizzes` - Kelola kuis
- `/dashboard/teacher/enrollments` - Kelola pendaftaran

### Rute Admin
- `/dashboard/admin` - Dashboard admin
- `/dashboard/admin/users` - Pengaturan pengguna
- `/dashboard/admin/teacher-approvals` - Persetujuan guru
- Semua rute guru (admin memiliki akses penuh)

---

## Pemecahan Masalah

### Tidak Dapat Login sebagai Guru
- **Masalah:** "Akun guru Anda sedang menunggu persetujuan"
- **Solusi:** Tunggu admin menyetujui pendaftaran Anda

### Tidak Dapat Melihat Kursus Apa Pun (Siswa)
- **Masalah:** Tidak ada kursus yang ditampilkan di dashboard
- **Solusi:** Hubungi guru Anda untuk mendaftarkan Anda ke kursus

### Tidak Dapat Membuat Konten (Guru)
- **Masalah:** Fitur tidak dapat diakses
- **Solusi:** Pastikan akun Anda disetujui oleh admin

### Materi atau Kuis Hilang
- **Masalah:** Konten tidak muncul di pelajaran/kursus
- **Solusi:** Verifikasi hubungan (Kursus → Pelajaran → Materi)

---

## Fitur Keamanan

- ✅ **Kontrol akses berbasis peran** - Pengguna hanya melihat konten yang diotorisasi
- ✅ **Perlindungan middleware** - Rute dilindungi di tingkat server
- ✅ **Sistem persetujuan guru** - Verifikasi manual sebelum akses
- ✅ **Autentikasi aman** - Didukung oleh Supabase Auth
- ✅ **Aksi sisi server** - Operasi admin menggunakan hak istimewa yang ditingkatkan

---

## Dukungan

Untuk bantuan tambahan atau pertanyaan tentang penggunaan ZMath LMS, silakan hubungi administrator sistem Anda.

---

**Terakhir Diperbarui:** 4 November 2025
