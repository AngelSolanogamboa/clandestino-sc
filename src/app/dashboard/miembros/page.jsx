'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { auth } from '@/lib/firebase'
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Trash2, Edit2, X, AlertCircle, CheckCircle } from 'lucide-react'

const roles = ['colaborador', 'superadmin']

const inputStyle = {
  width: '100%', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a',
  borderRadius: '6px', padding: '0.75rem 1rem', color: '#f5f5f5',
  fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

export default function MiembrosPage() {
  const { perfil } = useAuth()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'colaborador' })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (perfil && perfil.rol !== 'superadmin') router.push('/dashboard')
  }, [perfil])

  useEffect(() => { fetchUsuarios() }, [])

  async function fetchUsuarios() {
    setLoading(true)
    const snap = await getDocs(collection(db, 'users'))
    setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  function abrirModal(usuario = null) {
    if (usuario) {
      setEditando(usuario)
      setForm({ nombre: usuario.nombre, email: usuario.email, password: '', rol: usuario.rol })
    } else {
      setEditando(null)
      setForm({ nombre: '', email: '', password: '', rol: 'colaborador' })
    }
    setModal(true)
    setFeedback(null)
  }

  async function handleGuardar() {
    if (!form.nombre || !form.email)  {
      setFeedback({ type: 'error', msg: 'Nombre y Correo electrónico son requeridos' })
      return
    }
    setSaving(true)
    setFeedback(null)
    const data ={
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          bio: '',
          avatar: '',
          tags: [],
          redes: {
            instagram: '',
            youtube: '',
            soundcloud: '',
          },
          createdAt: serverTimestamp(),
        }
    try {
      if (editando) {
        await updateDoc(doc(db, 'users', editando.id), data)
        setFeedback({ type: 'success', msg: 'Usuario actualizado' })
      } else {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
        await setDoc(doc(db, 'users', cred.user.uid), data)
        setFeedback({ type: 'success', msg: 'Usuario creado correctamente' })
      }
      await fetchUsuarios()
      setTimeout(() => { setModal(false); setFeedback(null) }, 1200)
    } catch (err) {
      console.error("ERROR FIREBASE:", err)

      const msgs = {
        'auth/email-already-in-use': 'Ese email ya está registrado',
        'auth/weak-password': 'La contraseña debe tener mínimo 6 caracteres',
        'permission-denied': 'No tienes permisos para escribir en Firestore',
      }

      setFeedback({
        type: 'error',
        msg: msgs[err.code] || err.message
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return
    await deleteDoc(doc(db, 'users', id))
    setUsuarios(prev => prev.filter(u => u.id !== id))
  }

  const rolColor = { superadmin: '#FF5B00', colaborador: '#a78bfa', usuario: '#2dd4bf' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Superadmin</p>
          <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Miembros</h1>
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
          <UserPlus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {usuarios.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                borderRadius: '10px', padding: '1rem 1.25rem', flexWrap: 'wrap',
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                backgroundColor: (rolColor[u.rol] || '#444') + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: rolColor[u.rol] || '#f5f5f5', fontWeight: 900, fontSize: '1rem', flexShrink: 0,
              }}>
                {(u.nombre || u.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.nombre || '—'}
                </p>
                <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.78rem' }}>{u.email}</p>
              </div>
              <span style={{
                backgroundColor: (rolColor[u.rol] || '#444') + '20',
                color: rolColor[u.rol] || '#f5f5f5',
                padding: '0.2rem 0.6rem', borderRadius: '4px',
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {u.rol}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => abrirModal(u)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#FF5B00'; e.currentTarget.style.color = '#FF5B00' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                  <Edit2 size={14} />
                </button>
                {u.rol !== 'superadmin' && (
                  <button onClick={() => handleEliminar(u.id)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', color: '#f5f5f5', opacity: 0.5, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}>
                    <Trash2 size={14} />
                  </button>
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
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '2rem', width: '100%', maxWidth: '440px', position: 'relative' }}
            >
              <button onClick={() => setModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.4, cursor: 'pointer' }}>
                <X size={18} />
              </button>
              <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                {editando ? 'Editar usuario' : 'Nuevo usuario'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre completo"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                />
                {!editando && (
                  <>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="Email"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#FF5B00'}
                      onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                    />
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Contraseña (mín. 6 caracteres)"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#FF5B00'}
                      onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                    />
                  </>
                )}
                <select
                  value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => e.target.style.borderColor = '#FF5B00'}
                  onBlur={e => e.target.style.borderColor = '#2a2a2a'}
                >
                  {roles.map(r => (
                    <option key={r} value={r} style={{ backgroundColor: '#1a1a1a' }}>{r}</option>
                  ))}
                </select>

                {feedback && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: feedback.type === 'success' ? '#4ade80' : '#ff4444',
                    backgroundColor: feedback.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(255,68,68,0.1)',
                    border: `1px solid ${feedback.type === 'success' ? 'rgba(74,222,128,0.2)' : 'rgba(255,68,68,0.2)'}`,
                    borderRadius: '6px', padding: '0.75rem', fontSize: '0.82rem',
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
                    color: saving ? '#f5f5f5' : '#0a0a0a',
                    padding: '0.85rem', borderRadius: '6px', border: 'none',
                    fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear usuario'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}