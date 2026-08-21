import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const redirect = params.get('redirect') || '/'
  const action = params.get('action') || ''

  useEffect(() => {
    sessionStorage.setItem('ih_login_redirect', redirect)
    if (action) sessionStorage.setItem('ih_login_action', action)
    else sessionStorage.removeItem('ih_login_action')
  }, [redirect, action])

  const handleClose = () => {
    if (!user) navigate(-1)
  }

  return <AuthModal initialTab="signin" onClose={handleClose} />
}