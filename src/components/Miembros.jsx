'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Youtube, Music2, X } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'

function MiembroCard({ miembro, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onClick(miembro)}
      whileHover={{ y: -6 }}
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#FF5B00'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    >
      {/* Foto */}
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
        <img
          src={miembro.foto}
          alt={miembro.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(transparent, #1a1a1a)',
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{
          color: '#f5f5f5',
          fontWeight: 900,
          fontSize: '1.1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {miembro.nombre}
        </h3>
        <p style={{
          color: '#FF5B00',
          fontWeight: 700,
          fontSize: '0.78rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: '0.25rem',
        }}>
          {miembro.rol}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {miembro.tags.map(tag => (
            <span key={tag} style={{
              backgroundColor: '#2a2a2a',
              color: '#f5f5f5',
              opacity: 0.7,
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Redes */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          {miembro.redes.instagram && (
            <a href={miembro.redes.instagram} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: '#f5f5f5', opacity: 0.5, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
            >
              <User size={18} />
            </a>
          )}
          {miembro.redes.youtube && (
            <a href={miembro.redes.youtube} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: '#f5f5f5', opacity: 0.5, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
            >
              <Play size={18} />
            </a>
          )}
          {miembro.redes.soundcloud && (
            <a href={miembro.redes.soundcloud} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: '#f5f5f5', opacity: 0.5, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
            >
              <Music2 size={18} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Miembros() {
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)

   useEffect(() => {
    
    async function fetchMiembros() {
      try {
        const q = query(collection(db, 'users'), where('rol', 'in', ['colaborador', 'superadmin']))
        const snap = await getDocs(q)
        setMiembros(snap.docs.map(d => ({
          id: d.id,
          nombre: d.data().nombre || 'Sin nombre',
          rol: d.data().rolArtistico || 'Colaborador',
          bio: d.data().bio || '',
          foto: d.data().avatar || 'https://placehold.co/400x400/1a1a1a/FF5B00?text=' + encodeURIComponent(d.data().nombre || '?'),
          redes: d.data().redes || {},
          tags: d.data().tags || [],
        })))
      } catch {
        setMiembros([])
      }
      setLoading(false)
    }
    fetchMiembros()
  }, [])
  
  return (
    <section id="miembros" style={{
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
            Quiénes somos
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#f5f5f5',
            letterSpacing: '0.05em',
          }}>
            El Colectivo
          </h2>
        </motion.div>

       {loading ? (
          <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
        ) : miembros.length === 0 ? (
          <p style={{ color: '#f5f5f5', opacity: 0.25, textAlign: 'center', padding: '3rem' }}>
            Aún no hay miembros registrados.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {miembros.map((m, i) => (
              <MiembroCard key={m.id} miembro={m} index={i} onClick={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* Modal detalle */}
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
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '16px',
                overflow: 'hidden',
                maxWidth: '500px',
                width: '100%',
                position: 'relative',
              }}
            >
              {/* Foto header */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                <img
                  src={selected.foto}
                  alt={selected.nombre}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(transparent 40%, #1a1a1a)',
                }} />
              </div>

              {/* Contenido */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  color: '#f5f5f5',
                  fontWeight: 900,
                  fontSize: '1.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {selected.nombre}
                </h3>
                <p style={{
                  color: '#FF5B00',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginTop: '0.25rem',
                }}>
                  {selected.rol}
                </p>
                <p style={{
                  color: '#f5f5f5',
                  opacity: 0.6,
                  fontSize: '0.9rem',
                  lineHeight: 1.7,
                  marginTop: '1rem',
                }}>
                  {selected.bio}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {selected.tags.map(tag => (
                    <span key={tag} style={{
                      backgroundColor: 'rgba(255,91,0,0.15)',
                      color: '#FF5B00',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Redes */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  {selected.redes.instagram && (
                    <a href={selected.redes.instagram} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: '#f5f5f5', textDecoration: 'none', opacity: 0.7,
                        fontSize: '0.8rem', fontWeight: 600,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >
                      <User size={16} /> Instagram
                    </a>
                  )}
                  {selected.redes.youtube && (
                    <a href={selected.redes.youtube} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: '#f5f5f5', textDecoration: 'none', opacity: 0.7,
                        fontSize: '0.8rem', fontWeight: 600,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >
                      <Play size={16} /> YouTube
                    </a>
                  )}
                  {selected.redes.soundcloud && (
                    <a href={selected.redes.soundcloud} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: '#f5f5f5', textDecoration: 'none', opacity: 0.7,
                        fontSize: '0.8rem', fontWeight: 600,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                    >
                      <Music2 size={16} /> SoundCloud
                    </a>
                  )}
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(10,10,10,0.8)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#f5f5f5',
                }}
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}