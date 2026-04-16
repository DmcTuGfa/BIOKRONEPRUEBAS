# BIOKRONE E-Commerce — Guía de despliegue completa

## Stack
- **Next.js 14** + TypeScript
- **Neon Postgres** + Prisma ORM
- **Stripe Checkout** (sesiones seguras, total calculado en backend)
- **Resend** para emails transaccionales
- **JWT** con `jose` para autenticación (httpOnly cookies)
- Deploy en **Vercel** o **Railway**

---

## 1. Neon Postgres

1. Crea cuenta en [neon.tech](https://console.neon.tech)
2. Crea un proyecto → elige región más cercana (US East 2 recomendado para México)
3. En **Dashboard → Connection details**, copia:
   - **Connection string (pooled)** → `DATABASE_URL`
   - **Connection string (direct)** → `DIRECT_URL`
4. Agrega `?sslmode=require&pgbouncer=true&connect_timeout=15` al `DATABASE_URL`
5. Agrega `?sslmode=require` al `DIRECT_URL`

---

## 2. Variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus valores reales
```

Genera un JWT_SECRET seguro:
```bash
openssl rand -hex 64
```

---

## 3. Base de datos — migraciones

```bash
npm install

# Genera el cliente de Prisma
npm run db:generate

# Aplica el schema a Neon
npx prisma db push

# Carga los productos iniciales
npm run db:seed
# Si psql no está disponible, ejecuta el contenido de prisma/seed.sql
# directamente en la consola SQL de Neon
```

---

## 4. Stripe

### Claves de API
1. Ve a [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copia `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copia `Secret key` → `STRIPE_SECRET_KEY`
4. Usa ambas del mismo modo: `pk_test` con `sk_test`, o `pk_live` con `sk_live`.

### Webhook
1. Ve a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. URL: `https://tudominio.com/api/webhooks/stripe`
4. Selecciona eventos:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET`

Para pruebas locales:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 5. Resend (emails)

1. Crea cuenta en [resend.com](https://resend.com) (gratis hasta 3,000/mes)
2. Crea una API Key → `RESEND_API_KEY`
3. Verifica tu dominio en Resend para evitar spam
4. Actualiza `EMAIL_FROM` con tu dominio verificado

---

## 6. Deploy en Vercel

```bash
npm i -g vercel
vercel
```

En el dashboard de Vercel → **Settings → Environment Variables**, agrega todas las variables del `.env.example`.

Después del primer deploy, ejecuta las migraciones:
```bash
# Localmente apuntando a Neon
npx prisma db push
npm run db:seed
```

---

## 7. Deploy en Railway

1. Conecta tu repo en [railway.app](https://railway.app)
2. En **Variables**, agrega todas las del `.env.example`
3. En **Settings → Deploy**:
   - Build command: `npm install && npm run db:generate && npm run build`
   - Start command: `npm start`
4. Railway auto-despliega en cada push

---

## 8. Primer admin

Después de registrarte con tu correo, ejecuta en la consola SQL de Neon:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu@correo.com';
```

---

## Seguridad implementada

| Característica | Implementación |
|---|---|
| Total calculado en backend | `POST /api/checkout/create-session` calcula desde DB |
| Stock reservado antes de pago | Transacción atómica en Prisma |
| Stock restaurado si falla | Webhook `checkout.session.expired` |
| Pedido nunca marcado desde frontend | Solo el webhook `checkout.session.completed` |
| Folio único consecutivo | `OrderCounter` atómico en DB |
| Passwords hasheadas | Web Crypto SHA-256 + salt |
| Sesiones httpOnly | JWT en cookie `bk_session` |
| Rutas protegidas | Middleware verifica JWT |
| Admin separado | Rol `ADMIN` verificado en backend |
| Idempotencia webhook | Verifica `order.status === "PAID"` |

---

## Estructura del proyecto

```
app/
  api/
    auth/           # register, login, logout, me, verify-email, forgot/reset-password
    checkout/       # create-session (calcula total en backend)
    orders/         # historial de usuario
    products/       # catálogo desde DB
    admin/          # gestión admin (protegido)
    webhooks/stripe # actualiza estado de pago
  auth/             # páginas de autenticación
  tienda/           # catálogo, producto, checkout, success
  cuenta/           # historial de pedidos
  admin/            # panel de administración
lib/
  prisma.ts         # cliente Prisma
  auth.ts           # JWT, hash, cookies
  folio.ts          # generador BIO-ORD-XXXXXX
  email.ts          # Resend + templates
prisma/
  schema.prisma     # schema completo
  seed.sql          # productos iniciales
middleware.ts       # protección de rutas
```


## Deploy en Railway

Variables mínimas:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Build Command recomendado:

```bash
npm install && npm run build
```

Start Command recomendado:

```bash
npm start
```


## Deploy en Railway + Neon

Usa en Railway:

- Build Command: `npm install && npm run build`
- Start Command: `npm start`

No metas `prisma db push` en build. Si la base ya está conectada, inicialízala manualmente una sola vez con:

```bash
npm run db:init
```

Si Neon falla o está dormido, el sitio puede arrancar pero las rutas que dependan de BD no responderán hasta que la conexión quede bien.
