import { useSelector } from 'react-redux'

export const useAuth = () => {
  const { user, token, loading, error } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!token

  return { user, token, loading, error, isAdmin, isAuthenticated }
}