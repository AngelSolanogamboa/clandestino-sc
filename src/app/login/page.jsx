'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      // Guardar cookie de sesión simple
      document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}`
      router.push('/dashboard')
    } catch (err) {
      const msgs = {
        'auth/invalid-credential': 'Email o contraseña incorrectos',
        'auth/user-not-found': 'No existe una cuenta con ese email',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
      }
      setError(msgs[err.code] || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err) {
      setError('No encontramos una cuenta con ese email')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    padding: '0.85rem 1rem',
    color: '#f5f5f5',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
    }}>

      {/* Fondo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,91,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image
            src="/logo.png"
            alt="Clandestino S.C."
            width={72}
            height={72}
            style={{ borderRadius: '12px', marginBottom: '1rem' }}
          />
          <h1 style={{
            color: '#f5f5f5',
            fontWeight: 900,
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Clandestino <span style={{ color: '#FF5B00' }}>S.C.</span>
          </h1>
          <p style={{
            color: '#f5f5f5',
            opacity: 0.35,
            fontSize: '0.78rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '0.3rem',
          }}>
            {resetMode ? 'Recuperar contraseña' : 'Panel de administración'}
          </p>
        </div>

        {/* Formulario login */}
        {!resetMode && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                color: '#f5f5f5', opacity: 0.5, fontSize: '0.75rem',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'block', marginBottom: '0.5rem',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#FF5B00'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>

            <div>
              <label style={{
                color: '#f5f5f5', opacity: 0.5, fontSize: '0.75rem',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'block', marginBottom: '0.5rem',
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#f5f5f5', opacity: 0.4,
                    cursor: 'pointer', padding: '0.25rem',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#ff4444', fontSize: '0.8rem',
                backgroundColor: 'rgba(255,68,68,0.1)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: '6px', padding: '0.75rem',
              }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                backgroundColor: loading ? '#2a2a2a' : '#FF5B00',
                color: loading ? '#f5f5f5' : '#0a0a0a',
                padding: '0.9rem',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => { setResetMode(true); setError(null) }}
              style={{
                background: 'none', border: 'none',
                color: '#f5f5f5', opacity: 0.35,
                fontSize: '0.78rem', cursor: 'pointer',
                textAlign: 'center', letterSpacing: '0.05em',
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}

        {/* Formulario reset */}
        {resetMode && !resetSent && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                color: '#f5f5f5', opacity: 0.5, fontSize: '0.75rem',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                display: 'block', marginBottom: '0.5rem',
              }}>
                Tu email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#FF5B00'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: '#ff4444', fontSize: '0.8rem',
                backgroundColor: 'rgba(255,68,68,0.1)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: '6px', padding: '0.75rem',
              }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#2a2a2a' : '#FF5B00',
                color: loading ? '#f5f5f5' : '#0a0a0a',
                padding: '0.9rem', borderRadius: '6px', border: 'none',
                fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>

            <button
              type="button"
              onClick={() => { setResetMode(false); setError(null) }}
              style={{
                background: 'none', border: 'none', color: '#f5f5f5',
                opacity: 0.35, fontSize: '0.78rem', cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Volver al login
            </button>
          </form>
        )}

        {/* Reset enviado */}
        {resetMode && resetSent && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
            <p style={{ color: '#f5f5f5', fontWeight: 700, marginBottom: '0.5rem' }}>
              ¡Revisa tu correo!
            </p>
            <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.85rem', lineHeight: 1.6 }}>
              Te enviamos instrucciones para restablecer tu contraseña.
            </p>
            <button
              onClick={() => { setResetMode(false); setResetSent(false); setError(null) }}
              style={{
                marginTop: '1.5rem', background: 'none', border: '1px solid #2a2a2a',
                color: '#f5f5f5', padding: '0.6rem 1.5rem', borderRadius: '4px',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}
            >
              Volver al login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}