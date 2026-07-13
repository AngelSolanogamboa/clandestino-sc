'use client'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

import { db } from '@/lib/firebase'
import { collection, getCountFromServer } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { Image as ImageIcon, CalendarDays, Users, MessageSquare } from 'lucide-react'

function StatCard({ label, value, icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '10px',
        backgroundColor: color + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '1.8rem', lineHeight: 1.2 }}>
          {value ?? '—'}
        </p>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { perfil } = useAuth()
  const [stats, setStats] = useState({})

  useEffect(() => {
    async function fetchStats() {
      const cols = ['portafolio', 'eventos', 'users', 'mensajes']
      const results = {}
      for (const col of cols) {
        try {
          const snap = await getCountFromServer(collection(db, col))
          results[col] = snap.data().count
        } catch { results[col] = 0 }
      }
      setStats(results)
    }
    fetchStats()
  }, [])

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {saludo}
        </p>
        <h1 style={{ color: '#f5f5f5', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
          {perfil?.nombre || 'Bienvenido'}
        </h1>
        <p style={{ color: '#f5f5f5', opacity: 0.35, fontSize: '0.85rem', marginTop: '0.4rem' }}>
          Panel de control — Clandestino S.C.
        </p>
      </motion.div>

      {/* Stats solo para superadmin */}
      {perfil?.rol === 'superadmin' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          <StatCard label="Portafolio"  value={stats.portafolio} icon={<ImageIcon size={22} />}      color="#FF5B00" delay={0.1} />
          <StatCard label="Eventos"     value={stats.eventos}    icon={<CalendarDays size={22} />}   color="#a78bfa" delay={0.2} />
          <StatCard label="Miembros"    value={stats.users}      icon={<Users size={22} />}          color="#2dd4bf" delay={0.3} />
          <StatCard label="Mensajes"    value={stats.mensajes}   icon={<MessageSquare size={22} />}  color="#facc15" delay={0.4} />
        </div>
      )}

      {/* Accesos rápidos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p style={{ color: '#f5f5f5', opacity: 0.3, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Accesos rápidos
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Ver sitio',       href: '/',                     color: '#FF5B00' },
            { label: '+ Portafolio',    href: '/dashboard/portafolio', color: '#a78bfa' },
            { label: '+ Evento',        href: '/dashboard/eventos',    color: '#2dd4bf' },
          ].map(btn => (
            <a
              key={btn.href}
              href={btn.href}
              style={{
                backgroundColor: btn.color + '15',
                border: `1px solid ${btn.color}40`,
                color: btn.color,
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = btn.color + '25'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = btn.color + '15'}
            >
              {btn.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}