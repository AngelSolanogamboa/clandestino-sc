import Navbar from "../../components/Navbar";
import Portafolio from '../../components/Portafolio'
export default function PortafolioPage() {
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
      <Portafolio />

    </main>
  )
}