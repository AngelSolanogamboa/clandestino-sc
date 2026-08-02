'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { AlertCircle, Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

const inputStyle = {
  width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
  borderRadius: '6px', padding: '0.85rem 1rem', color: '#f5f5f5',
  fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

const errorMsgs = {
  'auth/invalid-credential':    'Email o contraseña incorrectos',
  'auth/user-not-found':        'No existe una cuenta con ese email',
  'auth/wrong-password':        'Contraseña incorrecta',
  'auth/too-many-requests':     'Demasiados intentos. Espera un momento.',
  'auth/email-already-in-use':  'Ese email ya está registrado',
  'auth/weak-password':         'La contraseña debe tener mínimo 6 caracteres',
  'auth/popup-closed-by-user':  'Cerraste la ventana de Google. Intenta de nuevo.',
}

export default function LoginPage() {
  const { login, loginGoogle, register, resetPassword } = useAuth()
  const router = useRouter()

  const [modo, setModo]         = useState('login') // login | registro | reset
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [resetSent, setResetSent] = useState(false)

  const [form, setForm] = useState({ nombre: '', email: '', password: '' })

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const redirigir = () => {
    document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}`
    router.push('/dashboard')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await login(form.email, form.password)
      redirigir()
    } catch (err) {
      setError(errorMsgs[err.code] || 'Error al iniciar sesión')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setError(null); setLoading(true)
    try {
      await loginGoogle()
      redirigir()
    } catch (err) {
      setError(errorMsgs[err.code] || 'Error con Google')
    } finally { setLoading(false) }
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    if (!form.nombre) { setError('Ingresa tu nombre'); return }
    setError(null); setLoading(true)
    try {
      await register(form.nombre, form.email, form.password)
      redirigir()
    } catch (err) {
      setError(errorMsgs[err.code] || 'Error al crear cuenta')
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await resetPassword(form.email)
      setResetSent(true)
    } catch {
      setError('No encontramos una cuenta con ese email')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,91,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: '#111', border: '1px solid #2a2a2a',
          borderRadius: '16px', padding: '2.5rem', width: '100%',
          maxWidth: '420px', position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image src="/logo.png" alt="Clandestino S.C." width={64} height={64}
            style={{ borderRadius: '12px', marginBottom: '0.75rem' }} />
          <h1 style={{
            color: '#f5f5f5', fontFamily: 'var(--font-gothic)',
            fontSize: '1.3rem', letterSpacing: '0.05em',
          }}>
            Clandestino <span style={{ color: '#FF5B00' }}>S.C.</span>
          </h1>
          <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.3rem' }}>
            {modo === 'login' ? 'Iniciar sesión' : modo === 'registro' ? 'Crear cuenta' : 'Recuperar contraseña'}
          </p>
        </div>

        {/* Tabs login / registro */}
        {modo !== 'reset' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem', border: '1px solid #2a2a2a', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { key: 'login',    label: 'Iniciar sesión' },
              { key: 'registro', label: 'Crear cuenta'   },
            ].map(t => (
              <button key={t.key} onClick={() => { setModo(t.key); setError(null) }} style={{
                padding: '0.65rem', border: 'none',
                backgroundColor: modo === t.key ? '#FF5B00' : 'transparent',
                color: modo === t.key ? '#0a0a0a' : '#f5f5f5',
                fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* LOGIN */}
          {modo === 'login' && (
            <motion.form key="login"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <input type="email" placeholder="Email" value={form.email}
                onChange={setField('email')} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#FF5B00'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="Contraseña"
                  value={form.password} onChange={setField('password')} required
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && <ErrorBox msg={error} />}

              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? 'Iniciando...' : 'Entrar'}
              </button>

              <Divider />

              <GoogleBtn onClick={handleGoogle} loading={loading} />

              <button type="button" onClick={() => { setModo('reset'); setError(null) }}
                style={{ background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.35, fontSize: '0.78rem', cursor: 'pointer', textAlign: 'center' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </motion.form>
          )}

          {/* REGISTRO */}
          {modo === 'registro' && (
            <motion.form key="registro"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegistro}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <input type="text" placeholder="Tu nombre" value={form.nombre}
                onChange={setField('nombre')} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#FF5B00'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

              <input type="email" placeholder="Email" value={form.email}
                onChange={setField('email')} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#FF5B00'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="Contraseña (mín. 6 caracteres)"
                  value={form.password} onChange={setField('password')} required
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && <ErrorBox msg={error} />}

              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <Divider />

              <GoogleBtn onClick={handleGoogle} loading={loading} />

              <p style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.7rem', textAlign: 'center', lineHeight: 1.5 }}>
                Al registrarte aceptas los términos y condiciones del colectivo.
              </p>
            </motion.form>
          )}

          {/* RESET */}
          {modo === 'reset' && !resetSent && (
            <motion.form key="reset"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleReset}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <input type="email" placeholder="Tu email" value={form.email}
                onChange={setField('email')} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#FF5B00'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

              {error && <ErrorBox msg={error} />}

              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>

              <button type="button" onClick={() => { setModo('login'); setError(null) }}
                style={{ background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.35, fontSize: '0.78rem', cursor: 'pointer', textAlign: 'center' }}>
                Volver al login
              </button>
            </motion.form>
          )}

          {/* RESET ENVIADO */}
          {modo === 'reset' && resetSent && (
            <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
              <p style={{ color: '#f5f5f5', fontWeight: 700, marginBottom: '0.5rem' }}>¡Revisa tu correo!</p>
              <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.85rem', lineHeight: 1.6 }}>
                Te enviamos instrucciones para restablecer tu contraseña.
              </p>
              <button onClick={() => { setModo('login'); setResetSent(false); setError(null) }}
                style={{ marginTop: '1.5rem', background: 'none', border: '1px solid #2a2a2a', color: '#f5f5f5', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Volver al login
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Link al sitio */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/" style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.72rem', letterSpacing: '0.05em', textDecoration: 'none' }}>
            ← Volver al sitio
          </a>
        </div>
      </motion.div>
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      color: '#ff4444', backgroundColor: 'rgba(255,68,68,0.1)',
      border: '1px solid rgba(255,68,68,0.2)', borderRadius: '6px',
      padding: '0.75rem', fontSize: '0.8rem',
    }}>
      <AlertCircle size={14} /> {msg}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#2a2a2a' }} />
      <span style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.72rem', letterSpacing: '0.1em' }}>O</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#2a2a2a' }} />
    </div>
  )
}

function GoogleBtn({ onClick, loading }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
      backgroundColor: 'transparent', border: '1px solid #2a2a2a', borderRadius: '6px',
      color: '#f5f5f5', padding: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer',
      fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.05em', transition: 'border-color 0.2s',
      opacity: loading ? 0.5 : 1,
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#FF5B00'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.8-1.9 13.4-5.1l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.6 35.5 16.3 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.5 5.7l6.2 5.2C36.6 37.2 44 32 44 24c0-1.2-.1-2.3-.4-3.5z"/>
      </svg>
      Continuar con Google
    </button>
  )
}

function btnStyle(loading) {
  return {
    backgroundColor: loading ? '#2a2a2a' : '#FF5B00',
    color: loading ? '#f5f5f5' : '#0a0a0a',
    padding: '0.9rem', borderRadius: '6px', border: 'none',
    fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em',
    textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
  }
}