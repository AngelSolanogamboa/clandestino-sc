import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Clandestino S.C.',
  description: 'Colectivo de música y arte urbano',
  manifest: '/manifest.json',
  themeColor: '#FF5B00',
  openGraph: {
    title: 'Clandestino S.C.',
    description: 'Colectivo de música y arte urbano',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}