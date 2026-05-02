# ⚽ Álbum Mundial 2026

App para organizar tu álbum de figuritas del Mundial 2026.  
**Base de datos:** Supabase · **Hosting:** Cloudflare Pages

---

## Paso 1 — Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta gratuita.
2. Hacé clic en **New project**.
3. Completá: nombre del proyecto, contraseña de base de datos, región (elegí la más cercana a Uruguay, por ejemplo `São Paulo`).
4. Esperá ~2 minutos a que el proyecto se inicialice.

---

## Paso 2 — Crear las tablas

1. En el dashboard de Supabase, andá a **SQL Editor** → **New query**.
2. Copiá y pegá el contenido completo del archivo `supabase/schema.sql`.
3. Hacé clic en **Run** (o `Ctrl+Enter`).
4. Deberías ver el mensaje `Success. No rows returned`.

---

## Paso 3 — Obtener las credenciales de Supabase

1. En Supabase, andá a **Settings** → **API**.
2. Copiá:
   - **Project URL** (algo como `https://abcdefghij.supabase.co`)
   - **anon / public key** (empieza con `eyJ...`)

---

## Paso 4 — Subir el código a GitHub

1. Creá un repositorio nuevo en [github.com](https://github.com).
2. Subí todos los archivos de esta carpeta a ese repositorio.  
   Podés usar GitHub Desktop o la web de GitHub directamente.
3. **No subas el archivo `.env`** (ya está en `.gitignore`).

---

## Paso 5 — Conectar con Cloudflare Pages

1. Entrá a [pages.cloudflare.com](https://pages.cloudflare.com) y creá una cuenta gratuita.
2. Hacé clic en **Create a project** → **Connect to Git**.
3. Autorizá GitHub y seleccioná el repositorio que creaste.
4. Configuración del build:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Antes de hacer el deploy, andá a **Environment variables** y agregá:
   ```
   VITE_SUPABASE_URL    =  https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
6. Hacé clic en **Save and Deploy**.

En unos minutos vas a tener tu app en una URL como `album-mundial.pages.dev`.

---

## Desarrollo local (opcional)

Si querés probar la app en tu computadora antes de deployar:

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env con tus credenciales
cp .env.example .env
# Editá .env con tus datos de Supabase

# 3. Iniciar el servidor de desarrollo
npm run dev
# Abre http://localhost:5173
```

---

## Estructura del proyecto

```
album-mundial-2026/
├── index.html               ← Entrada HTML
├── vite.config.js           ← Configuración de Vite
├── package.json             ← Dependencias
├── .env.example             ← Template de variables de entorno
├── .gitignore
├── supabase/
│   └── schema.sql           ← Script para crear las tablas en Supabase
└── src/
    ├── main.jsx             ← Punto de entrada React
    ├── App.jsx              ← Toda la UI de la app
    └── lib/
        ├── supabase.js      ← Cliente de Supabase
        └── db.js            ← Funciones de base de datos
```

---

## Notas de seguridad

- Las contraseñas se hashean con **SHA-256** en el navegador antes de enviarse a la base de datos. Nunca viajan ni se guardan en texto plano.
- Las políticas de Row Level Security (RLS) en Supabase permiten leer datos de otros usuarios (necesario para el sistema de intercambios). Esto es intencional para una app comunitaria.
- Si en el futuro querés mayor seguridad, podés migrar a Supabase Auth con email/contraseña.
