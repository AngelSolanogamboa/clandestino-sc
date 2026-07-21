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
import { Upload, Trash2, Edit2, X, ImagePlus, AlertCircle, CheckCircle } from 'lucide-react'

const tipos = ['Fotos', 'Flyers', 'Videos']

export default function DashboardPortafolio() {
  const { user, perfil } = useAuth()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editando, setEditando] = useState(null)
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [form, setForm]         = useState({ titulo: '', tipo: 'Fotos' })
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [filtro, setFiltro]     = useState('Todo')

  const isSuperadmin = perfil?.rol === 'superadmin'

  useEffect(() => { fetchItems() }, [perfil])

  async function fetchItems() {
    if (!perfil) return
    setLoading(true)
    let q
    if (isSuperadmin) {
      q = query(collection(db, 'portafolio'), )
    } else {
      q = query(
        collection(db, 'portafolio'),
        where('autorId', '==', user.uid),
        // orderBy('createdAt', 'desc')
      )
    }
    try {
      const snap = await getDocs(q)
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setItems([]) }
    setLoading(false)
  }

  function abrirModal(item = null) {
    if (item) {
      setEditando(item)
      setForm({ titulo: item.titulo || '', tipo: item.tipo || 'Fotos' })
      setPreview(item.url || null)
    } else {
      setEditando(null)
      setForm({ titulo: '', tipo: 'Fotos' })
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
    if (!form.titulo) {
      setFeedback({ type: 'error', msg: 'Agrega un título' })
      return
    }
    if (!editando && !file) {
      setFeedback({ type: 'error', msg: 'Selecciona un archivo' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      if (editando) {
        // Solo actualiza título y tipo, o también el archivo si se seleccionó uno nuevo
        let updateData = {
          titulo: form.titulo,
          tipo: form.tipo,
        }
        if (file) {
          const result = await uploadToCloudinary(file)
          updateData.url = result.url
          updateData.publicId = result.publicId
          updateData.resourceType = result.resourceType
        }
        await updateDoc(doc(db, 'portafolio', editando.id), updateData)
        setFeedback({ type: 'success', msg: 'Actualizado correctamente' })
      } else {
        const result = await uploadToCloudinary(file)
        await addDoc(collection(db, 'portafolio'), {
          titulo: form.titulo,
          tipo: form.tipo,
          url: result.url,
          publicId: result.publicId,
          resourceType: result.resourceType,
          autorId: user.uid,
          autorNombre: perfil?.nombre || user?.email || 'Anónimo',
          autorAvatar: perfil?.avatar || '',
          createdAt: serverTimestamp(),
        })
        setFeedback({ type: 'success', msg: 'Subido correctamente' })
      }
      await fetchItems()
      setTimeout(() => { setModal(false); setFeedback(null) }, 1000)
    } catch {
      setFeedback({ type: 'error', msg: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(item) {
    if (!confirm('¿Eliminar este archivo?')) return
    await deleteDoc(doc(db, 'portafolio', item.id))
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  const filtrados = filtro === 'Todo' ? items : items.filter(i => i.tipo === filtro)

  const inputStyle = {
    width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a',
    borderRadius: '6px', padding: '0.75rem 1rem', color: '#f5f5f5',
    fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {isSuperadmin ? 'Superadmin' : 'Colaborador'}
          </p>
          <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Portafolio
          </h1>
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
          <ImagePlus size={16} /> Subir archivo
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['Todo', ...tipos].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid',
            borderColor: filtro === f ? '#FF5B00' : '#2a2a2a',
            backgroundColor: filtro === f ? '#FF5B00' : 'transparent',
            color: filtro === f ? '#0a0a0a' : '#f5f5f5',
            fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
          <Upload size={40} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sin archivos aún</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          <AnimatePresence>
            {filtrados.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  position: 'relative', borderRadius: '8px', overflow: 'hidden',
                  backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', aspectRatio: '4/3',
                }}
              >
                {/* Media */}
                {item.resourceType === 'video' ? (
                  <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  <img src={item.url} alt={item.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}

                {/* Overlay info */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                  padding: '1.5rem 0.75rem 0.75rem',
                }}>
                  <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.titulo}
                  </p>
                  {item.autorNombre && (
                    <p style={{ color: '#FF5B00', fontSize: '0.65rem', fontWeight: 600, marginTop: '0.1rem' }}>
                      {item.autorNombre}
                    </p>
                  )}
                </div>

                {/* Botones acción */}
                <div style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  display: 'flex', gap: '0.35rem',
                }}>
                  {(isSuperadmin || item.autorId === user?.uid) && (
                    <>
                      <button
                        onClick={() => abrirModal(item)}
                        style={{
                          background: 'rgba(10,10,10,0.8)', border: '1px solid #2a2a2a',
                          borderRadius: '6px', padding: '0.35rem', cursor: 'pointer',
                          color: '#f5f5f5', display: 'flex', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF5B00'; e.currentTarget.style.color = '#FF5B00' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleEliminar(item)}
                        style={{
                          background: 'rgba(10,10,10,0.8)', border: '1px solid #2a2a2a',
                          borderRadius: '6px', padding: '0.35rem', cursor: 'pointer',
                          color: '#f5f5f5', display: 'flex', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>

                {/* Badge tipo */}
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                  <span style={{
                    backgroundColor: 'rgba(255,91,0,0.2)', color: '#FF5B00',
                    padding: '0.15rem 0.5rem', borderRadius: '4px',
                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {item.tipo}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal subir/editar */}
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
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '460px', position: 'relative' }}
            >
              <button onClick={() => setModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer' }}>
                <X size={18} />
              </button>
              <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                {editando ? 'Editar archivo' : 'Subir archivo'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Dropzone */}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed', borderColor: preview ? '#FF5B00' : '#2a2a2a',
                  borderRadius: '10px', cursor: 'pointer', backgroundColor: '#0a0a0a',
                  overflow: 'hidden', minHeight: '140px', transition: 'border-color 0.2s',
                }}>
                  {preview ? (
                    file?.type.startsWith('video') ? (
                      <video src={preview} style={{ maxHeight: '140px', width: '100%', objectFit: 'cover' }} muted />
                    ) : (
                      <img src={preview} alt="preview" style={{ maxHeight: '140px', width: '100%', objectFit: 'cover' }} />
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
                      <Upload size={28} color="#FF5B00" style={{ opacity: 0.6 }} />
                      <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.82rem', textAlign: 'center' }}>
                        {editando ? 'Clic para cambiar archivo (opcional)' : 'Clic para seleccionar imagen o video'}
                      </p>
                    </div>
                  )}
                  <input type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
                </label>

                {/* Si está editando y hay preview del archivo actual, botón para cambiarlo */}
                {editando && preview && (
                  <button
                    onClick={() => { setFile(null); setPreview(editando.url) }}
                    style={{
                      background: 'none', border: '1px solid #2a2a2a', color: '#f5f5f5',
                      opacity: 0.4, fontSize: '0.72rem', cursor: 'pointer', borderRadius: '4px',
                      padding: '0.3rem 0.75rem', letterSpacing: '0.05em',
                    }}
                  >
                    Mantener archivo original
                  </button>
                )}

                <input
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Título"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />

                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                >
                  {tipos.map(t => (
                    <option key={t} value={t} style={{ backgroundColor: '#1a1a1a' }}>{t}</option>
                  ))}
                </select>

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
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    backgroundColor: saving ? '#2a2a2a' : '#FF5B00',
                    color: saving ? '#f5f5f5' : '#0a0a0a', padding: '0.85rem',
                    borderRadius: '6px', border: 'none', fontWeight: 800, fontSize: '0.85rem',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Guardando...' : editando ? 'Actualizar' : <><Upload size={15} /> Subir</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}