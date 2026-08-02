'use client'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import {
  collection, addDoc, getDocs, deleteDoc, updateDoc,
  doc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Edit2, X, ShoppingBag,
  Upload, AlertCircle, CheckCircle, Package
} from 'lucide-react'

const inputStyle = {
  width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a',
  borderRadius: '6px', padding: '0.75rem 1rem', color: '#f5f5f5',
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

const categorias = ['Merch', 'Música digital', 'Arte digital', 'Entradas']

const emptyForm = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  categoria: 'Merch',
  variantes: '',
  activo: true,
}

export default function DashboardProductos() {
  const { user, perfil } = useAuth()
  const [productos, setProductos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [editando, setEditando]   = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [fotos, setFotos]         = useState([])
  const [previews, setPreviews]   = useState([])
  const [saving, setSaving]       = useState(false)
  const [feedback, setFeedback]   = useState(null)
  const [filtro, setFiltro]       = useState('Todo')

  const isSuperadmin = perfil?.rol === 'superadmin'
  const isColaborador = perfil?.rol === 'colaborador'
  const canEdit = isSuperadmin || isColaborador

  useEffect(() => { fetchProductos() }, [perfil])

  async function fetchProductos() {
    if (!perfil) return
    setLoading(true)
    try {
      let q
      if (isSuperadmin) {
        q = query(collection(db, 'productos'), orderBy('createdAt', 'desc'))
      } else {
        q = query(
          collection(db, 'productos'),
          where('autorId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
      }
      const snap = await getDocs(q)
      setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setProductos([]) }
    setLoading(false)
  }

  function abrirModal(producto = null) {
    if (producto) {
      setEditando(producto)
      setForm({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || '',
        stock: producto.stock || '',
        categoria: producto.categoria || 'Merch',
        variantes: (producto.variantes || []).join(', '),
        activo: producto.activo !== false,
      })
      setPreviews(producto.fotos || [])
    } else {
      setEditando(null)
      setForm(emptyForm)
      setPreviews([])
    }
    setFotos([])
    setFeedback(null)
    setModal(true)
  }

  function handleFotos(e) {
    const files = Array.from(e.target.files).slice(0, 4)
    setFotos(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleGuardar() {
    if (!form.nombre || !form.precio) {
      setFeedback({ type: 'error', msg: 'Nombre y precio son requeridos' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      let fotosUrls = editando?.fotos || []
      if (fotos.length > 0) {
        const uploads = await Promise.all(
          fotos.map(f => uploadToCloudinary(f, 'image'))
        )
        fotosUrls = uploads.map(r => r.url)
      }
      const data = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock) || 0,
        categoria: form.categoria,
        variantes: form.variantes.split(',').map(s => s.trim()).filter(Boolean),
        fotos: fotosUrls,
        activo: form.activo,
        autorId: user.uid,
        autorNombre: perfil?.nombre || '',
      }
      if (editando) {
        await updateDoc(doc(db, 'productos', editando.id), data)
      } else {
        await addDoc(collection(db, 'productos'), {
          ...data, createdAt: serverTimestamp(), vendidos: 0,
        })
      }
      setFeedback({ type: 'success', msg: editando ? 'Producto actualizado' : 'Producto creado' })
      await fetchProductos()
      setTimeout(() => { setModal(false); setFeedback(null) }, 1000)
    } catch {
      setFeedback({ type: 'error', msg: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return
    await deleteDoc(doc(db, 'productos', id))
    setProductos(prev => prev.filter(p => p.id !== id))
  }

  async function toggleActivo(producto) {
    await updateDoc(doc(db, 'productos', producto.id), { activo: !producto.activo })
    setProductos(prev => prev.map(p => p.id === producto.id ? { ...p, activo: !p.activo } : p))
  }

  const filtrados = filtro === 'Todo' ? productos : productos.filter(p => p.categoria === filtro)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {isSuperadmin ? 'Superadmin' : 'Colaborador'}
          </p>
          <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Productos
          </h1>
        </div>
        {canEdit && (
          <button onClick={() => abrirModal()} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.75rem 1.25rem',
            borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.82rem',
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            <Plus size={16} /> Nuevo producto
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['Todo', ...categorias].map(f => (
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

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
          <ShoppingBag size={40} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sin productos aún</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtrados.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '10px', overflow: 'hidden',
                opacity: p.activo ? 1 : 0.5,
              }}
            >
              {/* Foto */}
              <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: '#111' }}>
                {p.fotos?.length > 0 ? (
                  <img src={p.fotos[0]} alt={p.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={36} color="#2a2a2a" />
                  </div>
                )}
                {/* Badge categoria */}
                <span style={{
                  position: 'absolute', top: '0.5rem', left: '0.5rem',
                  backgroundColor: 'rgba(255,91,0,0.2)', color: '#FF5B00',
                  padding: '0.15rem 0.5rem', borderRadius: '4px',
                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  {p.categoria}
                </span>
                {/* Badge inactivo */}
                {!p.activo && (
                  <span style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    backgroundColor: 'rgba(255,68,68,0.2)', color: '#ff4444',
                    padding: '0.15rem 0.5rem', borderRadius: '4px',
                    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    Inactivo
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {p.nombre}
                </p>
                <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.78rem', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.descripcion || '—'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                  <span style={{ color: '#FF5B00', fontWeight: 900, fontSize: '1.1rem' }}>
                    ${parseFloat(p.precio).toFixed(2)} MXN
                  </span>
                  <span style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.75rem' }}>
                    Stock: {p.stock}
                  </span>
                </div>

                {/* Variantes */}
                {p.variantes?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {p.variantes.map(v => (
                      <span key={v} style={{
                        backgroundColor: '#2a2a2a', color: '#f5f5f5', opacity: 0.7,
                        padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600,
                      }}>
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {(isSuperadmin || p.autorId === user?.uid) && (
                    <>
                      <button onClick={() => abrirModal(p)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px',
                        padding: '0.4rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5,
                        fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#FF5B00'; e.currentTarget.style.color = '#FF5B00' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                        <Edit2 size={13} /> Editar
                      </button>
                      <button onClick={() => toggleActivo(p)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px',
                        padding: '0.4rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5,
                        fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = 0.5 }}>
                        {p.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button onClick={() => handleEliminar(p.id)} style={{
                        background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px',
                        padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5,
                        transition: 'all 0.2s', display: 'flex',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
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
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '520px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button onClick={() => setModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer' }}>
                <X size={18} />
              </button>
              <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                {editando ? 'Editar producto' : 'Nuevo producto'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Fotos */}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed', borderColor: previews.length > 0 ? '#FF5B00' : '#2a2a2a',
                  borderRadius: '10px', cursor: 'pointer', backgroundColor: '#0a0a0a',
                  minHeight: '120px', transition: 'border-color 0.2s', overflow: 'hidden',
                }}>
                  {previews.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', width: '100%' }}>
                      {previews.map((src, i) => (
                        <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
                      <Upload size={26} color="#FF5B00" style={{ opacity: 0.6 }} />
                      <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.82rem', textAlign: 'center' }}>
                        Subir fotos del producto (máx. 4)
                      </p>
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleFotos} style={{ display: 'none' }} />
                </label>

                {/* Nombre */}
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre del producto" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

                {/* Descripción */}
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción del producto"
                  rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'} />

                {/* Precio y stock */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })}
                    placeholder="Precio (MXN)" type="number" min="0" step="0.01" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#FF5B00'}
                    onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                  <input value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="Stock disponible" type="number" min="0" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#FF5B00'}
                    onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                </div>

                {/* Categoría */}
                <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}>
                  {categorias.map(c => (
                    <option key={c} value={c} style={{ backgroundColor: '#1a1a1a' }}>{c}</option>
                  ))}
                </select>

                {/* Variantes */}
                <div>
                  <input value={form.variantes} onChange={e => setForm({ ...form, variantes: e.target.value })}
                    placeholder="Variantes separadas por coma (ej: S, M, L, XL)" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#FF5B00'}
                    onBlur={e => e.target.style.borderColor = '#2a2a2a'} />
                  <p style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.72rem', marginTop: '0.3rem' }}>
                    Tallas, colores, formatos — lo que aplique al producto
                  </p>
                </div>

                {/* Activo toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0a0a0a', borderRadius: '6px', padding: '0.75rem 1rem', border: '1px solid #2a2a2a' }}>
                  <span style={{ color: '#f5f5f5', opacity: 0.7, fontSize: '0.85rem', fontWeight: 600 }}>
                    Producto activo (visible en tienda)
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, activo: !form.activo })}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                      backgroundColor: form.activo ? '#FF5B00' : '#2a2a2a',
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.2s', flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: form.activo ? '23px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      backgroundColor: '#f5f5f5', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {saving && (
                  <div style={{ backgroundColor: '#0a0a0a', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                    <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ height: '100%', width: '40%', backgroundColor: '#FF5B00', borderRadius: '6px' }} />
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
                  {saving ? 'Guardando...' : editando ? 'Actualizar producto' : 'Crear producto'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}