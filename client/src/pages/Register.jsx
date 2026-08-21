import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

export default function Register() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const redirect = params.get('redirect') || '/'
  const action = params.get('action') || ''
  const track = params.get('track') || ''
  const intent = params.get('intent') || ''

  useEffect(() => {
    // Internship signup (or ?intent=apply): after creating the account, drop
    // the user straight into the application form (?apply=1 auto-opens the
    // modal); submission then forwards them into /intern-portal.
    if (track === 'internship' || intent === 'apply') {
      sessionStorage.setItem('ih_login_redirect', '/internship?apply=1')
      sessionStorage.setItem('ih_login_action', 'apply_internship')
      return
    }
    sessionStorage.setItem('ih_login_redirect', redirect)
    if (action) sessionStorage.setItem('ih_login_action', action)
    else sessionStorage.removeItem('ih_login_action')
  }, [redirect, action, track, intent])

  const handleClose = () => {
    if (!user) navigate(-1)
  }

  return <AuthModal initialTab="signup" onClose={handleClose} />
}