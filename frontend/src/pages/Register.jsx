import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { clearError } from '../features/auth/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '../utils/axios'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

// Import asset lokal
import ilustrasiBanner from '../assets/vector2.jpeg'
import ilustrasiDua from '../assets/vector3.jpeg'
import ilustrasiTiga from '../assets/vector4.jpeg'

// Data Slider Gaya 3 (Neo-Brutalism)
const sliderData = [
  {
    id: 1,
    image: ilustrasiBanner,
    title: 'Make your work easier and organized with',
    highlight: 'FlowStep'
  },
  {
    id: 2,
    image: ilustrasiDua,
    title: 'Collaborate seamlessly with your entire',
    highlight: 'Team'
  },
  {
    id: 3,
    image: ilustrasiTiga,
    title: 'Track your progress and hit your',
    highlight: 'Deadlines'
  }
]

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // State Logika Undangan
  const [status, setStatus] = useState('validating') // validating | valid | invalid
  const [invitation, setInvitation] = useState(null)
  const [form, setForm] = useState({ name: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // State Slider Visual
  const [currentSlide, setCurrentSlide] = useState(0)

  // Efek Validasi Token Undangan
  useEffect(() => {
    dispatch(clearError())
    if (!token) {
      setStatus('invalid')
      return
    }
    validateToken()
  }, [token, dispatch])

  const validateToken = async () => {
    setStatus('validating')
    try {
      const res = await api.get(`/invitations/validate/${token}`)
      setInvitation(res.data)
      setStatus('valid')
    } catch {
      setStatus('invalid')
    }
  }

  // Effect Autoplay Slider (3.5 detik)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1))
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/invitations/accept', {
        token,
        name: form.name,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  // 1. STATE RENDER: Validating / Memeriksa Undangan
  if (status === 'validating') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-center">
          <Loader2 size={40} className="text-black animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm">Validating your invitation...</p>
        </div>
      </div>
    )
  }

  // 2. STATE RENDER: Token Tidak Valid / Kedaluwarsa
  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Invalid Invitation</h1>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-black hover:bg-slate-800 text-white font-bold rounded-full h-12 px-6 transition-all"
          >
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  // 3. STATE RENDER: Registrasi Berhasil
  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Account Created!</h1>
          <p className="text-slate-500 text-sm animate-pulse">
            Redirecting you to login...
          </p>
        </div>
      </div>
    )
  }

  // 4. STATE RENDER: Token Valid (Menampilkan Form & Slider Visual)
  return (
    <div className="min-h-screen bg-white flex p-4 lg:p-6 font-sans">
      
      {/* Kolom Kiri: Form Register */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-12 lg:px-24 relative overflow-y-auto py-8">
        
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-app-dark mb-3">Create Account</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              You've been invited to join <span className="font-bold text-app-dark">FlowStep</span> as a{' '}
              <span className="text-emerald-600 font-extrabold capitalize">{invitation?.role}</span>.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium text-center flex items-center justify-center gap-2">
              <XCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field — Readonly */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 ml-4">Email Address (Read-only)</label>
              <Input
                type="email"
                value={invitation?.email || ''}
                disabled
                className="bg-slate-100 border-slate-200 text-slate-500 rounded-full h-14 px-6 cursor-not-allowed"
              />
            </div>

            {/* Name Field */}
            <div className="space-y-1">
              <Input
                type="text"
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                className="bg-transparent border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-full h-14 px-6 focus-visible:ring-1 focus-visible:ring-app-dark focus-visible:border-app-dark transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <Input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password (Min. 8 characters)"
                className="bg-transparent border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-full h-14 px-6 focus-visible:ring-1 focus-visible:ring-app-dark focus-visible:border-app-dark transition-all"
              />
            </div>

            {/* Password Confirmation Field */}
            <div className="space-y-1">
              <Input
                type="password"
                required
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                placeholder="Confirm Password"
                className="bg-transparent border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-full h-14 px-6 focus-visible:ring-1 focus-visible:ring-app-dark focus-visible:border-app-dark transition-all"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-slate-800 text-white font-bold rounded-full h-14 mt-4 transition-all text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Register'
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-slate-500 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#000101] hover:underline font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Kolom Kanan: Banner SLIDER (Gaya 3: Neo-Brutalism / Offset Shadow) */}
      <div className="hidden lg:flex w-1/2 bg-[#F1F8F5] rounded-[2.5rem] flex-col items-center justify-center p-12 relative overflow-hidden">
        
        {/* Container Utama Gambar Slider Gaya 3 */}
        <div className="relative w-full max-w-sm mb-12 z-10 aspect-square">
            <div className="relative w-full h-full bg-white rounded-[2rem] border-2 border-app-dark shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] overflow-hidden transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] duration-300">
              {sliderData.map((slide, index) => (
                <img 
                  key={slide.id}
                  src={slide.image} 
                  alt={`Banner Ilustrasi ${index + 1}`} 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    currentSlide === index ? 'opacity-100' : 'opacity-0'
                  }`} 
                />
              ))}
            </div>
        </div>

        {/* Teks & Indikator Navigasi Bawah */}
        <div className="text-center w-full max-w-sm z-10 h-32">
          
          {/* Carousel Dots Interaktif */}
          <div className="flex justify-center gap-2 mb-6">
            {sliderData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ease-out ${
                  currentSlide === index ? 'w-8 bg-black' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Pindah ke slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Teks Slider Dinamis */}
          <div className="relative w-full">
            {sliderData.map((slide, index) => (
              <div 
                key={slide.id} 
                className={`absolute inset-x-0 top-0 w-full transition-all duration-700 ease-out ${
                  currentSlide === index 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <h2 className="text-2xl font-bold text-app-dark leading-snug px-4">
                  {slide.title} <br className="hidden lg:block" />
                  <span className="font-extrabold">{slide.highlight}</span>
                </h2>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}