'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

export default function Carrito() {
  const { carrito, cartOpen, setCartOpen, quitar, actualizar, total, totalItems } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    setCartOpen(false)
    router.push('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 300,
            }}
          />
        )}
      </AnimatePresence>

      {/* Panel lateral */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '420px',
              backgroundColor: '#111', borderLeft: '1px solid #2a2a2a',
              zIndex: 301, display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.5rem', borderBottom: '1px solid #2a2a2a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShoppingBag size={20} color="#FF5B00" />
                <h2 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Carrito
                </h2>
                {totalItems > 0 && (
                  <span style={{
                    backgroundColor: '#FF5B00', color: '#0a0a0a',
                    borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 900,
                  }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} style={{
                background: 'none', border: 'none', color: '#f5f5f5',
                opacity: 0.5, cursor: 'pointer', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {carrito.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#f5f5f5', opacity: 0.2 }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
                    Tu carrito está vacío
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <AnimatePresence>
                    {carrito.map(item => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        style={{
                          display: 'flex', gap: '0.75rem', alignItems: 'center',
                          backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
                          borderRadius: '8px', padding: '0.75rem',
                        }}
                      >
                        {/* Foto */}
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '6px',
                          overflow: 'hidden', backgroundColor: '#0a0a0a', flexShrink: 0,
                        }}>
                          {item.foto ? (
                            <img src={item.foto} alt={item.nombre}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#2a2a2a' }} />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.nombre}
                          </p>
                          {item.variante && (
                            <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.72rem', marginTop: '0.1rem' }}>
                              {item.variante}
                            </p>
                          )}
                          <p style={{ color: '#FF5B00', fontWeight: 800, fontSize: '0.85rem', marginTop: '0.2rem' }}>
                            ${(item.precio * item.cantidad).toFixed(2)}
                          </p>
                        </div>

                        {/* Controles cantidad */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <button onClick={() => actualizar(item.key, item.cantidad - 1)} style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            backgroundColor: '#2a2a2a', border: 'none', color: '#f5f5f5',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FF5B00'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}>
                            <Minus size={12} />
                          </button>
                          <span style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.85rem', minWidth: '20px', textAlign: 'center' }}>
                            {item.cantidad}
                          </span>
                          <button onClick={() => actualizar(item.key, item.cantidad + 1)} style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            backgroundColor: '#2a2a2a', border: 'none', color: '#f5f5f5',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FF5B00'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}>
                            <Plus size={12} />
                          </button>
                          <button onClick={() => quitar(item.key)} style={{
                            background: 'none', border: 'none', color: '#f5f5f5',
                            opacity: 0.3, cursor: 'pointer', padding: '0.2rem',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#ff4444' }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = 0.3; e.currentTarget.style.color = '#f5f5f5' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer con total y checkout */}
            {carrito.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: '1px solid #2a2a2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: '#f5f5f5', opacity: 0.6, fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Total
                  </span>
                  <span style={{ color: '#FF5B00', fontWeight: 900, fontSize: '1.3rem' }}>
                    ${total.toFixed(2)} MXN
                  </span>
                </div>
                <button onClick={handleCheckout} style={{
                  width: '100%', backgroundColor: '#FF5B00', color: '#0a0a0a',
                  padding: '1rem', borderRadius: '8px', border: 'none',
                  fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.1em',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}>
                  Proceder al pago
                </button>
                <p style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.72rem', textAlign: 'center', marginTop: '0.75rem' }}>
                  Pago seguro con Stripe · OXXO · PayPal
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}