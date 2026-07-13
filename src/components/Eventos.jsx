'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, Ticket, ChevronRight } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00')
  return {
    dia: fecha.getDate().toString().padStart(2, '0'),
    mes: fecha.toLocaleString('es-MX', { month: 'short' }).toUpperCase(),
    año: fecha.getFullYear(),
  }
}

function EventoCard({ evento, index, onClick }) {
  const { dia, mes, año } = formatFecha(evento.fecha)
  const esProximo = evento.estado === 'proximo'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onClick(evento)}
      style={{
        display: 'flex',
        gap: '1.5rem',
        backgroundColor: '#1a1a1a',
        border: '1px solid',
        borderColor: esProximo ? '#2a2a2a' : '#1a1a1a',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: esProximo ? 1 : 0.5,
        transition: 'border-color 0.2s, transform 0.2s',
        alignItems: 'center',
      }}
      whileHover={esProximo ? { scale: 1.01 } : {}}
      onMouseEnter={e => { if (esProximo) e.currentTarget.style.borderColor = '#FF5B00' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = esProximo ? '#2a2a2a' : '#1a1a1a' }}
    >
      {/* Flyer thumbnail o bloque de fecha */}
      {evento.imagen ? (
        <img
          src={evento.imagen}
          alt={evento.titulo}
          style={{ width: '90px', minHeight: '100%', objectFit: 'cover', flexShrink: 0, alignSelf: 'stretch' }}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: esProximo ? '#FF5B00' : '#2a2a2a',
          padding: '0.75rem 1rem',
          minWidth: '72px',
          flexShrink: 0,
          alignSelf: 'stretch',
        }}>
          <span style={{ color: esProximo ? '#0a0a0a' : '#f5f5f5', fontWeight: 900, fontSize: '1.8rem', lineHeight: 1 }}>
            {dia}
          </span>
          <span style={{ color: esProximo ? '#0a0a0a' : '#f5f5f5', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
            {mes}
          </span>
          <span style={{ color: esProximo ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: '0.1rem' }}>
            {año}
          </span>
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, padding: '1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          {evento.imagen && (
            <span style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.65rem' }}>
              {dia} {mes} {año}
            </span>
          )}
          <span style={{
            backgroundColor: esProximo ? 'rgba(255,91,0,0.15)' : '#2a2a2a',
            color: esProximo ? '#FF5B00' : '#f5f5f5',
            opacity: esProximo ? 1 : 0.5,
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {esProximo ? 'Próximo' : 'Pasado'}
          </span>
        </div>

        <h3 style={{
          color: '#f5f5f5', fontWeight: 900, fontSize: '1.1rem',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {evento.titulo}
        </h3>

        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f5f5f5', opacity: 0.5, fontSize: '0.8rem' }}>
            <Clock size={13} /> {evento.hora}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f5f5f5', opacity: 0.5, fontSize: '0.8rem' }}>
            <MapPin size={13} /> {evento.lugar}{evento.ciudad ? `, ${evento.ciudad}` : ''}
          </span>
        </div>

        {/* Lineup */}
        {evento.lineup?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {evento.lineup.map(artist => (
              <span key={artist} style={{
                backgroundColor: '#2a2a2a', color: '#f5f5f5', opacity: 0.7,
                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
              }}>
                {artist}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acción */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', paddingRight: '1.25rem' }}>
        {esProximo && evento.ticketUrl ? (
          <a
            href={evento.ticketUrl}
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.6rem 1rem',
              borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem',
              letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            <Ticket size={14} /> Tickets
          </a>
        ) : (
          <ChevronRight size={20} color="#f5f5f5" style={{ opacity: 0.3 }} />
        )}
      </div>
    </motion.div>
  )
}

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro]   = useState('proximos')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function fetchEventos() {
      try {
        const q = query(collection(db, 'eventos'), orderBy('fecha', 'desc'))
        const snap = await getDocs(q)
        setEventos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {
        setEventos([])
      }
      setLoading(false)
    }
    fetchEventos()
  }, [])

  const filtrados = eventos.filter(e =>
    filtro === 'proximos' ? e.estado === 'proximo' : e.estado === 'pasado'
  )

  return (
    <section id="eventos" style={{ backgroundColor: '#111', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Agenda
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase', color: '#f5f5f5', letterSpacing: '0.05em' }}>
            Fechas & Eventos
          </h2>
        </motion.div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { key: 'proximos', label: 'Próximos' },
            { key: 'pasados',  label: 'Pasados'  },
          ].map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)} style={{
              padding: '0.5rem 1.25rem', borderRadius: '4px', border: '1px solid',
              borderColor: filtro === f.key ? '#FF5B00' : '#2a2a2a',
              backgroundColor: filtro === f.key ? '#FF5B00' : 'transparent',
              color: filtro === f.key ? '#0a0a0a' : '#f5f5f5',
              fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence mode="wait">
              {filtrados.length > 0 ? (
                filtrados.map((evento, i) => (
                  <EventoCard key={evento.id} evento={evento} index={i} onClick={setSelected} />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{
                    color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem',
                    fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}
                >
                  No hay eventos en esta categoría
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal detalle evento */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)',
              zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px',
                overflow: 'hidden', maxWidth: '600px', width: '100%', position: 'relative',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              {/* Flyer header */}
              {selected.imagen && (
                <img
                  src={selected.imagen}
                  alt={selected.titulo}
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }}
                />
              )}

              <div style={{ padding: '1.5rem' }}>
                {/* Fecha si no hay flyer */}
                {!selected.imagen && (
                  <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {new Date(selected.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}

                <h3 style={{
                  color: '#f5f5f5', fontWeight: 900, fontSize: '1.4rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {selected.titulo}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' }}>
                  {selected.imagen && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f5f5f5', opacity: 0.6, fontSize: '0.85rem' }}>
                      <Calendar size={15} color="#FF5B00" />
                      {new Date(selected.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f5f5f5', opacity: 0.6, fontSize: '0.85rem' }}>
                    <Clock size={15} color="#FF5B00" /> {selected.hora} hrs
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f5f5f5', opacity: 0.6, fontSize: '0.85rem' }}>
                    <MapPin size={15} color="#FF5B00" /> {selected.lugar}{selected.ciudad ? `, ${selected.ciudad}` : ''}
                  </span>
                </div>

                {selected.descripcion && (
                  <p style={{ color: '#f5f5f5', opacity: 0.6, fontSize: '0.9rem', lineHeight: 1.7 }}>
                    {selected.descripcion}
                  </p>
                )}

                {selected.lineup?.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Lineup
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {selected.lineup.map(a => (
                        <span key={a} style={{
                          backgroundColor: 'rgba(255,91,0,0.15)', color: '#FF5B00',
                          padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700,
                        }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.estado === 'proximo' && selected.ticketUrl && (
                  <a href={selected.ticketUrl} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    marginTop: '1.5rem', backgroundColor: '#FF5B00', color: '#0a0a0a', padding: '0.85rem',
                    borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', textDecoration: 'none',
                  }}>
                    <Ticket size={16} /> Conseguir Tickets
                  </a>
                )}
              </div>

              <button onClick={() => setSelected(null)} style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'rgba(10,10,10,0.8)', border: '1px solid #2a2a2a',
                borderRadius: '50%', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#f5f5f5',
              }}>
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}