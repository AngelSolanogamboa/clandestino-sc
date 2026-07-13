'use client'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  doc, query, where, serverTimestamp, orderBy
} from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, X, CalendarDays, Upload, AlertCircle, CheckCircle } from 'lucide-react'

const inputStyle = {
  width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a',
  borderRadius: '6px', padding: '0.75rem 1rem', color: '#f5f5f5',
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

const emptyForm = {
  titulo: '', fecha: '', hora: '', lugar: '',
  ciudad: '', descripcion: '', lineup: '', ticketUrl: '',
}

export default function DashboardEventos() {
  const { user, perfil } = useAuth()
  const [eventos, setEventos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState(null)

  const isSuperadmin = perfil?.rol === 'superadmin'
  const isColaborador = perfil?.rol === 'colaborador'
  const canEdit = isSuperadmin || isColaborador

  useEffect(() => { fetchEventos() }, [perfil])

  async function fetchEventos() {
    if (!perfil) return
    setLoading(true)
    try {
      let q
      if (isSuperadmin) {
        q = query(collection(db, 'eventos'), orderBy('fecha', 'desc'))
      } else {
        q = query(
          collection(db, 'eventos'),
          where('autorId', '==', user.uid),
          orderBy('fecha', 'desc')
        )
      }
      const snap = await getDocs(q)
      setEventos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setEventos([]) }
    setLoading(false)
  }

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function abrirModal(evento = null) {
    if (evento) {
      setEditando(evento)
      setForm({
        titulo: evento.titulo || '',
        fecha: evento.fecha || '',
        hora: evento.hora || '',
        lugar: evento.lugar || '',
        ciudad: evento.ciudad || '',
        descripcion: evento.descripcion || '',
        lineup: (evento.lineup || []).join(', '),
        ticketUrl: evento.ticketUrl || '',
      })
      setPreview(evento.imagen || null)
    } else {
      setEditando(null)
      setForm(emptyForm)
      setPreview(null)
    }
    setFile(null)
    setFeedback(null)
    setModal(true)
  }

  async function handleGuardar() {
    if (!form.titulo || !form.fecha) {
      setFeedback({ type: 'error', msg: 'Título y fecha son requeridos' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      let imagenUrl = editando?.imagen || ''
      if (file) {
        const result = await uploadToCloudinary(file, 'image')
        imagenUrl = result.url
      }
      const hoy = new Date().toISOString().split('T')[0]
      const data = {
        titulo: form.titulo,
        fecha: form.fecha,
        hora: form.hora,
        lugar: form.lugar,
        ciudad: form.ciudad,
        descripcion: form.descripcion,
        lineup: form.lineup.split(',').map(s => s.trim()).filter(Boolean),
        ticketUrl: form.ticketUrl || null,
        imagen: imagenUrl,
        estado: form.fecha >= hoy ? 'proximo' : 'pasado',
        autorId: user.uid,
        autorNombre: perfil?.nombre || '',
      }
      if (editando) {
        await updateDoc(doc(db, 'eventos', editando.id), data)
      } else {
        await addDoc(collection(db, 'eventos'), { ...data, createdAt: serverTimestamp() })
      }
      setFeedback({ type: 'success', msg: editando ? 'Evento actualizado' : 'Evento creado' })
      await fetchEventos()
      setTimeout(() => { setModal(false); setFeedback(null) }, 1000)
    } catch {
      setFeedback({ type: 'error', msg: 'Error al guardar el evento' })
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este evento?')) return
    await deleteDoc(doc(db, 'eventos', id))
    setEventos(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {isSuperadmin ? 'Superadmin' : 'Colaborador'}
          </p>
          <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Eventos
          </h1>
        </div>
        {canEdit && (
          <button
            onClick={() => abrirModal()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.75rem 1.25rem',
              borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.82rem',
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Nuevo evento
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
      ) : eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
          <CalendarDays size={40} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sin eventos aún</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {eventos.map((evento, i) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '10px', overflow: 'hidden', flexWrap: 'wrap',
              }}
            >
              {/* Flyer thumbnail */}
              {evento.imagen ? (
                <img
                  src={evento.imagen}
                  alt={evento.titulo}
                  style={{ width: '72px', height: '72px', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: '72px', height: '72px', flexShrink: 0,
                  backgroundColor: evento.estado === 'proximo' ? '#FF5B00' : '#2a2a2a',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: evento.estado === 'proximo' ? '#0a0a0a' : '#f5f5f5', fontWeight: 900, fontSize: '1.3rem', lineHeight: 1 }}>
                    {new Date(evento.fecha + 'T00:00:00').getDate()}
                  </span>
                  <span style={{ color: evento.estado === 'proximo' ? '#0a0a0a' : '#f5f5f5', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                    {new Date(evento.fecha + 'T00:00:00').toLocaleString('es-MX', { month: 'short' }).toUpperCase()}
                  </span>
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0, padding: '0.75rem 0' }}>
                <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {evento.titulo}
                </p>
                <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.78rem', marginTop: '0.2rem' }}>
                  {evento.lugar}{evento.ciudad ? `, ${evento.ciudad}` : ''} · {evento.hora}
                </p>
              </div>

              <span style={{
                backgroundColor: evento.estado === 'proximo' ? 'rgba(255,91,0,0.15)' : '#2a2a2a',
                color: evento.estado === 'proximo' ? '#FF5B00' : '#f5f5f5',
                padding: '0.2rem 0.6rem', borderRadius: '4px',
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {evento.estado}
              </span>

              <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '1rem' }}>
                {(isSuperadmin || evento.autorId === user?.uid) && (
                  <>
                    <button onClick={() => abrirModal(evento)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#FF5B00'; e.currentTarget.style.color = '#FF5B00' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleEliminar(evento.id)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button onClick={() => setModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer' }}>
                <X size={18} />
              </button>
              <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                {editando ? 'Editar evento' : 'Nuevo evento'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

                {/* Flyer upload */}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed', borderColor: preview ? '#FF5B00' : '#2a2a2a',
                  borderRadius: '10px', cursor: 'pointer', backgroundColor: '#0a0a0a',
                  overflow: 'hidden', minHeight: '120px', transition: 'border-color 0.2s',
                }}>
                  {preview ? (
                    <img src={preview} alt="flyer" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
                      <Upload size={24} color="#FF5B00" style={{ opacity: 0.5 }} />
                      <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.78rem' }}>
                        Subir flyer (opcional)
                      </p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                </label>

                {[
                  { key: 'titulo', placeholder: 'Título del evento', type: 'text' },
                  { key: 'fecha', placeholder: 'Fecha', type: 'date' },
                  { key: 'hora', placeholder: 'Hora (ej: 22:00)', type: 'time' },
                  { key: 'lugar', placeholder: 'Lugar / Venue', type: 'text' },
                  { key: 'ciudad', placeholder: 'Ciudad', type: 'text' },
                  { key: 'ticketUrl', placeholder: 'URL de tickets (opcional)', type: 'url' },
                ].map(field => (
                  <input
                    key={field.key}
                    type={field.type}
                    value={form[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ ...inputStyle, colorScheme: ['date', 'time'].includes(field.type) ? 'dark' : undefined }}
                    onFocus={e => e.target.style.borderColor = '#FF5B00'}
                    onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                  />
                ))}

                <input
                  value={form.lineup}
                  onChange={e => setForm({ ...form, lineup: e.target.value })}
                  placeholder="Lineup (separado por comas: DJ Skull, La Parca)"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />

                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción del evento"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />

                {saving && (
                  <div style={{ backgroundColor: '#0a0a0a', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ height: '100%', width: '40%', backgroundColor: '#FF5B00', borderRadius: '6px' }}
                    />
                  </div>
                )}

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

                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  style={{
                    backgroundColor: saving ? '#2a2a2a' : '#FF5B00',
                    color: saving ? '#f5f5f5' : '#0a0a0a', padding: '0.85rem',
                    borderRadius: '6px', border: 'none', fontWeight: 800,
                    fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Guardando...' : editando ? 'Actualizar evento' : 'Crear evento'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}