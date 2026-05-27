<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'     => 'Admin Utama',
            'email'    => 'admin@pm.com',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
        ]);

        // Members
        $members = [
            ['name' => 'Budi Santoso',   'email' => 'budi@pm.com'],
            ['name' => 'Sari Dewi',      'email' => 'sari@pm.com'],
            ['name' => 'Andi Pratama',   'email' => 'andi@pm.com'],
            ['name' => 'Rina Kusuma',    'email' => 'rina@pm.com'],
            ['name' => 'Dika Ramadhan',  'email' => 'dika@pm.com'],
        ];

        foreach ($members as $member) {
            User::create([
                'name'     => $member['name'],
                'email'    => $member['email'],
                'password' => Hash::make('password123'),
                'role'     => 'member',
            ]);
        }
    }
}