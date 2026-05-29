<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $tasks = [
            // ── Project 1: E-Commerce Platform Redesign ──────────────
            [
                'project_id'  => 1,
                'title'       => 'User research & competitive analysis',
                'description' => 'Conduct interviews with 20 users and analyze top 5 competitor platforms to identify pain points and opportunities.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-02-15',
                'assigned_to' => 2,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Design system & component library',
                'description' => 'Create a unified design system with reusable components, typography, color palette, and spacing guidelines.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-03-01',
                'assigned_to' => 2,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Homepage & product listing pages',
                'description' => 'Implement responsive homepage with hero section, featured products, and category navigation.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'due_date'    => '2026-05-30',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Shopping cart & checkout flow',
                'description' => 'Build multi-step checkout with cart management, address form, payment integration, and order confirmation.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'due_date'    => '2026-06-15',
                'assigned_to' => 4,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Performance optimization & SEO',
                'description' => 'Implement lazy loading, image optimization, Core Web Vitals improvements, and meta tags.',
                'status'      => 'todo',
                'priority'    => 'medium',
                'due_date'    => '2026-07-01',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 1,
                'title'       => 'Cross-browser & device testing',
                'description' => 'QA testing across Chrome, Firefox, Safari on desktop, tablet, and mobile devices.',
                'status'      => 'todo',
                'priority'    => 'medium',
                'due_date'    => '2026-07-20',
                'assigned_to' => 4,
            ],

            // ── Project 2: Mobile Banking App ─────────────────────────
            [
                'project_id'  => 2,
                'title'       => 'Security architecture & threat modeling',
                'description' => 'Define security requirements, encryption standards, and implement threat modeling for the banking app.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-02-28',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 2,
                'title'       => 'Biometric authentication module',
                'description' => 'Implement Face ID, Touch ID, and PIN fallback authentication with secure enclave storage.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'due_date'    => '2026-04-30',
                'assigned_to' => 5,
            ],
            [
                'project_id'  => 2,
                'title'       => 'Real-time transaction dashboard',
                'description' => 'Build transaction history with filters, search, categorization, and spending analytics charts.',
                'status'      => 'blocked',
                'priority'    => 'high',
                'due_date'    => '2026-05-15',
                'assigned_to' => 6,
            ],
            [
                'project_id'  => 2,
                'title'       => 'Push notification system',
                'description' => 'Implement real-time push notifications for transactions, security alerts, and promotional offers.',
                'status'      => 'blocked',
                'priority'    => 'medium',
                'due_date'    => '2026-06-01',
                'assigned_to' => 3,
            ],
            [
                'project_id'  => 2,
                'title'       => 'AI spending insights feature',
                'description' => 'Integrate ML model for categorizing expenses and generating personalized financial insights.',
                'status'      => 'todo',
                'priority'    => 'low',
                'due_date'    => '2026-08-01',
                'assigned_to' => 5,
            ],

            // ── Project 3: HR Management System (completed) ───────────
            [
                'project_id'  => 3,
                'title'       => 'Employee onboarding workflow',
                'description' => 'Automated onboarding checklist, document collection, and IT provisioning integration.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2025-11-30',
                'assigned_to' => 4,
            ],
            [
                'project_id'  => 3,
                'title'       => 'Leave management system',
                'description' => 'Self-service leave requests, approval workflows, calendar integration, and balance tracking.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2025-12-31',
                'assigned_to' => 6,
            ],
            [
                'project_id'  => 3,
                'title'       => 'Performance review module',
                'description' => '360-degree feedback system with goal setting, self-assessment, and manager evaluation forms.',
                'status'      => 'done',
                'priority'    => 'medium',
                'due_date'    => '2026-02-28',
                'assigned_to' => 4,
            ],
            [
                'project_id'  => 3,
                'title'       => 'Payroll integration & reporting',
                'description' => 'Connect with payroll provider API, automate salary calculations, and generate compliance reports.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-03-25',
                'assigned_to' => 6,
            ],

            // ── Project 4: AI Analytics Dashboard ────────────────────
            [
                'project_id'  => 4,
                'title'       => 'Data pipeline architecture',
                'description' => 'Design ETL pipeline to ingest data from multiple sources into a unified analytics warehouse.',
                'status'      => 'done',
                'priority'    => 'high',
                'due_date'    => '2026-03-31',
                'assigned_to' => 2,
            ],
            [
                'project_id'  => 4,
                'title'       => 'KPI dashboard & real-time charts',
                'description' => 'Build interactive dashboard with D3.js charts, drill-down capabilities, and live data refresh.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'due_date'    => '2026-06-15',
                'assigned_to' => 5,
            ],
            [
                'project_id'  => 4,
                'title'       => 'Predictive analytics engine',
                'description' => 'Implement ML models for sales forecasting, churn prediction, and anomaly detection.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'due_date'    => '2026-07-31',
                'assigned_to' => 2,
            ],
            [
                'project_id'  => 4,
                'title'       => 'Custom report builder',
                'description' => 'Drag-and-drop report builder with export to PDF/Excel and scheduled email delivery.',
                'status'      => 'todo',
                'priority'    => 'medium',
                'due_date'    => '2026-08-31',
                'assigned_to' => 5,
            ],
        ];;

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}