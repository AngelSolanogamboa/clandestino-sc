'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Music2, Radio } from 'lucide-react'

const tracks = [
  {
    id: 1,
    titulo: 'Mix Session 001',
    descripcion: 'Underground set — Techno / Industrial',
    duracion: '1:02:34',
    soundcloudUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1234567&color=%23FF5B00&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true',
  },
  {
    id: 2,
    titulo: 'Mix Session 002',
    descripcion: 'Live @ Clandestino — Dark Techno',
    duracion: '58:12',
    soundcloudUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1234568&color=%23FF5B00&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true',
  },
  {
    id: 3,
    titulo: 'Mix Session 003',
    descripcion: 'Studio Session — Ambient / Dub Techno',
    duracion: '45:00',
    soundcloudUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1234569&color=%23FF5B00&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true',
  },
]

const videos = [
  {
    id: 1,
    titulo: 'Live Set — Evento 01',
    youtubeId: 'dQw4w9WgXcQ', // reemplaza con tu ID real de YouTube
  },
  {
    id: 2,
    titulo: 'Documentary — Clandestino',
    youtubeId: 'dQw4w9WgXcQ', // reemplaza con tu ID real de YouTube
  },
]

function TrackCard({ track, index }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#FF5B00'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    >
      {/* Header del track */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: '#FF5B00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Music2 size={20} color="#0a0a0a" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: '#f5f5f5',
            fontWeight: 700,
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {track.titulo}
          </p>
          <p style={{
            color: '#f5f5f5',
            opacity: 0.4,
            fontSize: '0.8rem',
            marginTop: '0.2rem',
          }}>
            {track.descripcion}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <span style={{
            color: '#f5f5f5',
            opacity: 0.4,
            fontSize: '0.8rem',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {track.duracion}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              backgroundColor: expanded ? '#FF5B00' : 'transparent',
              border: '1px solid',
              borderColor: expanded ? '#FF5B00' : '#2a2a2a',
              borderRadius: '4px',
              color: expanded ? '#0a0a0a' : '#f5f5f5',
              padding: '0.4rem 0.9rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
          >
            {expanded ? 'Cerrar' : 'Escuchar'}
          </button>
        </div>
      </div>

      {/* Player SoundCloud expandible */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ padding: '0 1.25rem 1.25rem' }}
        >
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={track.soundcloudUrl}
            style={{ borderRadius: '4px' }}
          />
          <p style={{
            color: '#f5f5f5',
            opacity: 0.3,
            fontSize: '0.72rem',
            marginTop: '0.5rem',
            textAlign: 'center',
          }}>
            Reemplaza la URL de SoundCloud con tu track real en el archivo Musica.jsx
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

function VideoCard({ video, index }) {
  const [playing, setPlaying] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #2a2a2a',
        backgroundColor: '#1a1a1a',
      }}
    >
      {!playing ? (
        <div
          onClick={() => setPlaying(true)}
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            cursor: 'pointer',
            backgroundColor: '#111',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.titulo}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.6 }}
          />
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#FF5B00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            zIndex: 1,
          }}>
            <Play size={24} color="#0a0a0a" fill="#0a0a0a" style={{ marginLeft: '3px' }} />
          </div>
        </div>
      ) : (
        <div style={{ aspectRatio: '16/9' }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.titulo}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ display: 'block' }}
          />
        </div>
      )}
      <div style={{ padding: '1rem' }}>
        <p style={{
          color: '#f5f5f5',
          fontWeight: 700,
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {video.titulo}
        </p>
      </div>
    </motion.div>
  )
}

export default function Musica() {
  const [tab, setTab] = useState('mixes')

  return (
    <section id="musica" style={{
      backgroundColor: '#111',
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
            Escúchanos
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: '#f5f5f5',
            letterSpacing: '0.05em',
          }}>
            Música & Video
          </h2>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {[
            { key: 'mixes', label: 'Mixes', icon: <Radio size={16} /> },
            { key: 'videos', label: 'Videos', icon: <Play size={16} /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.5rem',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: tab === t.key ? '#FF5B00' : '#2a2a2a',
                backgroundColor: tab === t.key ? '#FF5B00' : 'transparent',
                color: tab === t.key ? '#0a0a0a' : '#f5f5f5',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {tab === 'mixes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        )}

        {tab === 'videos' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {videos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}