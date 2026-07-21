'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

const categorias = ['Todo', 'Fotos', 'Flyers', 'Videos']

export default function Portafolio() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [activa, setActiva]     = useState('Todo')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function fetchItems() {
      try {
        const q = query(collection(db, 'portafolio'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {
        setItems([])
      }
      setLoading(false)
    }
    fetchItems()
  }, [])

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
            color: '#FF5B00', fontWeight: 700, fontSize: '0.8rem',
            letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem',
          }}>
            Nuestro trabajo
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
            textTransform: 'uppercase', color: '#f5f5f5', letterSpacing: '0.05em',
          }}>
            Portafolio
          </h2>
        </motion.div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {categorias.map(cat => (
            <button key={cat} onClick={() => setActiva(cat)} style={{
              padding: '0.5rem 1.25rem', borderRadius: '4px', border: '1px solid',
              borderColor: activa === cat ? '#FF5B00' : '#2a2a2a',
              backgroundColor: activa === cat ? '#FF5B00' : 'transparent',
              color: activa === cat ? '#0a0a0a' : '#f5f5f5',
              fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Estado: cargando */}
        {loading && (
          <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>
            Cargando...
          </p>
        )}

        {/* Estado: vacío */}
        {!loading && filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#f5f5f5', opacity: 0.25 }}>
            <p style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              Aún no hay contenido en esta categoría. ¡Vuelve pronto!
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtrados.length > 0 && (
          <motion.div layout style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
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
                    position: 'relative', borderRadius: '8px', overflow: 'hidden',
                    cursor: 'pointer', backgroundColor: '#1a1a1a', aspectRatio: '3/2',
                    border: '1px solid #2a2a2a',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Media */}
                  {item.resourceType === 'video' ? (
                    <video
                      src={item.url}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      muted
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}

                  {/* Overlay hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(255,91,0,0.7) 100%)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    }}
                  >
                    <ZoomIn size={28} color="#f5f5f5" />
                    <span style={{
                      color: '#f5f5f5', fontWeight: 800, fontSize: '0.82rem',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      textAlign: 'center', padding: '0 0.5rem',
                    }}>
                      {item.titulo}
                    </span>
                  </motion.div>

                  {/* Info siempre visible abajo */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    padding: '1.5rem 0.75rem 0.75rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        color: '#f5f5f5', fontWeight: 700, fontSize: '0.78rem',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.titulo}
                      </p>
                      {item.autorNombre && (
                        <p style={{
                          color: '#FF5B00', fontWeight: 600, fontSize: '0.68rem',
                          letterSpacing: '0.08em', marginTop: '0.15rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.autorNombre}
                        </p>
                      )}
                    </div>
                    <span style={{
                      backgroundColor: 'rgba(255,91,0,0.2)', color: '#FF5B00',
                      padding: '0.15rem 0.5rem', borderRadius: '4px',
                      fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', flexShrink: 0, marginLeft: '0.5rem',
                    }}>
                      {item.tipo}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
         
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)',
              zIndex: 200, display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '860px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Botón cerrar SIEMPRE visible arriba */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '0.75rem',
                flexShrink: 0,
              }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: '#FF5B00', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#0a0a0a', flexShrink: 0,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenedor de la imagen con altura fija */}
              <div style={{
                width: '100%',
                height: 'calc(80vh - 100px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                {selected.resourceType === 'video' ? (
                  <video
                    src={selected.url}
                    controls
                    autoPlay
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                ) : (
                  <img
                    src={selected.url}
                    alt={selected.titulo}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                )}
              </div>


              {/* Pie del lightbox */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginTop: '0.75rem',
                flexWrap: 'wrap', gap: '0.5rem', flexShrink: 0,
              }}>
                <div>
                  <p style={{
                    color: '#f5f5f5', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem',
                  }}>
                    {selected.titulo}
                  </p>
                  {selected.autorNombre && (
                    <p style={{
                      color: '#FF5B00', fontWeight: 600, fontSize: '0.78rem',
                      letterSpacing: '0.08em', marginTop: '0.2rem',
                    }}>
                      por {selected.autorNombre}
                    </p>
                  )}
                </div>
                <span style={{
                  backgroundColor: 'rgba(255,91,0,0.15)', color: '#FF5B00',
                  padding: '0.25rem 0.75rem', borderRadius: '4px',
                  fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                  {selected.tipo}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}