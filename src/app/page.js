import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Sponsors from '@/components/Sponsors'
import Footer from '@/components/Footer'
import Tienda from '@/components/Tienda'
import Carrito from '@/components/Carrito'


export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>

      <Navbar />
      <Hero />
      
      <Tienda />
  
      <Sponsors />
      <Footer />
      <Carrito />
    </main>
  )
}
