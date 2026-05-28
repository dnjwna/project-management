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


// Data Slider Gaya 3 (Neo-Brutalism) - Sama persis dengan Register
const sliderData = [
  {
    id: 1,
    image: ilustrasiBanner,
    title: 'Make your work easier and organized with',
    highlight: 'ProjectHub'
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
              Simplify your workflow and boost your productivity with <span className="font-bold text-app-dark">ProjectHub</span>. Get started for free.
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
              className="w-full bg-black hover:bg-slate-800 text-white font-bold rounded-full h-14 mt-2 transition-all text-base"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="flex justify-center gap-4">
            <button className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/></svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.78 1.44.03 2.59.57 3.32 1.6-2.84 1.7-2.35 5.56.27 6.64-.78 1.87-1.87 3.57-2.4 4.71zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.33 2.32-1.78 4.29-3.74 4.25z"/></svg>
            </button>
            <button className="w-12 h-12 rounded-full bg-black flex items-center justify-center hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
          </div>

          <p className="text-center text-slate-500 text-sm mt-12">
            Not a member?{' '}
            <Link to="/register" className="text-[#000101] hover:underline font-bold transition-colors">
              Register now
            </Link>
          </p>
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