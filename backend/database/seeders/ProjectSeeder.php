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
                'name'        => 'E-Commerce Platform Redesign',
                'description' => 'Complete overhaul of the customer-facing shopping experience, including mobile-first UI, improved checkout flow, and performance optimization.',
                'status'      => 'on_track',
                'start_date'  => '2026-01-15',
                'end_date'    => '2026-07-30',
                'created_by'  => 1,
                'members'     => [
                    ['user_id' => 1, 'role' => 'manager'],
                    ['user_id' => 2, 'role' => 'member'],
                    ['user_id' => 3, 'role' => 'member'],
                    ['user_id' => 4, 'role' => 'member'],
                ],
            ],
            [
                'name'        => 'Mobile Banking App',
                'description' => 'Develop a secure and intuitive mobile banking application with real-time transaction tracking, biometric authentication, and AI-powered spending insights.',
                'status'      => 'delayed',
                'start_date'  => '2026-02-01',
                'end_date'    => '2026-08-31',
                'created_by'  => 1,
                'members'     => [
                    ['user_id' => 1, 'role' => 'manager'],
                    ['user_id' => 3, 'role' => 'member'],
                    ['user_id' => 5, 'role' => 'member'],
                    ['user_id' => 6, 'role' => 'member'],
                ],
            ],
            [
                'name'        => 'Internal HR Management System',
                'description' => 'Build a centralized HR platform for employee onboarding, leave management, performance reviews, and payroll integration.',
                'status'      => 'completed',
                'start_date'  => '2025-09-01',
                'end_date'    => '2026-03-31',
                'created_by'  => 1,
                'members'     => [
                    ['user_id' => 2, 'role' => 'manager'],
                    ['user_id' => 4, 'role' => 'member'],
                    ['user_id' => 6, 'role' => 'member'],
                ],
            ],
            [
                'name'        => 'AI-Powered Analytics Dashboard',
                'description' => 'Create an intelligent business analytics dashboard with predictive insights, custom report generation, and real-time KPI monitoring.',
                'status'      => 'on_track',
                'start_date'  => '2026-03-01',
                'end_date'    => '2026-09-30',
                'created_by'  => 1,
                'members'     => [
                    ['user_id' => 1, 'role' => 'manager'],
                    ['user_id' => 2, 'role' => 'member'],
                    ['user_id' => 5, 'role' => 'member'],
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