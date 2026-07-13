'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Music2, Radio } from 'lucide-react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'



function TrackCard({ track, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{
        backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: '8px', overflow: 'hidden', transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#FF5B00'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FF5B00',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Music2 size={20} color="#0a0a0a" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: '#f5f5f5', fontWeight: 700, fontSize: '0.95rem',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {track.titulo}
          </p>
          {track.descripcion && (
            <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {track.descripcion}
              {track.duracion && ` · ${track.duracion}`}
            </p>
          )}

          {/* Autor */}
          {track.autorNombre && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
              {track.autorAvatar ? (
                <img
                  src={track.autorAvatar}
                  alt={track.autorNombre}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: 'rgba(255,91,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: '#FF5B00',
                }}>
                  {track.autorNombre[0].toUpperCase()}
                </div>
              )}
              <span style={{ color: '#FF5B00', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                {track.autorNombre}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Player de audio nativo */}
      {track.audioUrl && (
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          {track.audioUrl.includes('/video/upload/') && !track.audioUrl.match(/\.(mp3|wav|flac|m4a|ogg|aac)$/i) ? (
            <video
              controls
              src={track.audioUrl}
              style={{
                width: '100%', maxHeight: '200px', borderRadius: '6px',
                display: 'block', backgroundColor: '#0a0a0a',
              }}
            />
          ) : (
            <audio
              controls
              src={track.audioUrl}
              style={{ width: '100%', height: '40px', accentColor: '#FF5B00', borderRadius: '4px' }}
            />
          )}
        </div>
      )}
    </motion.div>
  )
}

// function VideoCard({ video, index }) {
//   const [playing, setPlaying] = useState(false)

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.4, delay: index * 0.15 }}
//       style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #2a2a2a', backgroundColor: '#1a1a1a' }}
//     >
//       {!playing ? (
//         <div onClick={() => setPlaying(true)} style={{
//           position: 'relative', aspectRatio: '16/9', cursor: 'pointer',
//           backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//           <img
//             src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
//             alt={video.titulo}
//             style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.6 }}
//           />
//           <div style={{
//             position: 'relative', width: '60px', height: '60px', borderRadius: '50%',
//             backgroundColor: '#FF5B00', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
//           }}>
//             <Play size={24} color="#0a0a0a" fill="#0a0a0a" style={{ marginLeft: '3px' }} />
//           </div>
//         </div>
//       ) : (
//         <div style={{ aspectRatio: '16/9' }}>
//           <iframe
//             width="100%" height="100%"
//             src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
//             title={video.titulo} frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen style={{ display: 'block' }}
//           />
//         </div>
//       )}
//       <div style={{ padding: '1rem' }}>
//         <p style={{ color: '#f5f5f5', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//           {video.titulo}
//         </p>
//         {video.descripcion && (
//           <p style={{ color: '#f5f5f5', opacity: 0.4, fontSize: '0.78rem', marginTop: '0.25rem' }}>
//             {video.descripcion}
//           </p>
//         )}
//       </div>
//     </motion.div>
//   )
// }

export default function Musica() {
  const [tracks, setTracks]   = useState([])
  const [videos, setVideos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('mixes')

  useEffect(() => {
    async function fetchMusica() {
      try {
        const q = query(collection(db, 'musica'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setTracks(data.filter(d => d.tipo === 'mix'))
        setVideos(data.filter(d => d.tipo === 'video'))
      } catch {
        setTracks([])
        setVideos([])
      }
      setLoading(false)
    }
    fetchMusica()
  }, [])

  return (
    <section id="musica" style={{ backgroundColor: '#111', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{ color: '#FF5B00', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Escúchanos
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textTransform: 'uppercase', color: '#f5f5f5', letterSpacing: '0.05em' }}>
            Música & Video
          </h2>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {/* {[
            { key: 'mixes',  label: 'Mixes',  icon: <Radio size={16} /> },
            // { key: 'videos', label: 'Videos', icon: <Play size={16} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.5rem', borderRadius: '4px', border: '1px solid',
              borderColor: tab === t.key ? '#FF5B00' : '#2a2a2a',
              backgroundColor: tab === t.key ? '#FF5B00' : 'transparent',
              color: tab === t.key ? '#0a0a0a' : '#f5f5f5',
              fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {t.icon} {t.label}
            </button>
          ))} */}
        </div>

        {/* Contenido */}
        {loading ? (
          <p style={{ color: '#f5f5f5', opacity: 0.3, textAlign: 'center', padding: '3rem' }}>Cargando...</p>
        ) : tab === 'mixes' ? (
          tracks.length === 0 ? (
            <p style={{ color: '#f5f5f5', opacity: 0.2, textAlign: 'center', padding: '3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Sin mixes aún
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tracks.map((track, i) => <TrackCard key={track.id} track={track} index={i} />)}
            </div>
          )
        ) : (
          videos.length === 0 ? (
            <p style={{ color: '#f5f5f5', opacity: 0.2, textAlign: 'center', padding: '3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Sin videos aún
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {videos.map((video, i) => <VideoCard key={video.id} video={video} index={i} />)}
            </div>
          )
        )}
      </div>
    </section>
  )
}