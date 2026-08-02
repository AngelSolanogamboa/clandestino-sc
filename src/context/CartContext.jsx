'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([])
  const [cartOpen, setCartOpen] = useState(false)

  // Persistir carrito en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('clandestino_cart')
    if (saved) setCarrito(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('clandestino_cart', JSON.stringify(carrito))
  }, [carrito])

  function agregar(producto, variante = null) {
    setCarrito(prev => {
      const key = variante ? `${producto.id}_${variante}` : producto.id
      const existe = prev.find(i => i.key === key)
      if (existe) {
        return prev.map(i => i.key === key
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
        )
      }
      return [...prev, {
        key,
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        foto: producto.fotos?.[0] || '',
        variante,
        cantidad: 1,
        autorId: producto.autorId,
      }]
    })
    setCartOpen(true)
  }

  function quitar(key) {
    setCarrito(prev => prev.filter(i => i.key !== key))
  }

  function actualizar(key, cantidad) {
    if (cantidad < 1) { quitar(key); return }
    setCarrito(prev => prev.map(i => i.key === key ? { ...i, cantidad } : i))
  }

  function limpiar() {
    setCarrito([])
    localStorage.removeItem('clandestino_cart')
  }

  const total = carrito.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
  const totalItems = carrito.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <CartContext.Provider value={{
      carrito, cartOpen, setCartOpen,
      agregar, quitar, actualizar, limpiar,
      total, totalItems,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)