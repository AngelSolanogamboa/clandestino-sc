import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection, addDoc, query, where,
  getDocs, updateDoc, doc, serverTimestamp, increment
} from 'firebase/firestore'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    try {
      // Verificar que no guardamos este pedido ya
      const q = query(
        collection(db, 'pedidos'),
        where('sessionId', '==', session.id)
      )
      const existing = await getDocs(q)

      if (existing.empty) {
        // Parsear items del metadata
        const items = JSON.parse(session.metadata?.items || '[]')

        // Guardar pedido confirmado
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

        // Reducir stock de cada producto
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
        // Si ya existe, solo actualizar estado
        const pedidoDoc = existing.docs[0]
        await updateDoc(doc(db, 'pedidos', pedidoDoc.id), {
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

export const config = {
  api: { bodyParser: false },
}