'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard, Image as ImageIcon, CalendarDays,
  Users, Star, MessageSquare, ShoppingBag, LogOut,
  Menu, X, ChevronRight, Music
} from 'lucide-react'

const navItems = {
  superadmin: [
    { label: 'Inicio',       href: '/dashboard',           icon: <LayoutDashboard size={18} /> },
    { label: 'Portafolio',   href: '/dashboard/portafolio',icon: <ImageIcon size={18} /> },
    { label: 'Música',       href: '/dashboard/musica',    icon: <Music size={18} /> },
    { label: 'Eventos',      href: '/dashboard/eventos',   icon: <CalendarDays size={18} /> },
    { label: 'Miembros',     href: '/dashboard/miembros',  icon: <Users size={18} /> },
    { label: 'Sponsors',     href: '/dashboard/sponsors',  icon: <Star size={18} /> },
    { label: 'Mensajes',     href: '/dashboard/mensajes',  icon: <MessageSquare size={18} /> },
    { label: 'Pedidos',      href: '/dashboard/pedidos',   icon: <ShoppingBag size={18} /> },
  ],
  colaborador: [
    { label: 'Inicio',       href: '/dashboard',           icon: <LayoutDashboard size={18} /> },
    { label: 'Mi perfil',    href: '/dashboard/perfil',    icon: <Users size={18} /> },
    { label: 'Portafolio',   href: '/dashboard/portafolio',icon: <ImageIcon size={18} /> },
    { label: 'Música',       href: '/dashboard/musica',    icon: <Music size={18} /> },
    { label: 'Mis eventos',  href: '/dashboard/eventos',   icon: <CalendarDays size={18} /> },
  ],
  usuario: [
    { label: 'Inicio',       href: '/dashboard',           icon: <LayoutDashboard size={18} /> },
    { label: 'Pedidos',      href: '/dashboard/pedidos',   icon: <ShoppingBag size={18} /> },
  ],
}

export default function DashboardLayout({ children }) {
  const { user, perfil, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const handleLogout = async () => {
    await logout()
    document.cookie = 'session=; path=/; max-age=0'
    router.push('/login')
  }

  const rol = perfil?.rol || 'usuario'
  const items = navItems[rol] || navItems.usuario

  const Sidebar = () => (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      backgroundColor: '#111',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #1a1a1a' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="logo" width={36} height={36} style={{ borderRadius: '6px' }} />
          <span style={{ color: '#f5f5f5', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Clandestino <span style={{ color: '#FF5B00' }}>S.C.</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {items.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: active ? 'rgba(255,91,0,0.12)' : 'transparent',
                color: active ? '#FF5B00' : '#f5f5f5',
                opacity: active ? 1 : 0.55,
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.opacity = 1; e.currentTarget.style.backgroundColor = '#1a1a1a' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.opacity = 0.55; e.currentTarget.style.backgroundColor = 'transparent' } }}
            >
              {item.icon} {item.label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Usuario */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {perfil?.nombre || user?.email}
          </p>
          <span style={{
            backgroundColor: rol === 'superadmin' ? 'rgba(255,91,0,0.15)' : rol === 'colaborador' ? 'rgba(139,92,246,0.15)' : 'rgba(20,184,166,0.15)',
            color: rol === 'superadmin' ? '#FF5B00' : rol === 'colaborador' ? '#a78bfa' : '#2dd4bf',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {rol}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: '1px solid #2a2a2a',
            color: '#f5f5f5', opacity: 0.5, padding: '0.5rem 0.75rem',
            borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.78rem', letterSpacing: '0.05em', width: '100%',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.borderColor = '#ff4444'; e.currentTarget.style.color = '#ff4444' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#f5f5f5' }}
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>

      {/* Sidebar escritorio */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 40 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '240px', height: '100%' }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Contenido */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar móvil */}
        <div className="topbar-mobile" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #1a1a1a',
          backgroundColor: '#111',
        }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="logo" width={28} height={28} style={{ borderRadius: '4px' }} />
            <span style={{ color: '#FF5B00', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Clandestino S.C.
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#f5f5f5', cursor: 'pointer' }}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </div>

      <style>{`
        .sidebar-desktop { display: flex; }
        .topbar-mobile { display: none !important; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .topbar-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}