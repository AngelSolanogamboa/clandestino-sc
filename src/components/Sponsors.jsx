'use client'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const sponsors = [
  {
    id: 1,
    nombre: 'Sponsor Principal',
    tipo: 'principal',
    logo: 'https://placehold.co/200x80/1a1a1a/FF5B00?text=SPONSOR+1',
    url: '#',
  },
  {
    id: 2,
    nombre: 'Sponsor 2',
    tipo: 'principal',
    logo: 'https://placehold.co/200x80/1a1a1a/FF5B00?text=SPONSOR+2',
    url: '#',
  },
  {
    id: 3,
    nombre: 'Colaborador 1',
    tipo: 'colaborador',
    logo: 'https://placehold.co/160x60/1a1a1a/FF5B00?text=COLAB+1',
    url: '#',
  },
  {
    id: 4,
    nombre: 'Colaborador 2',
    tipo: 'colaborador',
    logo: 'https://placehold.co/160x60/1a1a1a/FF5B00?text=COLAB+2',
    url: '#',
  },
  {
    id: 5,
    nombre: 'Colaborador 3',
    tipo: 'colaborador',
    logo: 'https://placehold.co/160x60/1a1a1a/FF5B00?text=COLAB+3',
    url: '#',
  },
  {
    id: 6,
    nombre: 'Colaborador 4',
    tipo: 'colaborador',
    logo: 'https://placehold.co/160x60/1a1a1a/FF5B00?text=COLAB+4',
    url: '#',
  },
]

const principales = sponsors.filter(s => s.tipo === 'principal')
const colaboradores = sponsors.filter(s => s.tipo === 'colaborador')

export default function Sponsors() {
  return (
    <section id="sponsors" style={{
      backgroundColor: '#111',
      padding: '6rem 1.5rem',
      borderTop: '1px solid #1a1a1a',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <p style={{
            color: '#FF5B00',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Nos apoyan
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#f5f5f5',
            letterSpacing: '0.05em',
          }}>
            Sponsors
          </h2>
        </motion.div>

        {/* Sponsors principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '1rem' }}
        >
          <p style={{
            color: '#f5f5f5',
            opacity: 0.3,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            Patrocinadores principales
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}>
            {principales.map((sponsor, i) => (
              <motion.a
                key={sponsor.id}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '10px',
                  padding: '1.5rem 2.5rem',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#FF5B00'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.nombre}
                  style={{ height: '50px', objectFit: 'contain', filter: 'grayscale(100%) brightness(1.5)', transition: 'filter 0.3s' }}
                  onMouseEnter={e => e.target.style.filter = 'grayscale(0%) brightness(1)'}
                  onMouseLeave={e => e.target.style.filter = 'grayscale(100%) brightness(1.5)'}
                />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{
          height: '1px',
          backgroundColor: '#1a1a1a',
          margin: '3rem 0',
        }} />

        {/* Colaboradores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p style={{
            color: '#f5f5f5',
            opacity: 0.3,
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            Colaboradores
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}>
            {colaboradores.map((sponsor, i) => (
              <motion.a
                key={sponsor.id}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.04 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  padding: '1rem 1.75rem',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#FF5B00'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.nombre}
                  style={{ height: '36px', objectFit: 'contain', filter: 'grayscale(100%) brightness(1.3)', transition: 'filter 0.3s' }}
                  onMouseEnter={e => e.target.style.filter = 'grayscale(0%) brightness(1)'}
                  onMouseLeave={e => e.target.style.filter = 'grayscale(100%) brightness(1.3)'}
                />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* CTA ser sponsor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            padding: '2rem',
            border: '1px dashed #2a2a2a',
            borderRadius: '12px',
          }}
        >
          <p style={{
            color: '#f5f5f5',
            opacity: 0.5,
            fontSize: '0.85rem',
            marginBottom: '1rem',
            lineHeight: 1.6,
          }}>
            ¿Quieres patrocinar a Clandestino S.C.?<br />
            Contáctanos y hablemos de oportunidades.
          </p>
          <a
            href="#contacto"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid #FF5B00',
              color: '#FF5B00',
              padding: '0.7rem 1.5rem',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FF5B00'; e.currentTarget.style.color = '#0a0a0a' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#FF5B00' }}
          >
            <ExternalLink size={14} /> Ser patrocinador
          </a>
        </motion.div>
      </div>
    </section>
  )
}