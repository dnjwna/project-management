import Navbar from './Navbar'

export default function MainLayout({ children }) {
  return (
    // Menggunakan background abu-abu terang agar navbar putih lebih menonjol
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}