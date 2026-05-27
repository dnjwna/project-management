<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $tasks = [
            // Project 1 — Website Company Profile
            [
                'project_id'  => 1,
                'title'       => 'Riset & analisis kompetitor',
                'description' => 'Analisis website kompetitor untuk referensi desain.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-01-15',
                'assigned_to' => 2,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Buat wireframe halaman utama',
                'description' => 'Desain wireframe untuk homepage, about, dan contact.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-01-31',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Implementasi frontend React',
                'description' => 'Coding frontend berdasarkan wireframe yang sudah disetujui.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'due_date'    => '2026-03-31',
                'assigned_to' => 2,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Integrasi CMS',
                'description' => 'Integrasi dengan headless CMS untuk manajemen konten.',
                'status'      => 'todo',
                'priority'    => 'medium',
                'due_date'    => '2026-04-30',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Testing & QA',
                'description' => 'Testing fungsionalitas dan responsivitas website.',
                'status'      => 'todo',
                'priority'    => 'medium',
                'due_date'    => '2026-05-31',
                'assigned_to' => 2,
            ],

            // Project 2 — Mobile App E-Commerce
            [
                'project_id'  => 2,
                'title'       => 'Setup project React Native',
                'description' => 'Inisialisasi project dan konfigurasi environment.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-02-15',
                'assigned_to' => 4,
            ],
            [
                'project_id'  => 2,
                'title'       => 'Modul autentikasi user',
                'description' => 'Login, register, dan forgot password.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'due_date'    => '2026-03-15',
                'assigned_to' => 5,
            ],
            [
                'project_id'  => 2,
                'title'       => 'Halaman katalog produk',
                'description' => 'List produk dengan filter dan search.',
                'status'      => 'blocked',
                'priority'    => 'high',
                'due_date'    => '2026-04-01',
                'assigned_to' => 4,
            ],
            [
                'project_id'  => 2,
                'title'       => 'Integrasi payment gateway',
                'description' => 'Integrasi Midtrans untuk proses pembayaran.',
                'status'      => 'todo',
                'priority'    => 'high',
                'due_date'    => '2026-05-01',
                'assigned_to' => 5,
            ],

            // Project 3 — Sistem Inventori (completed)
            [
                'project_id'  => 3,
                'title'       => 'Desain database inventori',
                'description' => 'ERD dan migrasi database untuk sistem inventori.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2025-10-20',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 3,
                'title'       => 'CRUD manajemen barang',
                'description' => 'Fitur tambah, ubah, hapus, dan lihat data barang.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2025-11-30',
                'assigned_to' => 6,
            ],
            [
                'project_id'  => 3,
                'title'       => 'Laporan stok & transaksi',
                'description' => 'Generate laporan stok harian dan bulanan.',
                'status'      => 'done',
                'priority'    => 'medium',
                'due_date'    => '2026-01-31',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 3,
                'title'       => 'Deployment ke server produksi',
                'description' => 'Deploy aplikasi ke VPS dan konfigurasi domain.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-02-28',
                'assigned_to' => 6,
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}