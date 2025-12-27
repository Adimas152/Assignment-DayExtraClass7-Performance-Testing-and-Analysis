# Load Testing - Resonance (JMeter)
Assignment Day Extra Class 6 - Load Testing (QA Bootcamp)

## Overview
Project ini berisi hasil load testing pada website:
- https://resonance.dibimbing.id/

Tujuan test:
- Menjalankan load testing untuk beberapa skenario beban (5, 25, 50 users)
- Menghasilkan Summary Report
- Menganalisis hasil (error, response time, P95, max, dll)
- Memberikan rekomendasi perbaikan performa aplikasi

## Tools
- Apache JMeter

## Endpoint yang diuji
- POST Create User
- POST Login
- POST Create Ticket
- GET My Ticket
- GET Ticket Active

## Skenario Pengujian
Saya menjalankan 3 skenario beban:
1. Thread Group 5 Users
2. Thread Group 25 Users
3. Thread Group 50 Users

Catatan:
- Untuk setiap skenario, saya menjalankan test dan menyimpan output ke file `.jtl`
- Dari `.jtl` tersebut saya generate HTML Report agar summary mudah dibaca

## 📌 Hasil Pengujian, Analisis, dan Rekomendasi

File detail analisis ada di: **[Analysis Report.pdf](Analysis%20Report.pdf)**

### Ringkasan Hasil
Saya menjalankan load testing pada beberapa endpoint utama:
- Create User, Login, Create Ticket, Get My Ticket, Get Ticket Active.  
  

#### ✅ Skenario 5 Users
- Website masih **stabil** karena **tidak ada error** dan request berhasil diproses.
- Namun dari sisi performa, endpoint **POST Create User** dan **POST Create Ticket** terlihat paling berat (waktu respon paling tinggi), jadi endpoint “create” lebih berat dibanding “get”.
> Referensi: Analysis Report.pdf

#### ⚠️ Skenario 25 Users
- Mulai muncul masalah besar: banyak request gagal dan error didominasi **HTTP 500 Internal Server Error**.
- Endpoint yang sering gagal adalah yang berhubungan dengan **create dan ticket**.
- Ini menandakan saat concurrent user naik, server/back-end atau database sudah tidak sanggup menampung request (bukan cuma melambat, tapi gagal).
> Referensi: Analysis Report.pdf

#### ❌ Skenario 50 Users
- Error tetap tinggi, beberapa endpoint gagal sangat besar.
- Response time makin “melebar” (P95 beberapa detik, max sampai belasan detik), artinya sebagian user dapat respon cepat tapi banyak juga yang lambat/gagal.
- Kesimpulan: aplikasi **belum stabil** untuk beban concurrent menengah–tinggi, terutama endpoint yang **tulis data (create)** dan proses ticket.
> Referensi: Analysis Report.pdf

---

### Temuan Utama
Dari hasil View Results Tree dan error response, indikasi terbesar mengarah ke bottleneck **database connection limit/connection pool**, sehingga muncul error 500 saat user bersamaan meningkat.

---

### Rekomendasi & Saran Perbaikan
**Untuk tim dev / website:**
1. Cek dan perbaiki **database connection** (connection pool / max connection), karena banyak error 500 saat concurrent naik.
2. Optimasi endpoint paling berat: **POST Create User** dan **POST Create Ticket** (karena di 5 users pun sudah terlihat paling berat).
3. Optimasi performa:
    - optimasi query DB + tambah index yang sesuai
    - pastikan proses berat (misal notif/email/validasi kompleks) tidak blocking request utama
    - jika memungkinkan gunakan async/job queue

**Untuk perbaikan test plan JMeter (biar lebih valid):**
1. Sesuaikan **assertion status code** dengan response yang valid (tidak selalu harus 200).
2. Buat data create **unik/dinamis** supaya lebih realistis.
3. Pakai ramp-up yang lebih halus supaya terlihat titik sistem mulai turun secara bertahap.
