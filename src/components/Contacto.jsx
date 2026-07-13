'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Send, Mic2, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const inputStyle = {
  width: '100%',
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '6px',
  padding: '0.85rem 1rem',
  color: '#f5f5f5',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
}

const labelStyle = {
  color: '#f5f5f5',
  opacity: 0.7,
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '0.5rem',
}

const errorStyle = {
  color: '#ff4444',
  fontSize: '0.75rem',
  marginTop: '0.35rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
}

function FormContratacion({ onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState(null)

  // const onSubmit = async (data) => {
  //   setError(null)
  //   try {
  //     // Aquí conectarás con Resend en la Fase 4
  //     // Por ahora simula el envío
  //     await new Promise(r => setTimeout(r, 1200))
  //     console.log('Contratación:', data)
  //     reset()
  //     onSuccess()
  //   } catch (e) {
  //     setError('Hubo un error al enviar. Intenta de nuevo.')
  //   }
  // }

  const onSubmit = async (data) => {
    setError(null)
    try {
      await addDoc(collection(db, 'mensajes'), {
        ...data,
        tipo: 'contratacion',
        createdAt: serverTimestamp(),
      })
      reset()
      onSuccess()
    } catch (e) {
      setError('Hubo un error al enviar. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Nombre */}
      <div>
        <label style={labelStyle}>Nombre / Empresa *</label>
        <input
          {...register('nombre', { required: 'Este campo es requerido' })}
          placeholder="Tu nombre o empresa"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.nombre ? '#ff4444' : '#2a2a2a'}
        />
        {errors.nombre && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.nombre.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>Email *</label>
        <input
          {...register('email', {
            required: 'El email es requerido',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email no válido' }
          })}
          type="email"
          placeholder="tu@email.com"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.email ? '#ff4444' : '#2a2a2a'}
        />
        {errors.email && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.email.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label style={labelStyle}>Teléfono / WhatsApp</label>
        <input
          {...register('telefono')}
          placeholder="+52 999 000 0000"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = '#2a2a2a'}
        />
      </div>

      {/* Tipo de evento */}
      <div>
        <label style={labelStyle}>Tipo de evento *</label>
        <select
          {...register('tipoEvento', { required: 'Selecciona un tipo de evento' })}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.tipoEvento ? '#ff4444' : '#2a2a2a'}
        >
          <option value="" style={{ backgroundColor: '#1a1a1a' }}>Selecciona...</option>
          <option value="fiesta_privada" style={{ backgroundColor: '#1a1a1a' }}>Fiesta privada</option>
          <option value="club" style={{ backgroundColor: '#1a1a1a' }}>Club / Bar</option>
          <option value="festival" style={{ backgroundColor: '#1a1a1a' }}>Festival</option>
          <option value="corporativo" style={{ backgroundColor: '#1a1a1a' }}>Evento corporativo</option>
          <option value="otro" style={{ backgroundColor: '#1a1a1a' }}>Otro</option>
        </select>
        {errors.tipoEvento && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.tipoEvento.message}</p>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label style={labelStyle}>Fecha tentativa *</label>
        <input
          {...register('fecha', { required: 'La fecha es requerida' })}
          type="date"
          style={{ ...inputStyle, colorScheme: 'dark' }}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.fecha ? '#ff4444' : '#2a2a2a'}
        />
        {errors.fecha && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.fecha.message}</p>
        )}
      </div>

      {/* Mensaje */}
      <div>
        <label style={labelStyle}>Detalles del evento *</label>
        <textarea
          {...register('mensaje', { required: 'Cuéntanos sobre tu evento', minLength: { value: 20, message: 'Mínimo 20 caracteres' } })}
          placeholder="Lugar, horario, tipo de música, presupuesto aproximado..."
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.mensaje ? '#ff4444' : '#2a2a2a'}
        />
        {errors.mensaje && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.mensaje.message}</p>
        )}
      </div>

      {error && (
        <p style={{ ...errorStyle, justifyContent: 'center' }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: isSubmitting ? '#2a2a2a' : '#FF5B00',
          color: isSubmitting ? '#f5f5f5' : '#0a0a0a',
          padding: '0.9rem',
          borderRadius: '6px',
          border: 'none',
          fontWeight: 800,
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {isSubmitting ? 'Enviando...' : <><Send size={16} /> Enviar solicitud</>}
      </button>
    </form>
  )
}

function FormColaboracion({ onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState(null)

  // const onSubmit = async (data) => {
  //   setError(null)
  //   try {
  //     await new Promise(r => setTimeout(r, 1200))
  //     console.log('Colaboración:', data)
  //     reset()
  //     onSuccess()
  //   } catch (e) {
  //     setError('Hubo un error al enviar. Intenta de nuevo.')
  //   }
  // }

  const onSubmit = async (data) => {
    setError(null)
    try {
      await addDoc(collection(db, 'mensajes'), {
        ...data,
        tipo: 'colaboracion',
        createdAt: serverTimestamp(),
      })
      reset()
      onSuccess()
    } catch (e) {
      setError('Hubo un error al enviar. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div>
        <label style={labelStyle}>Nombre artístico / Proyecto *</label>
        <input
          {...register('nombre', { required: 'Este campo es requerido' })}
          placeholder="Tu nombre o proyecto"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.nombre ? '#ff4444' : '#2a2a2a'}
        />
        {errors.nombre && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label style={labelStyle}>Email *</label>
        <input
          {...register('email', {
            required: 'El email es requerido',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email no válido' }
          })}
          type="email"
          placeholder="tu@email.com"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.email ? '#ff4444' : '#2a2a2a'}
        />
        {errors.email && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.email.message}</p>
        )}
      </div>

      <div>
        <label style={labelStyle}>Tipo de colaboración *</label>
        <select
          {...register('tipo', { required: 'Selecciona un tipo' })}
          style={{ ...inputStyle, cursor: 'pointer' }}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.tipo ? '#ff4444' : '#2a2a2a'}
        >
          <option value="" style={{ backgroundColor: '#1a1a1a' }}>Selecciona...</option>
          <option value="musica" style={{ backgroundColor: '#1a1a1a' }}>Música / Track</option>
          <option value="diseño" style={{ backgroundColor: '#1a1a1a' }}>Diseño / Arte visual</option>
          <option value="fotografia" style={{ backgroundColor: '#1a1a1a' }}>Fotografía / Video</option>
          <option value="evento" style={{ backgroundColor: '#1a1a1a' }}>Co-producción de evento</option>
          <option value="otro" style={{ backgroundColor: '#1a1a1a' }}>Otro</option>
        </select>
        {errors.tipo && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.tipo.message}</p>
        )}
      </div>

      <div>
        <label style={labelStyle}>Links de referencia</label>
        <input
          {...register('links')}
          placeholder="SoundCloud, Instagram, Behance..."
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = '#2a2a2a'}
        />
      </div>

      <div>
        <label style={labelStyle}>Cuéntanos tu idea *</label>
        <textarea
          {...register('idea', { required: 'Describe tu idea', minLength: { value: 20, message: 'Mínimo 20 caracteres' } })}
          placeholder="¿Qué tienes en mente? ¿Cómo podemos trabajar juntos?"
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
          onFocus={e => e.target.style.borderColor = '#FF5B00'}
          onBlur={e => e.target.style.borderColor = errors.idea ? '#ff4444' : '#2a2a2a'}
        />
        {errors.idea && (
          <p style={errorStyle}><AlertCircle size={13} /> {errors.idea.message}</p>
        )}
      </div>

      {error && (
        <p style={{ ...errorStyle, justifyContent: 'center' }}>
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: isSubmitting ? '#2a2a2a' : '#FF5B00',
          color: isSubmitting ? '#f5f5f5' : '#0a0a0a',
          padding: '0.9rem',
          borderRadius: '6px',
          border: 'none',
          fontWeight: 800,
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {isSubmitting ? 'Enviando...' : <><Send size={16} /> Enviar propuesta</>}
      </button>
    </form>
  )
}

function SuccessMessage({ tipo, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '3rem',
        textAlign: 'center',
        minHeight: '300px',
      }}
    >
      <CheckCircle size={56} color="#FF5B00" />
      <h3 style={{
        color: '#f5f5f5',
        fontWeight: 900,
        fontSize: '1.3rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        ¡Mensaje enviado!
      </h3>
      <p style={{ color: '#f5f5f5', opacity: 0.5, fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.6 }}>
        {tipo === 'contratacion'
          ? 'Recibimos tu solicitud de contratación. Te contactaremos pronto.'
          : 'Recibimos tu propuesta de colaboración. ¡Estamos emocionados de conocer tu trabajo!'}
      </p>
      <button
        onClick={onReset}
        style={{
          marginTop: '0.5rem',
          backgroundColor: 'transparent',
          border: '1px solid #2a2a2a',
          color: '#f5f5f5',
          padding: '0.6rem 1.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Enviar otro
      </button>
    </motion.div>
  )
}

export default function Contacto() {
  const [tab, setTab] = useState('contratacion')
  const [success, setSuccess] = useState(false)

  const handleTab = (t) => {
    setTab(t)
    setSuccess(false)
  }

  return (
    <section id="contacto" style={{
      backgroundColor: '#0a0a0a',
      padding: '6rem 1.5rem',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            color: '#FF5B00',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Trabajemos juntos
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#f5f5f5',
            letterSpacing: '0.05em',
          }}>
            Contacto
          </h2>
        </motion.div>

        {/* Card formulario */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: '1px solid #2a2a2a',
          }}>
            {[
              { key: 'contratacion', label: 'Contrataciones', icon: <Mic2 size={16} /> },
              { key: 'colaboracion', label: 'Colaboraciones', icon: <Users size={16} /> },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => handleTab(t.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1.1rem',
                  border: 'none',
                  borderBottom: '2px solid',
                  borderBottomColor: tab === t.key ? '#FF5B00' : 'transparent',
                  backgroundColor: tab === t.key ? 'rgba(255,91,0,0.06)' : 'transparent',
                  color: tab === t.key ? '#FF5B00' : '#f5f5f5',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: tab === t.key ? 1 : 0.5,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Formulario */}
          <div style={{ padding: '2rem' }}>
            <AnimatePresence mode="wait">
              {success ? (
                <SuccessMessage
                  key="success"
                  tipo={tab}
                  onReset={() => setSuccess(false)}
                />
              ) : tab === 'contratacion' ? (
                <motion.div
                  key="contratacion"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormContratacion onSuccess={() => setSuccess(true)} />
                </motion.div>
              ) : (
                <motion.div
                  key="colaboracion"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormColaboracion onSuccess={() => setSuccess(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Info adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <a
            href="https://www.instagram.com/clandestino.s.c/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#f5f5f5',
              opacity: 0.4,
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#FF5B00' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.4; e.currentTarget.style.color = '#f5f5f5' }}
          >
            @clandestino.s.c
          </a>
        </motion.div>
      </div>
    </section>
  )
}