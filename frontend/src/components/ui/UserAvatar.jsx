const colors = [
  'bg-teal-500', 'bg-blue-500', 'bg-purple-500',
  'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
]

export default function Avatar({ name, size = 'md', showName = false }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0]
  const sizeClass = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' }[size]

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
        {initials}
      </div>
      {showName && <span className="text-sm text-slate-700 font-medium">{name}</span>}
    </div>
  )
}