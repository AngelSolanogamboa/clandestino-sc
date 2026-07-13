'use client'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import {
  collection, addDoc, getDocs, deleteDoc,
  updateDoc, doc, query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, X, Music2, Play, AlertCircle, CheckCircle, Radio, Upload } from 'lucide-react'

const inputStyle = {
  width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a',
  borderRadius: '6px', padding: '0.75rem 1rem', color: '#f5f5f5',
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

const emptyForm = {
  tipo: 'mix',
  titulo: '',
  descripcion: '',
  duracion: '',
  youtubeId: '',
}

export default function DashboardMusica() {
  const { user, perfil } = useAuth()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [editando, setEditando]   = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [audioFile, setAudioFile] = useState(null)
  const [audioPreview, setAudioPreview] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [feedback, setFeedback]   = useState(null)
  const [tab, setTab]             = useState('mix')

  const isSuperadmin = perfil?.rol === 'superadmin'

  useEffect(() => { fetchItems() }, [perfil])

  async function fetchItems() {
    if (!perfil) return
    setLoading(true)
    try {
      const q = query(collection(db, 'musica'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setItems([]) }
    setLoading(false)
  }

  function abrirModal(item = null) {
    if (item) {
      setEditando(item)
      setForm({
        tipo: item.tipo,
        titulo: item.titulo || '',
        descripcion: item.descripcion || '',
        duracion: item.duracion || '',
        youtubeId: item.youtubeId || '',
      })
      setAudioPreview(item.audioUrl || null)
    } else {
      setEditando(null)
      setForm({ ...emptyForm, tipo: tab })
      setAudioPreview(null)
    }
    setAudioFile(null)
    setUploadProgress(null)
    setFeedback(null)
    setModal(true)
  }

  function handleAudioFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setAudioFile(f)
    setAudioPreview(URL.createObjectURL(f))
  }

  async function handleGuardar() {
    if (!form.titulo) {
      setFeedback({ type: 'error', msg: 'El título es requerido' })
      return
    }
    if (form.tipo === 'mix' && !audioFile && !editando?.audioUrl) {
      setFeedback({ type: 'error', msg: 'Selecciona un archivo de audio' })
      return
    }
    if (form.tipo === 'video' && !form.youtubeId) {
      setFeedback({ type: 'error', msg: 'Agrega el ID de YouTube' })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      let audioUrl = editando?.audioUrl || ''
      let audioDuration = form.duracion

      if (audioFile && form.tipo === 'mix') {
        setUploadProgress('Subiendo audio...')
        const result = await uploadToCloudinary(audioFile, 'video') // Cloudinary usa 'video' para audio
        audioUrl = result.url
        setUploadProgress(null)
      }

      const data = {
        tipo: form.tipo,
        titulo: form.titulo,
        descripcion: form.descripcion,
        duracion: form.duracion,
        audioUrl: form.tipo === 'mix' ? audioUrl : '',
        youtubeId: form.tipo === 'video' ? form.youtubeId : '',
        autorId: user.uid,
        autorNombre: perfil?.nombre || user?.email || 'Anónimo',
        autorAvatar: perfil?.avatar || '',
      }

      if (editando) {
        await updateDoc(doc(db, 'musica', editando.id), data)
      } else {
        await addDoc(collection(db, 'musica'), { ...data, createdAt: serverTimestamp() })
      }

      setFeedback({ type: 'success', msg: editando ? 'Actualizado correctamente' : 'Creado correctamente' })
      await fetchItems()
      setTimeout(() => { setModal(false); setFeedback(null) }, 1000)
    } catch (e) {
      console.error(e)
      setFeedback({ type: 'error', msg: 'Error al guardar' })
    } finally {
      setSaving(false)
      setUploadProgress(null)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este elemento?')) return
    await deleteDoc(doc(db, 'musica', id))
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtrados = items.filter(i => i.tipo === tab)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {isSuperadmin ? 'Superadmin' : 'Colaborador'}
          </p>
          <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Música & Video
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
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {/* {[
          { key: 'mix',   label: 'Mixes / Audio', icon: <Radio size={15} /> },
          { key: 'video', label: 'Videos',         icon: <Play size={15} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1.1rem', borderRadius: '4px', border: '1px solid',
            borderColor: tab === t.key ? '#FF5B00' : '#2a2a2a',
            backgroundColor: tab === t.key ? '#FF5B00' : 'transparent',
            color: tab === t.key ? '#0a0a0a' : '#f5f5f5',
            fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {t.icon} {t.label}
          </button>
        ))} */}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
          {tab === 'mix'
            ? <Radio size={40} style={{ margin: '0 auto 1rem' }} />
            : <Play size={40} style={{ margin: '0 auto 1rem' }} />}
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Sin {tab === 'mix' ? 'mixes' : 'videos'} aún
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtrados.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '10px', overflow: 'hidden',
              }}
            >
              {/* Player de audio inline si es mix */}
              {item.tipo === 'mix' && item.audioUrl && (
                <div style={{ padding: '1rem 1.25rem 0' }}>
                  {item.audioUrl.includes('/video/upload/') && !item.audioUrl.match(/\.(mp3|wav|flac|m4a|ogg|aac)$/i) ? (
                    <video
                      controls
                      src={item.audioUrl}
                      style={{ width: '100%', maxHeight: '160px', borderRadius: '6px', display: 'block', backgroundColor: '#0a0a0a' }}
                    />
                  ) : (
                    <audio
                      controls
                      src={item.audioUrl}
                      style={{ width: '100%', height: '36px', accentColor: '#FF5B00' }}
                    />
                  )}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: item.tipo === 'mix' ? 'rgba(255,91,0,0.15)' : 'rgba(167,139,250,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.tipo === 'mix'
                    ? <Music2 size={18} color="#FF5B00" />
                    : <Play size={18} color="#a78bfa" />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.titulo}
                  </p>
                  <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.78rem', marginTop: '0.15rem' }}>
                    {item.descripcion || '—'}
                    {item.duracion && ` · ${item.duracion}`}
                  </p>

                  {/* Autor */}
                  {item.autorNombre && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                      {item.autorAvatar ? (
                        <img
                          src={item.autorAvatar}
                          alt={item.autorNombre}
                          style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          backgroundColor: 'rgba(255,91,0,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 700, color: '#FF5B00',
                        }}>
                          {item.autorNombre[0].toUpperCase()}
                        </div>
                      )}
                      <span style={{ color: '#FF5B00', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        {item.autorNombre}
                      </span>
                    </div>
                  )}
                </div>

                <span style={{
                  backgroundColor: item.tipo === 'mix' ? 'rgba(255,91,0,0.15)' : 'rgba(167,139,250,0.15)',
                  color: item.tipo === 'mix' ? '#FF5B00' : '#a78bfa',
                  padding: '0.2rem 0.6rem', borderRadius: '4px',
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {item.tipo === 'mix' ? 'Mix' : 'Video'}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => abrirModal(item)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#FF5B00'; e.currentTarget.style.color = '#FF5B00' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleEliminar(item.id)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Preview YouTube */}
              {item.tipo === 'video' && item.youtubeId && (
                <img
                  src={`https://img.youtube.com/vi/${item.youtubeId}/default.jpg`}
                  alt={item.titulo}
                  style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', display: 'block', opacity: 0.6 }}
                />
              )}
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
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '480px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button onClick={() => setModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer' }}>
                <X size={18} />
              </button>

              <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                {editando ? 'Editar' : 'Agregar'} {form.tipo === 'mix' ? 'Mix / Audio' : 'Video'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Selector de tipo */}
                {!editando && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {[
                      { key: 'mix',   label: 'Mix / Audio', icon: <Radio size={15} /> },
                      { key: 'video', label: 'Video YouTube', icon: <Play size={15} /> },
                    ].map(t => (
                      <button key={t.key} onClick={() => setForm({ ...form, tipo: t.key })} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        padding: '0.65rem', borderRadius: '6px', border: '1px solid',
                        borderColor: form.tipo === t.key ? '#FF5B00' : '#2a2a2a',
                        backgroundColor: form.tipo === t.key ? 'rgba(255,91,0,0.1)' : 'transparent',
                        color: form.tipo === t.key ? '#FF5B00' : '#f5f5f5',
                        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Campos comunes */}
                <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Título" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

                <input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción (ej: Underground set — Techno)" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

                {/* Campos de Mix / Audio */}
                {form.tipo === 'mix' && (
                  <>
                    <input value={form.duracion} onChange={e => setForm({ ...form, duracion: e.target.value })}
                      placeholder="Duración (ej: 1:02:34)" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#FF5B00'}
                      onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

                    {/* Upload de audio */}
                    <div>
                      <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed', borderColor: audioPreview ? '#FF5B00' : '#2a2a2a',
                        borderRadius: '10px', padding: '1.5rem', cursor: 'pointer',
                        backgroundColor: '#0a0a0a', transition: 'border-color 0.2s', minHeight: '100px',
                      }}>
                        {audioPreview ? (
                          <div style={{ width: '100%' }}>
                            {audioFile?.type.startsWith('video/') ? (
                              <video
                                controls
                                src={audioPreview}
                                style={{ width: '100%', maxHeight: '160px', borderRadius: '6px', display: 'block' }}
                              />
                            ) : (
                              <audio
                                controls
                                src={audioPreview}
                                style={{ width: '100%', accentColor: '#FF5B00' }}
                              />
                            )}
                            <p style={{ color: '#FF5B00', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', marginTop: '0.5rem', letterSpacing: '0.08em' }}>
                              {audioFile ? audioFile.name : 'Archivo actual'}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload size={28} color="#FF5B00" style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                            <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.82rem', textAlign: 'center' }}>
                              Clic para subir audio
                            </p>
                            <p style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.72rem', marginTop: '0.25rem', textAlign: 'center' }}>
                              Audio: MP3, WAV, FLAC, M4A · Video: MP4, MOV, WEBM
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          accept="audio/*,video/*"
                          onChange={handleAudioFile}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {/* Cambiar archivo si ya hay uno */}
                      {audioPreview && (
                        <button
                          onClick={() => { setAudioFile(null); setAudioPreview(null) }}
                          style={{
                            marginTop: '0.5rem', background: 'none', border: '1px solid #2a2a2a',
                            color: '#f5f5f5', opacity: 0.4, fontSize: '0.72rem', cursor: 'pointer',
                            borderRadius: '4px', padding: '0.3rem 0.75rem', width: '100%', letterSpacing: '0.05em',
                          }}
                        >
                          Cambiar archivo
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Campos de Video YouTube */}
                {form.tipo === 'video' && (
                  <div>
                    <input value={form.youtubeId} onChange={e => setForm({ ...form, youtubeId: e.target.value })}
                      placeholder="ID de YouTube (ej: dQw4w9WgXcQ)" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#FF5B00'}
                      onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                    <p style={{ color: '#f5f5f5', opacity: 0.3, fontSize: '0.72rem', marginTop: '0.35rem' }}>
                      youtube.com/watch?v=<strong style={{ color: '#FF5B00' }}>ESTE_ES_EL_ID</strong>
                    </p>
                    {form.youtubeId && (
                      <img
                        src={`https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`}
                        alt="preview"
                        style={{ width: '100%', borderRadius: '6px', marginTop: '0.75rem', objectFit: 'cover', maxHeight: '140px' }}
                      />
                    )}
                  </div>
                )}

                {/* Barra de progreso al subir */}
                {uploadProgress && (
                  <div>
                    <p style={{ color: '#FF5B00', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                      {uploadProgress}
                    </p>
                    <div style={{ backgroundColor: '#0a0a0a', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ height: '100%', width: '40%', backgroundColor: '#FF5B00', borderRadius: '6px' }}
                      />
                    </div>
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

                <button onClick={handleGuardar} disabled={saving} style={{
                  backgroundColor: saving ? '#2a2a2a' : '#FF5B00',
                  color: saving ? '#f5f5f5' : '#0a0a0a', padding: '0.85rem',
                  borderRadius: '6px', border: 'none', fontWeight: 800,
                  fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}>
                  {saving ? (uploadProgress || 'Guardando...') : editando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}