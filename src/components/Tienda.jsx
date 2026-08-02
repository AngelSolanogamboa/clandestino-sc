'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { useCart } from '@/context/CartContext'

const categorias = ['Todo', 'Merch', 'Música digital', 'Arte digital', 'Entradas']

function ProductoCard({ producto, index, onClick }) {
  const { agregar } = useCart()
  const [hover, setHover] = useState(false)
  const sinStock = producto.stock === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: '10px', overflow: 'hidden',
        opacity: sinStock ? 0.6 : 1,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => { setHover(true); e.currentTarget.style.borderColor = '#FF5B00' }}
      onMouseLeave={e => { setHover(false); e.currentTarget.style.borderColor = '#2a2a2a' }}
    >
      {/* Foto */}
      <div
        onClick={() => onClick(producto)}
        style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#111', cursor: 'pointer', overflow: 'hidden' }}
      >
        {producto.fotos?.length > 0 ? (
          <img
            src={hover && producto.fotos[1] ? producto.fotos[1] : producto.fotos[0]}
            alt={producto.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={40} color="#2a2a2a" />
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{
            backgroundColor: 'rgba(255,91,0,0.2)', color: '#FF5B00',
            padding: '0.15rem 0.5rem', borderRadius: '4px',
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {producto.categoria}
          </span>
          {sinStock && (
            <span style={{
              backgroundColor: 'rgba(255,68,68,0.2)', color: '#ff4444',
              padding: '0.15rem 0.5rem', borderRadius: '4px',
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Agotado
            </span>
          )}
          {!sinStock && producto.stock <= 5 && (
            <span style={{
              backgroundColor: 'rgba(250,204,21,0.2)', color: '#facc15',
              padding: '0.15rem 0.5rem', borderRadius: '4px',
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Últimos {producto.stock}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '1rem' }}>
        <p style={{
          color: '#f5f5f5', fontWeight: 700, fontSize: '0.9rem',
          textTransform: 'uppercase', letterSpacing: '0.03em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {producto.nombre}
        </p>
        {producto.autorNombre && (
          <p style={{ color: '#FF5B00', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.15rem', letterSpacing: '0.05em' }}>
            {producto.autorNombre}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
          <span style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem' }}>
            ${parseFloat(producto.precio).toFixed(2)}
            <span style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.72rem', fontWeight: 400, marginLeft: '0.3rem' }}>MXN</span>
          </span>
        </div>

        <button
          onClick={() => !sinStock && agregar(producto)}
          disabled={sinStock}
          style={{
            marginTop: '0.75rem', width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            backgroundColor: sinStock ? '#2a2a2a' : '#FF5B00',
            color: sinStock ? '#f5f5f5' : '#0a0a0a',
            padding: '0.65rem', borderRadius: '6px', border: 'none',
            fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: sinStock ? 'not-allowed' : 'pointer',
            opacity: sinStock ? 0.5 : 1, transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { if (!sinStock) e.currentTarget.style.opacity = 0.85 }}
          onMouseLeave={e => { if (!sinStock) e.currentTarget.style.opacity = 1 }}
        >
          <ShoppingBag size={14} />
          {sinStock ? 'Agotado' : 'Agregar al carrito'}
        </button>
      </div>
    </motion.div>
  )
}

function ProductoModal({ producto, onClose }) {
  const { agregar } = useCart()
  const [fotoIdx, setFotoIdx] = useState(0)
  const [variante, setVariante] = useState(null)
  const [agregado, setAgregado] = useState(false)
  const sinStock = producto.stock === 0

  const handleAgregar = () => {
    if (producto.variantes?.length > 0 && !variante) return
    agregar(producto, variante)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: '16px', overflow: 'hidden', maxWidth: '800px',
          width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
        }}
      >
        {/* Galería */}
        <div style={{ position: 'relative', backgroundColor: '#111', minHeight: '300px' }}>
          {producto.fotos?.length > 0 ? (
            <>
              <img src={producto.fotos[fotoIdx]} alt={producto.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '300px' }} />
              {producto.fotos.length > 1 && (
                <>
                  <button onClick={() => setFotoIdx(i => (i - 1 + producto.fotos.length) % producto.fotos.length)}
                    style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setFotoIdx(i => (i + 1) % producto.fotos.length)}
                    style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={16} />
                  </button>
                  {/* Thumbnails */}
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                    {producto.fotos.map((_, i) => (
                      <button key={i} onClick={() => setFotoIdx(i)} style={{
                        width: '8px', height: '8px', borderRadius: '50%', border: 'none',
                        backgroundColor: i === fotoIdx ? '#FF5B00' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer', padding: 0,
                      }} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <Package size={60} color="#2a2a2a" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <span style={{
              backgroundColor: 'rgba(255,91,0,0.15)', color: '#FF5B00',
              padding: '0.2rem 0.6rem', borderRadius: '4px',
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {producto.categoria}
            </span>
            <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: '0.5rem', lineHeight: 1.2 }}>
              {producto.nombre}
            </h2>
            {producto.autorNombre && (
              <p style={{ color: '#FF5B00', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.25rem' }}>
                por {producto.autorNombre}
              </p>
            )}
          </div>

          {producto.descripcion && (
            <p style={{ color: '#f5f5f5', opacity: 0.6, fontSize: '0.88rem', lineHeight: 1.7 }}>
              {producto.descripcion}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.6rem' }}>
              ${parseFloat(producto.precio).toFixed(2)}
              <span style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.8rem', fontWeight: 400, marginLeft: '0.3rem' }}>MXN</span>
            </span>
            <span style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.78rem' }}>
              {sinStock ? 'Agotado' : `${producto.stock} disponibles`}
            </span>
          </div>

          {/* Variantes */}
          {producto.variantes?.length > 0 && (
            <div>
              <p style={{ color: '#f5f5f5', opacity: 0.5, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Variante
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {producto.variantes.map(v => (
                  <button key={v} onClick={() => setVariante(v)} style={{
                    padding: '0.4rem 0.9rem', borderRadius: '4px', border: '1px solid',
                    borderColor: variante === v ? '#FF5B00' : '#2a2a2a',
                    backgroundColor: variante === v ? 'rgba(255,91,0,0.1)' : 'transparent',
                    color: variante === v ? '#FF5B00' : '#f5f5f5',
                    fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    {v}
                  </button>
                ))}
              </div>
              {producto.variantes?.length > 0 && !variante && (
                <p style={{ color: '#facc15', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                  Selecciona una variante
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleAgregar}
            disabled={sinStock || (producto.variantes?.length > 0 && !variante)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              backgroundColor: agregado ? '#4ade80' : sinStock ? '#2a2a2a' : '#FF5B00',
              color: '#0a0a0a', padding: '1rem', borderRadius: '8px', border: 'none',
              fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: sinStock ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
              opacity: (sinStock || (producto.variantes?.length > 0 && !variante)) ? 0.5 : 1,
            }}
          >
            <ShoppingBag size={18} />
            {agregado ? '¡Agregado!' : sinStock ? 'Agotado' : 'Agregar al carrito'}
          </button>
        </div>

        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(10,10,10,0.8)', border: '1px solid #2a2a2a',
          borderRadius: '50%', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#f5f5f5',
        }}>
          <X size={16} />
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function Tienda() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filtro, setFiltro]       = useState('Todo')
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    async function fetchProductos() {
      try {
        const q = query(
          collection(db, 'productos'),
          where('activo', '==', true),
        //   orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch { setProductos([]) }
      setLoading(false)
    }
    fetchProductos()
  }, [])

  const filtrados = filtro === 'Todo' ? productos : productos.filter(p => p.categoria === filtro)

  return (
    <section id="merch" style={{ backgroundColor: '#0a0a0a', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Tienda oficial
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase', color: '#f5f5f5', letterSpacing: '0.05em' }}>
            Merch & Más
          </h2>
        </motion.div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {categorias.map(cat => (
            <button key={cat} onClick={() => setFiltro(cat)} style={{
              padding: '0.5rem 1.25rem', borderRadius: '4px', border: '1px solid',
              borderColor: filtro === cat ? '#FF5B00' : '#2a2a2a',
              backgroundColor: filtro === cat ? '#FF5B00' : 'transparent',
              color: filtro === cat ? '#0a0a0a' : '#f5f5f5',
              fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Próximamente
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {filtrados.map((p, i) => (
              <ProductoCard key={p.id} producto={p} index={i} onClick={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* Modal detalle */}
      <AnimatePresence>
        {selected && <ProductoModal producto={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  )
}