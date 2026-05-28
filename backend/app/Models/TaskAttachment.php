<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class TaskAttachment extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'name',
        'url',
        'disk',
        'path',
        'mime_type',
        'size',
        'attachment_type',
    ];

    protected $appends = ['download_url', 'formatted_size', 'file_icon'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Auto-generate download URL
    public function getDownloadUrlAttribute(): string
    {
        if ($this->attachment_type === 'file' && $this->path) {
            return asset('storage/' . $this->path);
        }
        return $this->url ?? '';
    }

    // Human readable size
    public function getFormattedSizeAttribute(): string
    {
        if (!$this->size) return '';
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        $size = $this->size;
        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }
        return round($size, 1) . ' ' . $units[$i];
    }

    // Icon berdasarkan mime type
    public function getFileIconAttribute(): string
    {
        $mime = $this->mime_type ?? '';
        if (str_contains($mime, 'image')) return 'image';
        if (str_contains($mime, 'pdf')) return 'pdf';
        if (str_contains($mime, 'word') || str_contains($mime, 'document')) return 'word';
        if (str_contains($mime, 'sheet') || str_contains($mime, 'excel')) return 'excel';
        if (str_contains($mime, 'zip') || str_contains($mime, 'rar')) return 'archive';
        if (str_contains($mime, 'video')) return 'video';
        return 'file';
    }
}