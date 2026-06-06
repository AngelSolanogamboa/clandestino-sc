'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'


const links = [
  { label: 'Inicio',        href: '/' },
  { label: 'Portafolio',    href: '/Portafolio' },
  { label: 'Música',        href: '/Musica' },
  { label: 'Miembros',      href: '/Miembros' },
  { label: 'Eventos',       href: '/Eventos' },
  { label: 'Merch',         href: '#merch' },
  { label: 'Contacto',      href: '/Contactos' },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      backgroundColor: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      borderBottom: scrolled ? '1px solid #2a2a2a' : '1px solid transparent',
    }}>
      <nav style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link href="#inicio" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="Clandestino S.C."
            width={55}
            height={55}
            style={{ borderRadius: '8px' }}
          />
          <span style={{
            color: '#f5f5f5',
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Clandestino <span style={{ color: '#FF5B00' }}>S.C.</span>
          </span>
        </Link>

        {/* Links escritorio */}
        <ul style={{
          display: 'flex',
          gap: '2rem',
          listStyle: 'none',
          alignItems: 'center',
        }} className="desktop-nav">
          {links.map(link => (
            <li key={link.href}>
              <a href={link.href} style={{
                color: '#f5f5f5',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                opacity: 0.8,
                transition: 'opacity 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.target.style.opacity = 1; e.target.style.color = '#FF5B00' }}
              onMouseLeave={e => { e.target.style.opacity = 0.8; e.target.style.color = '#f5f5f5' }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Botón menú móvil */}
        <button
          onClick={() => setOpen(!open)}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: '#f5f5f5',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Menú móvil desplegable */}
      {open && (
        <div style={{
          backgroundColor: 'rgba(10,10,10,0.98)',
          borderTop: '1px solid #2a2a2a',
          padding: '1.5rem',
        }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {links.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{
                    color: '#f5f5f5',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}