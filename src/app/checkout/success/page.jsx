'use client'
import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { motion } from 'framer-motion'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const { limpiar } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Solo limpiar el carrito — el webhook ya guardó el pedido
    limpiar()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: '20px', padding: '3rem', maxWidth: '480px',
          width: '100%', textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
        >
          <CheckCircle size={72} color="#4ade80" style={{ margin: '0 auto 1.5rem' }} />
        </motion.div>

        <h1 style={{
          color: '#f5f5f5', fontWeight: 900, fontSize: '1.8rem',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem',
        }}>
          ¡Pedido confirmado!
        </h1>

        <p style={{ color: '#f5f5f5', opacity: 0.5, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Gracias por tu compra. Recibirás un correo con los detalles. Si tienes dudas contáctanos por Instagram.
        </p>

        {sessionId && (
          <div style={{
            backgroundColor: '#0a0a0a', borderRadius: '8px', padding: '0.75rem',
            marginBottom: '2rem', border: '1px solid #2a2a2a',
          }}>
            <p style={{ color: '#f5f5f5', opacity: 0.25, fontSize: '0.68rem', marginBottom: '0.2rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Número de pedido
            </p>
            <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace' }}>
              {sessionId.slice(-16).toUpperCase()}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard/pedidos" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.85rem 1.5rem',
            borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Ver mis pedidos
          </Link>
          <Link href="/#merch" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'transparent', color: '#f5f5f5',
            border: '1px solid #2a2a2a', padding: '0.85rem 1.5rem',
            borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            <ShoppingBag size={16} /> Seguir comprando
          </Link>
        </div>
      </motion.div>
    </div>
  )
}