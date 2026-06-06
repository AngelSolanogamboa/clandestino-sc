'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section id="inicio" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#0a0a0a',
      paddingTop: '70px',
    }}>

      {/* Fondo con gradiente naranja */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,91,0,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid decorativo de fondo */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,91,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,91,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Contenido */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '2rem',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo grande */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Image
            src="/logo.png"
            alt="Clandestino S.C."
            width={220}
            height={220}
            priority
            style={{
              borderRadius: '24px',
              boxShadow: '0 0 80px rgba(255,91,0,0.3)',
            }}
          />
        </motion.div>

        {/* Nombre */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            fontWeight: 900,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1,
            color: '#f5f5f5',
          }}>
            CLANDESTINO
          </h1>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#FF5B00',
            lineHeight: 1,
          }}>
            S.C.
          </h2>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            color: '#f5f5f5',
            opacity: 0.5,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            maxWidth: '500px',
          }}
        >
          Colectivo de música y arte urbano
        </motion.p>

        {/* Botones CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <a href="#portafolio" style={{
            backgroundColor: '#FF5B00',
            color: '#0a0a0a',
            padding: '0.85rem 2rem',
            borderRadius: '4px',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(255,91,0,0.4)' }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}
          >
            Ver portafolio
          </a>
          <a href="#contacto" style={{
            backgroundColor: 'transparent',
            color: '#f5f5f5',
            padding: '0.85rem 2rem',
            borderRadius: '4px',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            border: '1px solid #2a2a2a',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#FF5B00'; e.target.style.color = '#FF5B00' }}
          onMouseLeave={e => { e.target.style.borderColor = '#2a2a2a'; e.target.style.color = '#f5f5f5' }}
          >
            Contrataciones
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{ marginTop: '2rem' }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '24px',
              height: '40px',
              border: '2px solid rgba(255,91,0,0.4)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '6px',
              margin: '0 auto',
            }}
          >
            <div style={{
              width: '4px',
              height: '8px',
              backgroundColor: '#FF5B00',
              borderRadius: '2px',
              opacity: 0.8,
            }} />
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}