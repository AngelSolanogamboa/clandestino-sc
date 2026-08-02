'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, googleProvider } from '@/lib/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [perfil, setPerfil]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          setPerfil(snap.data())
        } else {
          // Usuario nuevo sin documento — crear con rol usuario
          const newPerfil = {
            nombre: firebaseUser.displayName || '',
            email: firebaseUser.email,
            rol: 'usuario',
            avatar: firebaseUser.photoURL || '',
            bio: '',
            tags: [],
            redes: { instagram: '', youtube: '', soundcloud: '' },
            createdAt: serverTimestamp(),
          }
          await setDoc(doc(db, 'users', firebaseUser.uid), newPerfil)
          setPerfil(newPerfil)
        }
      } else {
        setUser(null)
        setPerfil(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const loginGoogle = () =>
    signInWithPopup(auth, googleProvider)

  const register = async (nombre, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: nombre })
    await setDoc(doc(db, 'users', cred.user.uid), {
      nombre,
      email,
      rol: 'usuario',
      avatar: '',
      bio: '',
      tags: [],
      redes: { instagram: '', youtube: '', soundcloud: '' },
      createdAt: serverTimestamp(),
    })
    return cred
  }

  const logout = () => signOut(auth)

  const resetPassword = (email) =>
    sendPasswordResetEmail(auth, email)

  return (
    <AuthContext.Provider value={{
      user, perfil, loading,
      login, loginGoogle, register, logout, resetPassword
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)