<?php

namespace Database\Seeders;

use App\Models\TaskComment;
use Illuminate\Database\Seeder;

class TaskCommentSeeder extends Seeder
{
    public function run(): void
    {
        $comments = [
            // Project 1 tasks
            ['task_id' => 1, 'user_id' => 2, 'comment' => 'Completed interviews with 22 users. Key finding: 78% abandon checkout due to too many steps. Full report in Notion.'],
            ['task_id' => 1, 'user_id' => 1, 'comment' => 'Great insights! Let\'s prioritize the one-page checkout in the redesign.'],
            ['task_id' => 2, 'user_id' => 2, 'comment' => 'Design system is live in Figma. Components include buttons, forms, cards, modals, and navigation patterns.'],
            ['task_id' => 2, 'user_id' => 3, 'comment' => 'Starting implementation of the component library in React. ETA: end of this week.'],
            ['task_id' => 3, 'user_id' => 3, 'comment' => 'Homepage 80% done. Product listing with filters is next. Need final copy from the marketing team.'],
            ['task_id' => 4, 'user_id' => 4, 'comment' => 'Stripe integration is working in sandbox. Moving to production keys after security review.'],

            // Project 2 tasks
            ['task_id' => 7, 'user_id' => 3, 'comment' => 'Threat modeling session completed. Using AES-256 for data at rest, TLS 1.3 for transit. Pen test scheduled for next month.'],
            ['task_id' => 8, 'user_id' => 5, 'comment' => 'Face ID working on iOS. Android fingerprint integration needs additional testing on Samsung devices.'],
            ['task_id' => 9, 'user_id' => 6, 'comment' => 'Blocked on this — waiting for the core banking API documentation from the client. ETA unknown.'],
            ['task_id' => 9, 'user_id' => 1, 'comment' => 'Escalated to the client. They promised API docs by Friday. Let\'s plan a sprint review after we receive them.'],

            // Project 4 tasks
            ['task_id' => 15, 'user_id' => 2, 'comment' => 'Pipeline handling 2M events/day in staging. Latency under 200ms. Ready for production load test.'],
            ['task_id' => 16, 'user_id' => 5, 'comment' => 'Revenue and MAU charts are live. Working on the cohort analysis visualization next.'],
        ];

        foreach ($comments as $comment) {
            TaskComment::create($comment);
        }
    }
}