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

