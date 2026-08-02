import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    // Inicializar Stripe dentro de la función
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const { items, email } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío.' }, { status: 400 })
    }

    const line_items = items.map(item => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: item.nombre,
          description: item.variante ? `Variante: ${item.variante}` : undefined,
          images: item.foto ? [item.foto] : [],
        },
        unit_amount: Math.round(item.precio * 100),
      },
      quantity: item.cantidad,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email || undefined,
      client_reference_id: req.headers.get('x-user-id') || undefined,
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
      metadata: {
        items: JSON.stringify(items.map(i => ({
          id: i.id,
          nombre: i.nombre,
          cantidad: i.cantidad,
          variante: i.variante || '',
          autorId: i.autorId || '',
        }))),
      },
      locale: 'es',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}