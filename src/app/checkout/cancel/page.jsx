'use client'
import { motion } from 'framer-motion'
import { XCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CancelPage() {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
          borderRadius: '20px', padding: '3rem', maxWidth: '480px',
          width: '100%', textAlign: 'center',
        }}
      >
        <XCircle size={72} color="#ff4444" style={{ margin: '0 auto 1.5rem' }} />
        <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Pago cancelado
        </h1>
        <p style={{ color: '#f5f5f5', opacity: 0.5, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          No se realizó ningún cargo. Tu carrito sigue intacto, puedes intentarlo de nuevo cuando quieras.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/checkout" style={{
            backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.85rem 1.5rem',
            borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Intentar de nuevo
          </Link>
          <Link href="/#merch" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'transparent', color: '#f5f5f5',
            border: '1px solid #2a2a2a', padding: '0.85rem 1.5rem',
            borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
          }}>
            <ShoppingBag size={16} /> Ver tienda
          </Link>
        </div>
      </motion.div>
    </div>
  )
}