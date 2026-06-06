'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'

const categorias = ['Todo', 'Fotos', 'Flyers', 'Videos']

const items = [
  { id: 1, tipo: 'Fotos',  titulo: 'Live set 01',     src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Foto+1' },
  { id: 2, tipo: 'Fotos',  titulo: 'Live set 02',     src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Foto+2' },
  { id: 3, tipo: 'Flyers', titulo: 'Evento marzo',    src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Flyer+1' },
  { id: 4, tipo: 'Fotos',  titulo: 'Behind the decks',src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Foto+3' },
  { id: 5, tipo: 'Flyers', titulo: 'Evento abril',    src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Flyer+2' },
  { id: 6, tipo: 'Videos', titulo: 'Mix session',     src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Video+1' },
  { id: 7, tipo: 'Fotos',  titulo: 'Live set 03',     src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Foto+4' },
  { id: 8, tipo: 'Videos', titulo: 'Studio session',  src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Video+2' },
  { id: 9, tipo: 'Flyers', titulo: 'Evento mayo',     src: 'https://placehold.co/600x400/1a1a1a/FF5B00?text=Flyer+3' },
]

export default function Portafolio() {
  const [activa, setActiva]   = useState('Todo')
  const [selected, setSelected] = useState(null)

  const filtrados = activa === 'Todo' ? items : items.filter(i => i.tipo === activa)

  return (
    <section id="portafolio" style={{
      backgroundColor: '#0a0a0a',
      padding: '6rem 1.5rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            color: '#FF5B00',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Nuestro trabajo
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#f5f5f5',
            letterSpacing: '0.05em',
          }}>
            Portafolio
          </h2>
        </motion.div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setActiva(cat)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: activa === cat ? '#FF5B00' : '#2a2a2a',
                backgroundColor: activa === cat ? '#FF5B00' : 'transparent',
                color: activa === cat ? '#0a0a0a' : '#f5f5f5',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div
          layout
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          <AnimatePresence>
            {filtrados.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelected(item)}
                style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#1a1a1a',
                  aspectRatio: '3/2',
                  border: '1px solid #2a2a2a',
                }}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={item.src}
                  alt={item.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Overlay hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(255,91,0,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ZoomIn size={32} color="#0a0a0a" />
                  <span style={{
                    color: '#0a0a0a',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {item.titulo}
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: '800px', width: '100%' }}
            >
              <img
                src={selected.src}
                alt={selected.titulo}
                style={{ width: '100%', borderRadius: '8px', display: 'block' }}
              />
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: 'absolute',
                  top: '-1rem',
                  right: '-1rem',
                  background: '#FF5B00',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#0a0a0a',
                }}
              >
                <X size={18} />
              </button>
              <p style={{
                color: '#f5f5f5',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginTop: '1rem',
                fontSize: '0.9rem',
              }}>
                {selected.titulo}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}