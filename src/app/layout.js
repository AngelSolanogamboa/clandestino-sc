import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Clandestino S.C.',
  description: 'Colectivo de música y arte urbano underground desde Chiapas, México.',
  manifest: '/manifest.json',
  themeColor: '#FF5B00',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Clandestino S.C.',
  },
  openGraph: {
    title: 'Clandestino S.C.',
    description: 'Colectivo de música y arte urbano underground desde Chiapas, México.',
    type: 'website',
    images: [{ url: '/logo.png', width: 1080, height: 1080 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clandestino S.C.',
    description: 'Colectivo de música y arte urbano underground.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Clandestino S.C." />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
