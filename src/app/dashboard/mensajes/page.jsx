'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Trash2, Mail, Users, MessageSquare } from 'lucide-react'

export default function DashboardMensajes() {
  const { perfil } = useAuth()
  const router = useRouter()
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('todos')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (perfil && perfil.rol !== 'superadmin') router.push('/dashboard')
  }, [perfil])

  useEffect(() => { fetchMensajes() }, [])

  async function fetchMensajes() {
    setLoading(true)
    try {
      const q = query(collection(db, 'mensajes'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setMensajes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setMensajes([]) }
    setLoading(false)
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este mensaje?')) return
    await deleteDoc(doc(db, 'mensajes', id))
    setMensajes(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const filtrados = filtro === 'todos' ? mensajes : mensajes.filter(m => m.tipo === filtro)

  const tipoIcon = { contratacion: <Mail size={16} />, colaboracion: <Users size={16} /> }
  const tipoColor = { contratacion: '#FF5B00', colaboracion: '#a78bfa' }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Superadmin</p>
        <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Mensajes
        </h1>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'contratacion', label: 'Contrataciones' },
          { key: 'colaboracion', label: 'Colaboraciones' },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{
            padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid',
            borderColor: filtro === f.key ? '#FF5B00' : '#2a2a2a',
            backgroundColor: filtro === f.key ? '#FF5B00' : 'transparent',
            color: filtro === f.key ? '#0a0a0a' : '#f5f5f5',
            fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>
        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {loading ? (
            <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
              <MessageSquare size={40} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sin mensajes</p>
            </div>
          ) : (
            filtrados.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(msg)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  backgroundColor: selected?.id === msg.id ? '#1f1f1f' : '#1a1a1a',
                  border: '1px solid', borderColor: selected?.id === msg.id ? '#FF5B00' : '#2a2a2a',
                  borderRadius: '10px', padding: '0.9rem 1.1rem', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                  backgroundColor: (tipoColor[msg.tipo] || '#444') + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: tipoColor[msg.tipo] || '#f5f5f5',
                }}>
                  {tipoIcon[msg.tipo] || <MessageSquare size={16} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.nombre || msg.email}
                  </p>
                  <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.75rem' }}>
                    {msg.email} · {msg.tipoEvento || msg.tipo}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleEliminar(msg.id) }}
                  style={{ background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.3, cursor: 'pointer', padding: '0.25rem', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ff4444' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = 0.3; e.currentTarget.style.color = '#f5f5f5' }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Detalle */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
              borderRadius: '12px', padding: '1.5rem', alignSelf: 'start',
              position: 'sticky', top: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  backgroundColor: (tipoColor[selected.tipo] || '#444') + '20',
                  color: tipoColor[selected.tipo] || '#f5f5f5',
                  padding: '0.2rem 0.6rem', borderRadius: '4px',
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {selected.tipo}
                </span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.3, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Nombre', value: selected.nombre },
                { label: 'Email', value: selected.email },
                { label: 'Teléfono', value: selected.telefono },
                { label: 'Tipo de evento', value: selected.tipoEvento },
                { label: 'Fecha', value: selected.fecha },
                { label: 'Tipo colaboración', value: selected.tipo },
                { label: 'Links', value: selected.links },
              ].filter(f => f.value).map(field => (
                <div key={field.label}>
                  <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    {field.label}
                  </p>
                  <p style={{ color: '#f5f5f5', fontSize: '0.88rem' }}>{field.value}</p>
                </div>
              ))}

              {(selected.mensaje || selected.idea) && (
                <div>
                  <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Mensaje
                  </p>
                  <p style={{ color: '#f5f5f5', fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.8 }}>
                    {selected.mensaje || selected.idea}
                  </p>
                </div>
              )}

                <a
                href={`mailto:${selected.email}`}
                style={{
                  marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.75rem',
                  borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
                }}
              >
                <Mail size={15} /> Responder por email
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}