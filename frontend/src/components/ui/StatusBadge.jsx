const variants = {
  // Status project
  on_track:    'bg-teal-100 text-teal-700 border border-teal-200',
  delayed:     'bg-red-100 text-red-600 border border-red-200',
  completed:   'bg-blue-100 text-blue-700 border border-blue-200',
  // Status task
  todo:        'bg-slate-100 text-slate-600 border border-slate-200',
  in_progress: 'bg-orange-100 text-orange-600 border border-orange-200',
  done:        'bg-teal-100 text-teal-700 border border-teal-200',
  blocked:     'bg-red-100 text-red-600 border border-red-200',
  // Priority
  high:        'bg-red-100 text-red-600 border border-red-200',
  medium:      'bg-yellow-100 text-yellow-600 border border-yellow-200',
  low:         'bg-slate-100 text-slate-500 border border-slate-200',
  // Role
  admin:       'bg-purple-100 text-purple-700 border border-purple-200',
  member:      'bg-blue-100 text-blue-600 border border-blue-200',
  manager:     'bg-teal-100 text-teal-700 border border-teal-200',
}

export default function Badge({ value }) {
  const cls = variants[value] || 'bg-slate-100 text-slate-500'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {value?.replace('_', ' ')}
    </span>
  )
}