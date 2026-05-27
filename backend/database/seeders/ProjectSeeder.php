<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            [
                'name'        => 'Website Company Profile',
                'description' => 'Redesign dan pengembangan website company profile perusahaan.',
                'status'      => 'on_track',
                'start_date'  => '2026-01-01',
                'end_date'    => '2026-06-30',
                'created_by'  => 1, // admin
                'members'     => [
                    ['user_id' => 1, 'role' => 'manager'],
                    ['user_id' => 2, 'role' => 'member'],
                    ['user_id' => 3, 'role' => 'member'],
                ],
            ],
            [
                'name'        => 'Mobile App E-Commerce',
                'description' => 'Pengembangan aplikasi mobile untuk platform e-commerce.',
                'status'      => 'delayed',
                'start_date'  => '2026-02-01',
                'end_date'    => '2026-08-31',
                'created_by'  => 1,
                'members'     => [
                    ['user_id' => 1, 'role' => 'manager'],
                    ['user_id' => 4, 'role' => 'member'],
                    ['user_id' => 5, 'role' => 'member'],
                ],
            ],
            [
                'name'        => 'Sistem Inventori Gudang',
                'description' => 'Sistem manajemen inventori untuk gudang pusat.',
                'status'      => 'completed',
                'start_date'  => '2025-10-01',
                'end_date'    => '2026-02-28',
                'created_by'  => 1,
                'members'     => [
                    ['user_id' => 2, 'role' => 'manager'],
                    ['user_id' => 3, 'role' => 'member'],
                    ['user_id' => 6, 'role' => 'member'],
                ],
            ],
        ];

        foreach ($projects as $data) {
            $members = $data['members'];
            unset($data['members']);

            $project = Project::create($data);

            foreach ($members as $member) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'user_id'    => $member['user_id'],
                    'role'       => $member['role'],
                ]);
            }
        }
    }
}