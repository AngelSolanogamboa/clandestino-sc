'use client'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import { db } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { doc, updateDoc } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

const inputStyle = {
  width: '100%', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
  borderRadius: '6px', padding: '0.75rem 1rem', color: '#f5f5f5',
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

export default function DashboardPerfil() {
  const { user, perfil } = useAuth()
  const [form, setForm] = useState({
    nombre: perfil?.nombre || '',
    bio: perfil?.bio || '',
    instagram: perfil?.redes?.instagram || '',
    youtube: perfil?.redes?.youtube || '',
    soundcloud: perfil?.redes?.soundcloud || '',
    tags: (perfil?.tags || []).join(', '),
  })
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(perfil?.avatar || null)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState(null)

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleGuardar() {
    setSaving(true)
    setFeedback(null)
    try {
      let avatarUrl = perfil?.avatar || ''
      if (file) {
        const result = await uploadToCloudinary(file, 'image')
        avatarUrl = result.url
      }
      await updateDoc(doc(db, 'users', user.uid), {
        nombre: form.nombre,
        bio: form.bio,
        avatar: avatarUrl,
        redes: {
          instagram: form.instagram,
          youtube: form.youtube,
          soundcloud: form.soundcloud,
        },
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      })
      setFeedback({ type: 'success', msg: 'Perfil actualizado correctamente' })
    } catch {
      setFeedback({ type: 'error', msg: 'Error al actualizar el perfil' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Colaborador</p>
        <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mi perfil</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '2rem' }}
      >
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
            border: '2px solid #2a2a2a', backgroundColor: '#0a0a0a', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {preview ? (
              <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#FF5B00', fontWeight: 900, fontSize: '1.8rem' }}>
                {(form.nombre || 'U')[0].toUpperCase()}
              </span>
            )}
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'transparent', border: '1px solid #2a2a2a',
            color: '#f5f5f5', opacity: 0.6, padding: '0.5rem 1rem',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#FF5B00' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.6; e.currentTarget.style.borderColor = '#2a2a2a' }}>
            <Upload size={14} /> Cambiar foto
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Tu nombre artístico" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#FF5B00'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
          </div>

          <div>
            <label style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Cuéntanos sobre ti..." rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              onFocus={e => e.target.style.borderColor = '#FF5B00'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
          </div>

          <div>
            <label style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>Tags (separados por coma)</label>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
              placeholder="Techno, DJ, Producer" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#FF5B00'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
          </div>

          <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '1rem' }}>
            <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Redes sociales</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { key: 'instagram', placeholder: 'https://instagram.com/tu-usuario' },
                { key: 'youtube', placeholder: 'https://youtube.com/@tu-canal' },
                { key: 'soundcloud', placeholder: 'https://soundcloud.com/tu-usuario' },
              ].map(red => (
                <input key={red.key} value={form[red.key]}
                  onChange={e => setForm({ ...form, [red.key]: e.target.value })}
                  placeholder={red.placeholder} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
              ))}
            </div>
          </div>

          {feedback && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem',
              color: feedback.type === 'success' ? '#4ade80' : '#ff4444',
              backgroundColor: feedback.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(255,68,68,0.1)',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(74,222,128,0.2)' : 'rgba(255,68,68,0.2)'}`,
              borderRadius: '6px', padding: '0.75rem',
            }}>
              {feedback.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {feedback.msg}
            </div>
          )}

          <button onClick={handleGuardar} disabled={saving} style={{
            backgroundColor: saving ? '#2a2a2a' : '#FF5B00',
            color: saving ? '#f5f5f5' : '#0a0a0a', padding: '0.85rem',
            borderRadius: '6px', border: 'none', fontWeight: 800,
            fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
          }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}