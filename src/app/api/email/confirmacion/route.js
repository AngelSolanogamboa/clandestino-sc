import { NextResponse } from 'next/server'
import { emailConfirmacion } from '@/lib/emails/confirmacion'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { nombre, pedidoId, productos, total, email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const html = emailConfirmacion({ nombre, pedidoId, productos, total, email })

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: '¡Tu pedido en Clandestino S.C. está confirmado! 🔥',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}