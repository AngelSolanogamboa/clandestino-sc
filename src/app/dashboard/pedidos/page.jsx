'use client'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  collection, getDocs, updateDoc, doc,
  query, where, orderBy
} from 'firebase/firestore'
import { motion } from 'framer-motion'
import { ShoppingBag, Package, CheckCircle, Clock, XCircle } from 'lucide-react'

const estados = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']

const estadoConfig = {
  pendiente:   { color: '#facc15', icon: <Clock size={14} /> },
  procesando:  { color: '#60a5fa', icon: <Package size={14} /> },
  enviado:     { color: '#a78bfa', icon: <Package size={14} /> },
  entregado:   { color: '#4ade80', icon: <CheckCircle size={14} /> },
  cancelado:   { color: '#ff4444', icon: <XCircle size={14} /> },
}

export default function DashboardPedidos() {
  const { user, perfil } = useAuth()
  const [pedidos, setPedidos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('todos')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)

  const isSuperadmin = perfil?.rol === 'superadmin'

  useEffect(() => { fetchPedidos() }, [perfil])

  async function fetchPedidos() {
    if (!perfil) return
    setLoading(true)
    try {
      let q
      if (isSuperadmin) {
        q = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'))
      } else {
        q = query(collection(db, 'pedidos'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'))
      }
      const snap = await getDocs(q)
      setPedidos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch { setPedidos([]) }
    setLoading(false)
  }

  async function handleEstado(pedidoId, nuevoEstado) {
    setUpdating(true)
    await updateDoc(doc(db, 'pedidos', pedidoId), { estado: nuevoEstado })
    setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
    if (selected?.id === pedidoId) setSelected(prev => ({ ...prev, estado: nuevoEstado }))
    setUpdating(false)
  }

  const filtrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {isSuperadmin ? 'Superadmin' : 'Mis pedidos'}
        </p>
        <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pedidos
        </h1>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['todos', ...estados].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '0.35rem 0.85rem', borderRadius: '4px', border: '1px solid',
            borderColor: filtro === f ? '#FF5B00' : '#2a2a2a',
            backgroundColor: filtro === f ? '#FF5B00' : 'transparent',
            color: filtro === f ? '#0a0a0a' : '#f5f5f5',
            fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {f}
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
              <ShoppingBag size={40} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sin pedidos</p>
            </div>
          ) : (
            filtrados.map((pedido, i) => {
              const cfg = estadoConfig[pedido.estado] || estadoConfig.pendiente
              return (
                <motion.div
                  key={pedido.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(pedido)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    backgroundColor: selected?.id === pedido.id ? '#1f1f1f' : '#1a1a1a',
                    border: '1px solid', borderColor: selected?.id === pedido.id ? '#FF5B00' : '#2a2a2a',
                    borderRadius: '10px', padding: '0.9rem 1.1rem', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    backgroundColor: cfg.color + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cfg.color,
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{pedido.id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.75rem' }}>
                      {pedido.email || pedido.userId} · {pedido.productos?.length || 0} producto(s)
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: cfg.color + '20', color: cfg.color,
                    padding: '0.2rem 0.6rem', borderRadius: '4px',
                    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {pedido.estado}
                  </span>
                </motion.div>
              )
            })
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                #{selected.id.slice(-8).toUpperCase()}
              </p>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.3, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Info */}
              {[
                { label: 'Cliente', value: selected.nombre },
                { label: 'Email', value: selected.email },
                { label: 'Dirección', value: selected.direccion },
              ].filter(f => f.value).map(f => (
                <div key={f.label}>
                  <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{f.label}</p>
                  <p style={{ color: '#f5f5f5', fontSize: '0.85rem' }}>{f.value}</p>
                </div>
              ))}

              {/* Productos */}
              {selected.productos?.length > 0 && (
                <div>
                  <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Productos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selected.productos.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#f5f5f5', fontSize: '0.85rem', opacity: 0.7 }}>
                        <span>{p.nombre} x{p.cantidad}</span>
                        <span>${p.precio} MXN</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {selected.total && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '0.75rem' }}>
                  <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.88rem' }}>Total</p>
                  <p style={{ color: '#FF5B00', fontWeight: 900, fontSize: '0.95rem' }}>${selected.total} MXN</p>
                </div>
              )}

              {/* Cambiar estado (solo superadmin) */}
              {isSuperadmin && (
                <div>
                  <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Cambiar estado
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {estados.map(e => {
                      const cfg = estadoConfig[e]
                      return (
                        <button
                          key={e}
                          onClick={() => handleEstado(selected.id, e)}
                          disabled={updating || selected.estado === e}
                          style={{
                            padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid',
                            borderColor: selected.estado === e ? cfg.color : '#2a2a2a',
                            backgroundColor: selected.estado === e ? cfg.color + '20' : 'transparent',
                            color: selected.estado === e ? cfg.color : '#f5f5f5',
                            fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.08em',
                            textTransform: 'uppercase', cursor: updating || selected.estado === e ? 'default' : 'pointer',
                            opacity: updating ? 0.5 : 1, transition: 'all 0.2s',
                          }}
                        >
                          {e}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}