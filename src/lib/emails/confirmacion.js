export function emailConfirmacion({ nombre, pedidoId, productos, total, email }) {
  const itemsHtml = productos.map(p => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f5; font-size: 14px;">
        ${p.nombre} ${p.variante ? `<span style="color: #888; font-size: 12px;">(${p.variante})</span>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f5; font-size: 14px; text-align: center;">
        ×${p.cantidad}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #FF5B00; font-size: 14px; text-align: right; font-weight: 700;">
        $${(p.precio * p.cantidad).toFixed(2)}
      </td>
    </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pedido confirmado — Clandestino S.C.</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #FF5B00; font-size: 28px; margin: 0; letter-spacing: 4px; text-transform: uppercase;">
        CLANDESTINO
      </h1>
      <p style="color: #888; font-size: 12px; letter-spacing: 6px; text-transform: uppercase; margin: 4px 0 0;">
        S.C.
      </p>
    </div>

    <!-- Card principal -->
    <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden;">

      <!-- Banner -->
      <div style="background-color: #FF5B00; padding: 24px 32px;">
        <h2 style="color: #0a0a0a; margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
          ¡Pedido confirmado!
        </h2>
        <p style="color: rgba(0,0,0,0.6); margin: 4px 0 0; font-size: 13px;">
          Gracias por tu compra, ${nombre || 'amigo/a'}.
        </p>
      </div>

      <!-- Contenido -->
      <div style="padding: 32px;">

        <!-- ID del pedido -->
        <div style="background-color: #0a0a0a; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <p style="color: #888; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px;">
            Número de pedido
          </p>
          <p style="color: #FF5B00; font-size: 14px; font-weight: 700; font-family: monospace; margin: 0; letter-spacing: 2px;">
            ${pedidoId.slice(-16).toUpperCase()}
          </p>
        </div>

        <!-- Productos -->
        <h3 style="color: #f5f5f5; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px;">
          Tu pedido
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="color: #888; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: left; padding-bottom: 8px; border-bottom: 1px solid #2a2a2a;">Producto</th>
              <th style="color: #888; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: center; padding-bottom: 8px; border-bottom: 1px solid #2a2a2a;">Cant.</th>
              <th style="color: #888; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; text-align: right; padding-bottom: 8px; border-bottom: 1px solid #2a2a2a;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Total -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #FF5B00;">
          <span style="color: #f5f5f5; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total pagado</span>
          <span style="color: #FF5B00; font-weight: 900; font-size: 22px;">$${total.toFixed(2)} MXN</span>
        </div>

        <!-- Mensaje -->
        <div style="margin-top: 32px; padding: 20px; background-color: #0a0a0a; border-radius: 8px; border-left: 3px solid #FF5B00;">
          <p style="color: #888; font-size: 13px; line-height: 1.8; margin: 0;">
            Estamos procesando tu pedido. Te contactaremos pronto con los detalles de envío. 
            Si tienes alguna duda escríbenos a través de Instagram 
            <a href="https://instagram.com/clandestino.s.c" style="color: #FF5B00; text-decoration: none;">@clandestino.s.c</a>
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #444; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">
        Clandestino S.C. · Tuxtla Gutiérrez, Chiapas, México
      </p>
      <p style="color: #333; font-size: 11px; margin-top: 8px;">
        Este correo fue enviado a ${email} porque realizaste una compra en nuestra tienda.
      </p>
    </div>

  </div>
</body>
</html>
  `
  return html
}