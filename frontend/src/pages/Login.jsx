import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginUser, clearError } from '../features/auth/authSlice'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Import asset gambar lokal
import ilustrasiBanner from '../assets/vector.jpeg'
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

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  
  // State Slider
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
    return () => dispatch(clearError())
  }, [isAuthenticated, navigate, dispatch])

  // Effect Autoplay Slider (3.5 detik)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1))
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex p-4 lg:p-6 font-sans">
      
      {/* Kolom Kiri: Form Login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-12 lg:px-24 relative">
        
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-extrabold text-app-dark mb-3">Welcome back!</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Simplify your workflow and boost your productivity with <span className="font-bold text-app-dark">FlowStep</span>.
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email Address"
                className="bg-transparent border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-full h-14 px-6 focus-visible:ring-1 focus-visible:ring-app-dark focus-visible:border-app-dark transition-all"
              />
            </div>
            <div className="space-y-1">
              <Input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="bg-transparent border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-full h-14 px-6 focus-visible:ring-1 focus-visible:ring-app-dark focus-visible:border-app-dark transition-all"
              />
              <div className="flex justify-end pt-2">
                <Link to="#" className="text-xs font-semibold text-app-dark hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-slate-800 text-white font-bold rounded-full h-14 mt-4 transition-all text-base"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
        </div>
      </div>

      {/* Kolom Kanan: Banner SLIDER (Gaya 3: Neo-Brutalism / Offset Shadow) */}
      <div className="hidden lg:flex w-1/2 bg-[#F1F8F5] rounded-[2.5rem] flex-col items-center justify-center p-12 relative overflow-hidden">
        
        {/* Container Utama Gambar Slider Gaya 3 */}
        <div className="relative w-full max-w-sm mb-12 z-10 aspect-square">
            
            {/* Box dengan border solid & offset shadow tegas */}
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