import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../utils/axios'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Lock, Save, Loader2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../features/auth/authSlice'

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]
const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function Profile() {
  const { user } = useAuth()
  const dispatch = useDispatch()

  // State untuk form info profil
  const [profileData, setProfileData] = useState({ name: '', email: '' })
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })

  // State untuk form password
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })

  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

  // Set initial data saat komponen dirender
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdatingProfile(true)
    setProfileMessage({ type: '', text: '' })

    try {
      // Tangkap response dari API
      const response = await api.put('/profile', profileData)

      setProfileMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      })

      // Update Redux state agar Navbar langsung berubah
      dispatch(updateUser(response.data.user))

    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile'
      })
    }

    setUpdatingProfile(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setUpdatingPassword(true)
    setPasswordMessage({ type: '', text: '' })

    try {
      await api.put('/profile/password', passwordData)

      setPasswordMessage({
        type: 'success',
        text: 'Password changed successfully!'
      })

      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: ''
      })

    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password'
      })
    }

    setUpdatingPassword(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your profile information and security.
        </p>
      </div>

      <div className="space-y-6">
        {/* General Info Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <User size={18} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">
              General Information
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6">
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                <AvatarFallback className={`${getColor(user?.name)} text-white text-xl font-bold`}>
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4 mt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>

                  <input
                    required
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        name: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>

                  <input
                    required
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        email: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-slate-50/50"
                  />
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <Button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-black hover:bg-slate-800 text-white rounded-xl px-5"
                  >
                    {updatingProfile ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <Save size={16} className="mr-2" />
                    )}

                    Save Changes
                  </Button>

                  {profileMessage.text && (
                    <span
                      className={`text-sm font-medium ${
                        profileMessage.type === 'success'
                          ? 'text-emerald-500'
                          : 'text-red-500'
                      }`}
                    >
                      {profileMessage.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Security / Password Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Lock size={18} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">
              Security & Password
            </h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Current Password
              </label>

              <input
                required
                type="password"
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    current_password: e.target.value
                  })
                }
                className="w-full max-w-md px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                New Password
              </label>

              <input
                required
                type="password"
                value={passwordData.password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password: e.target.value
                  })
                }
                className="w-full max-w-md px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>

              <input
                required
                type="password"
                value={passwordData.password_confirmation}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    password_confirmation: e.target.value
                  })
                }
                className="w-full max-w-md px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-slate-50/50"
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Button
                type="submit"
                disabled={updatingPassword}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl px-5"
              >
                {updatingPassword ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Lock size={16} className="mr-2" />
                )}

                Change Password
              </Button>

              {passwordMessage.text && (
                <span
                  className={`text-sm font-medium ${
                    passwordMessage.type === 'success'
                      ? 'text-emerald-500'
                      : 'text-red-500'
                  }`}
                >
                  {passwordMessage.text}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}