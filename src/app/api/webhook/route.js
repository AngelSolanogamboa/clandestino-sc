import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection, addDoc, query, where,
  getDocs, updateDoc, doc, serverTimestamp, increment
} from 'firebase/firestore'

export const runtime = 'nodejs'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    try {
      const q = query(
        collection(db, 'pedidos'),
        where('sessionId', '==', session.id)
      )
      const existing = await getDocs(q)

      if (existing.empty) {
        const items = JSON.parse(session.metadata?.items || '[]')

        await addDoc(collection(db, 'pedidos'), {
          sessionId: session.id,
          userId: session.client_reference_id || 'anonimo',
          email: session.customer_email || '',
          nombre: session.customer_details?.name || '',
          productos: items,
          total: session.amount_total / 100,
          estado: 'procesando',
          metodoPago: session.payment_method_types?.[0] || 'card',
          createdAt: serverTimestamp(),
        })

        for (const item of items) {
          if (item.id) {
            try {
              await updateDoc(doc(db, 'productos', item.id), {
                stock: increment(-item.cantidad),
                vendidos: increment(item.cantidad),
              })
            } catch (e) {
              console.error('Error actualizando stock:', item.id, e)
            }
          }
        }
      } else {
        await updateDoc(doc(db, 'pedidos', existing.docs[0].id), {
          estado: 'procesando',
        })
      }
    } catch (err) {
      console.error('Error procesando webhook:', err)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}