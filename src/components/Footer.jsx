'use client'
import Image from 'next/image'
import { User, Play, Music2 } from 'lucide-react'

const links = [
  { label: 'Portafolio', href: '#portafolio' },
  { label: 'Música',     href: '#musica' },
  { label: 'Miembros',   href: '#miembros' },
  { label: 'Eventos',    href: '#eventos' },
  { label: 'Merch',      href: '#merch' },
  { label: 'Contacto',   href: '#contacto' },
]

const redes = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/clandestino.s.c/',
    icon: <User size={20} />,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: <Play size={20} />,
  },
  {
    label: 'SoundCloud',
    href: 'https://soundcloud.com',
    icon: <Music2 size={20} />,
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      backgroundColor: '#0a0a0a',
      borderTop: '1px solid #1a1a1a',
      padding: '4rem 1.5rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Top */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>

          {/* Marca */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Image
                src="/logo.png"
                alt="Clandestino S.C."
                width={44}
                height={44}
                style={{ borderRadius: '8px' }}
              />
              <span style={{
                color: '#f5f5f5',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Clandestino <span style={{ color: '#FF5B00' }}>S.C.</span>
              </span>
            </div>
            <p style={{
              color: '#f5f5f5',
              opacity: 0.35,
              fontSize: '0.82rem',
              lineHeight: 1.7,
              maxWidth: '240px',
            }}>
              Colectivo de música y arte urbano. Sonido underground desde Chiapas, México.
            </p>

            {/* Redes */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {redes.map(red => (
                <a
                  key={red.label}
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#f5f5f5',
                    opacity: 0.6,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = 1
                    e.currentTarget.style.borderColor = '#FF5B00'
                    e.currentTarget.style.color = '#FF5B00'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = 0.6
                    e.currentTarget.style.borderColor = '#2a2a2a'
                    e.currentTarget.style.color = '#f5f5f5'
                  }}
                >
                  {red.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div>
            <p style={{
              color: '#f5f5f5',
              opacity: 0.3,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              Navegación
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {links.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    style={{
                      color: '#f5f5f5',
                      opacity: 0.5,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s, color 0.2s',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#FF5B00' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = '#f5f5f5' }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto rápido */}
          <div>
            <p style={{
              color: '#f5f5f5',
              opacity: 0.3,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              Contacto
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href="https://www.instagram.com/clandestino.s.c/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#f5f5f5',
                  opacity: 0.5,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
              >
                @clandestino.s.c
              </a>
              <a
                href="#contacto"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#FF5B00',
                  color: '#0a0a0a',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  width: 'fit-content',
                  marginTop: '0.25rem',
                }}
              >
                Contrátanos
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid #1a1a1a',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <p style={{
            color: '#f5f5f5',
            opacity: 0.25,
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          }}>
            © {year} Clandestino S.C. — Todos los derechos reservados.
          </p>
          <p style={{
            color: '#f5f5f5',
            opacity: 0.15,
            fontSize: '0.72rem',
            letterSpacing: '0.05em',
          }}>
            Tuxtla Gutiérrez, Chiapas, México
          </p>
        </div>
      </div>
    </footer>
  )
}