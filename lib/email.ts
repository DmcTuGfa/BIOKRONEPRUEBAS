/**
 * Email sending utility.
 * Uses Resend (or any SMTP via nodemailer).
 * Set RESEND_API_KEY in env, or swap for your provider.
 */

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — email not sent:", subject, "to", to)
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "BIOKRONE <noreply@biokrone.com>",
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[email] Failed to send:", err)
  }
}

export function verifyEmailTemplate(name: string, link: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h2 style="color:#16a34a">Verifica tu correo — BIOKRONE</h2>
      <p>Hola ${name},</p>
      <p>Haz clic en el botón para verificar tu correo:</p>
      <a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
        Verificar correo
      </a>
      <p style="color:#6b7280;font-size:12px;margin-top:24px">Este enlace expira en 24 horas. Si no creaste una cuenta, ignora este correo.</p>
    </div>`
}

export function resetPasswordTemplate(name: string, link: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h2 style="color:#16a34a">Restablecer contraseña — BIOKRONE</h2>
      <p>Hola ${name},</p>
      <p>Solicitaste restablecer tu contraseña. Haz clic aquí:</p>
      <a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
        Restablecer contraseña
      </a>
      <p style="color:#6b7280;font-size:12px;margin-top:24px">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
    </div>`
}

export function orderConfirmationTemplate(folio: string, items: { name: string; quantity: number; priceMxn: number }[], totalMxn: number) {
  const rows = items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${(i.priceMxn/100).toFixed(2)}</td></tr>`).join("")
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h2 style="color:#16a34a">¡Pedido confirmado! — ${folio}</h2>
      <p>Tu pago fue procesado con éxito.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead><tr style="background:#f3f4f6"><th>Producto</th><th>Qty</th><th>Precio</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><strong>Total: $${(totalMxn/100).toFixed(2)} MXN</strong></p>
      <p>Tu pedido será enviado pronto. Puedes ver tu historial en tu cuenta.</p>
    </div>`
}
