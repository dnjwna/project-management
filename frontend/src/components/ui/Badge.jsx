const variants = {
  on_track:   'bg-green-500/10 text-green-400 border border-green-500/20',
  delayed:    'bg-red-500/10 text-red-400 border border-red-500/20',
  completed:  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  todo:       'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  in_progress:'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  done:       'bg-green-500/10 text-green-400 border border-green-500/20',
  blocked:    'bg-red-500/10 text-red-400 border border-red-500/20',
  high:       'bg-red-500/10 text-red-400 border border-red-500/20',
  medium:     'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  low:        'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  admin:      'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  member:     'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

export default function Badge({ value }) {
  const cls = variants[value] || 'bg-slate-500/10 text-slate-400'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {value?.replace('_', ' ')}
    </span>
  )
}