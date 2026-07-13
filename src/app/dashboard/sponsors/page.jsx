'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import {
  collection, addDoc, getDocs, deleteDoc,
  updateDoc, doc, serverTimestamp, orderBy, query
} from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, X, Star, Upload, AlertCircle, CheckCircle } from 'lucide-react'

const inputStyle = {
  width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a',
  borderRadius: '6px', padding: '0.75rem 1rem', color: '#f5f5f5',
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

const emptyForm = { nombre: '', url: '', tipo: 'colaborador' }

export default function DashboardSponsors() {
  const { perfil } = useAuth()
  const router = useRouter()
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (perfil && perfil.rol !== 'superadmin') router.push('/dashboard')
  }, [perfil])

  useEffect(() => { fetchSponsors() }, [])

  async function fetchSponsors() {
    setLoading(true)
    try {
      const q = query(collection(db, 'sponsors'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setSponsors(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setSponsors([]) }
    setLoading(false)
  }

  function abrirModal(sponsor = null) {
    if (sponsor) {
      setEditando(sponsor)
      setForm({ nombre: sponsor.nombre, url: sponsor.url || '', tipo: sponsor.tipo })
      setPreview(sponsor.logo || null)
    } else {
      setEditando(null)
      setForm(emptyForm)
      setPreview(null)
    }
    setFile(null)
    setFeedback(null)
    setModal(true)
  }

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleGuardar() {
    if (!form.nombre) {
      setFeedback({ type: 'error', msg: 'El nombre es requerido' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      let logoUrl = editando?.logo || ''
      if (file) {
        const result = await uploadToCloudinary(file, 'image')
        logoUrl = result.url
      }
      const data = {
        nombre: form.nombre,
        url: form.url,
        tipo: form.tipo,
        logo: logoUrl,
      }
      if (editando) {
        await updateDoc(doc(db, 'sponsors', editando.id), data)
      } else {
        await addDoc(collection(db, 'sponsors'), { ...data, createdAt: serverTimestamp() })
      }
      setFeedback({ type: 'success', msg: editando ? 'Sponsor actualizado' : 'Sponsor creado' })
      await fetchSponsors()
      setTimeout(() => { setModal(false); setFeedback(null) }, 1000)
    } catch {
      setFeedback({ type: 'error', msg: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este sponsor?')) return
    await deleteDoc(doc(db, 'sponsors', id))
    setSponsors(prev => prev.filter(s => s.id !== id))
  }

  const tipoColor = { principal: '#FF5B00', colaborador: '#a78bfa' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Superadmin</p>
          <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sponsors</h1>
        </div>
        <button
          onClick={() => abrirModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.75rem 1.25rem',
            borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.82rem',
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Nuevo sponsor
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
      ) : sponsors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
          <Star size={40} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sin sponsors aún</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {sponsors.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '10px', overflow: 'hidden',
              }}
            >
              {/* Logo */}
              <div style={{
                height: '100px', backgroundColor: '#111',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
              }}>
                {s.logo ? (
                  <img src={s.logo} alt={s.nombre} style={{ maxHeight: '70px', objectFit: 'contain', filter: 'grayscale(100%) brightness(1.5)' }} />
                ) : (
                  <Star size={32} color="#2a2a2a" />
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.9rem' }}>{s.nombre}</p>
                  <span style={{
                    backgroundColor: (tipoColor[s.tipo] || '#444') + '20',
                    color: tipoColor[s.tipo] || '#f5f5f5',
                    padding: '0.15rem 0.5rem', borderRadius: '4px',
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {s.tipo}
                  </span>
                </div>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.75rem', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {s.url}
                  </a>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => abrirModal(s)} style={{ flex: 1, background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#FF5B00'; e.currentTarget.style.color = '#FF5B00' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                    <Edit2 size={13} /> Editar
                  </button>
                  <button onClick={() => handleEliminar(s.id)} style={{ flex: 1, background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
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
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '440px', position: 'relative' }}
            >
              <button onClick={() => setModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer' }}>
                <X size={18} />
              </button>
              <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                {editando ? 'Editar sponsor' : 'Nuevo sponsor'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Logo upload */}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed', borderColor: preview ? '#FF5B00' : '#2a2a2a',
                  borderRadius: '10px', padding: '1.25rem', cursor: 'pointer',
                  backgroundColor: '#0a0a0a', minHeight: '100px', transition: 'border-color 0.2s',
                }}>
                  {preview ? (
                    <img src={preview} alt="logo" style={{ maxHeight: '70px', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <Upload size={24} color="#FF5B00" style={{ opacity: 0.5, marginBottom: '0.4rem' }} />
                      <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.78rem' }}>Subir logo</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                </label>

                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre del sponsor" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="URL (https://...)" type="url" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}>
                  <option value="principal" style={{ backgroundColor: '#1a1a1a' }}>Principal</option>
                  <option value="colaborador" style={{ backgroundColor: '#1a1a1a' }}>Colaborador</option>
                </select>

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
                  {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear sponsor'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}