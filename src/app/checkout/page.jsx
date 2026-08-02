'use client'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { ShoppingBag, Lock, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CheckoutPage() {
  const { carrito, quitar, actualizar, total, totalItems } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePagar = async () => {
    if (carrito.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: carrito,
          email: user?.email || null,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      setError('Error al procesar el pago. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <Link href="/#merch" style={{ color: '#f5f5f5', opacity: 0.5, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            <ArrowLeft size={16} /> Seguir comprando
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          {/* Lista de productos */}
          <div>
            <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
              Tu pedido
              <span style={{ color: '#FF5B00', fontSize: '1rem', marginLeft: '0.75rem', fontWeight: 700 }}>
                ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
              </span>
            </h1>

            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#f5f5f5', opacity: 0.2 }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Tu carrito está vacío
                </p>
                <Link href="/#merch" style={{ color: '#FF5B00', fontSize: '0.85rem', marginTop: '1rem', display: 'inline-block' }}>
                  Ver tienda
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {carrito.map(item => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', gap: '1rem', alignItems: 'center',
                      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                      borderRadius: '10px', padding: '1rem',
                    }}
                  >
                    {/* Foto */}
                    <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0a0a0a', flexShrink: 0 }}>
                      {item.foto ? (
                        <img src={item.foto} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#2a2a2a' }} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nombre}
                      </p>
                      {item.variante && (
                        <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.75rem', marginTop: '0.15rem' }}>
                          {item.variante}
                        </p>
                      )}
                      <p style={{ color: '#FF5B00', fontWeight: 800, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        ${(item.precio * item.cantidad).toFixed(2)} MXN
                      </p>
                    </div>

                    {/* Controles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => actualizar(item.key, item.cantidad - 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2a2a2a', border: 'none', color: '#f5f5f5', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        −
                      </button>
                      <span style={{ color: '#f5f5f5', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                        {item.cantidad}
                      </span>
                      <button onClick={() => actualizar(item.key, item.cantidad + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2a2a2a', border: 'none', color: '#f5f5f5', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        +
                      </button>
                      <button onClick={() => quitar(item.key)} style={{ background: 'none', border: 'none', color: '#f5f5f5', opacity: 0.3, cursor: 'pointer', marginLeft: '0.25rem', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ff4444' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = 0.3; e.currentTarget.style.color = '#f5f5f5' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '1.5rem' }}>
              <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                Resumen
              </h2>

              {/* Líneas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {carrito.map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#f5f5f5', opacity: 0.6, fontSize: '0.82rem', flex: 1, marginRight: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.nombre} {item.variante && `(${item.variante})`} ×{item.cantidad}
                    </span>
                    <span style={{ color: '#f5f5f5', fontWeight: 600, fontSize: '0.82rem', flexShrink: 0 }}>
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total
                  </span>
                  <span style={{ color: '#FF5B00', fontWeight: 900, fontSize: '1.4rem' }}>
                    ${total.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              {error && (
                <div style={{ backgroundColor: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', color: '#ff4444', fontSize: '0.8rem' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handlePagar}
                disabled={loading || carrito.length === 0}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  backgroundColor: loading || carrito.length === 0 ? '#2a2a2a' : '#FF5B00',
                  color: loading || carrito.length === 0 ? '#f5f5f5' : '#0a0a0a',
                  padding: '1rem', borderRadius: '8px', border: 'none',
                  fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: loading || carrito.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  'Procesando...'
                ) : (
                  <><Lock size={16} /> Pagar con Stripe</>
                )}
              </button>

              {/* Métodos de pago */}
              <div style={{ marginTop: '1rem' }}>
                <p style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.68rem', textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Métodos aceptados
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Visa', 'Mastercard', 'AMEX', 'OXXO', 'PayPal'].map(m => (
                    <span key={m} style={{
                      backgroundColor: '#2a2a2a', color: '#f5f5f5', opacity: 0.5,
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
                    }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
                <Lock size={12} color="#f5f5f5" style={{ opacity: 0.25 }} />
                <p style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.68rem' }}>
                  Pago 100% seguro con cifrado SSL
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}