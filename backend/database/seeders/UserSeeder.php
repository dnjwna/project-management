<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Alex Rivera',
            'email'    => 'admin@projecthub.com',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
        ]);

        $members = [
            ['name' => 'Sarah Chen',      'email' => 'sarah@projecthub.com'],
            ['name' => 'Marcus Johnson',  'email' => 'marcus@projecthub.com'],
            ['name' => 'Priya Patel',     'email' => 'priya@projecthub.com'],
            ['name' => 'David Kim',       'email' => 'david@projecthub.com'],
            ['name' => 'Luna Vasquez',    'email' => 'luna@projecthub.com'],
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