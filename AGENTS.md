# AGENTS.md: FACET Recursos

Guía para agentes de código (Claude Code, Cursor, etc.). Leé este archivo completo al empezar cada sesión.

## 1. Qué es el proyecto

Aplicación web para estudiantes de la FACET (UNT, Tucumán) que reúne y organiza material de estudio (PDFs, resúmenes, teoría, videos, apuntes y resoluciones de código) por **carrera → año → materia → tipo de recurso**. Los estudiantes pueden aportar material, que un moderador revisa antes de publicar, y ganan puntos y posición en un ranking por carrera.

- **Usuarios:** estudiantes (principalmente desde el celular), ingresantes, colaboradores, moderadores y admin (el dueño del proyecto).
- **Prioridad absoluta del MVP:** que un estudiante encuentre y vea un PDF en menos de 30 segundos y 3 toques. Todo lo demás viene después.
- **Restricción de costos:** el proyecto corre en la PC del dueño (servidor propio, archivos en disco local, sin nube de pago). El diseño debe permitir migrar a un VPS más adelante sin reescribir.

## 2. Cómo trabajar (reglas para el agente)

1. Trabajá **solo en la semana marcada en "Estado actual"** (sección 9). No adelantes tareas de semanas futuras.
2. Antes de programar, proponé un plan de pasos chicos y esperá confirmación si la tarea es ambigua. Si falta información, **preguntá; no inventes**.
3. Cambios pequeños y verificables: un paso por vez, con commits atómicos y mensajes claros (Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`).
4. Después de cada paso: correr `pnpm lint`, `pnpm typecheck` y `pnpm test`, y confirmar que la app levanta.
5. No agregues dependencias nuevas sin explicar por qué y sin confirmación.
6. No toques archivos fuera del alcance de la tarea. Si ves un problema ajeno, mencionalo al final en vez de arreglarlo.
7. Al terminar una tarea, actualizá la checklist de la semana y dejá una nota breve de qué queda pendiente.
8. Seguí las reglas de seguridad de la sección 7 en **todo** el código, sin excepciones.

## 3. Stack

Todo en TypeScript (modo estricto). Lo marcado como *(propuesto)* se puede cambiar con confirmación del dueño.

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite, PWA (`vite-plugin-pwa`) |
| UI | shadcn/ui + Tailwind CSS (mobile first, modo oscuro) |
| Rutas y datos | React Router + TanStack Query |
| Visor PDF | react-pdf (pdf.js) |
| Visor de código | Shiki *(propuesto)* |
| Backend | Node.js + TypeScript con Fastify *(propuesto)* |
| Validación | Zod, con esquemas compartidos entre web y api |
| Base de datos | PostgreSQL + Drizzle ORM *(propuesto)* |
| Auth | Google OAuth con sesiones por cookie httpOnly *(propuesto)* |
| Archivos | Disco local detrás de la interfaz `StorageProvider` |
| Despliegue | Docker Compose + Caddy, publicado con Cloudflare Tunnel |
| Backups | pg_dump + restic/rsync a disco externo |

## 4. Estructura del repositorio

```
/
├─ apps/
│  ├─ web/          # React + Vite
│  └─ api/          # Fastify
├─ packages/
│  └─ shared/       # tipos y esquemas zod compartidos
├─ docs/            # especificaciones por épica y semana
├─ scripts/         # importación desde Drive (rclone), backups, seeds
├─ docker-compose.yml
└─ AGENTS.md
```

Monorepo con **pnpm workspaces**.

## 5. Comandos

```
pnpm install          # instalar dependencias
pnpm dev              # web + api en modo desarrollo
pnpm lint             # ESLint + Prettier
pnpm typecheck        # tsc --noEmit en todos los paquetes
pnpm test             # tests (Vitest)
pnpm db:migrate       # aplicar migraciones
pnpm db:seed          # datos de ejemplo
docker compose up -d  # levantar todo el entorno
```

Si algún comando todavía no existe, crealo como parte de la Semana 1.

## 6. Convenciones de código

- Código, nombres de variables, funciones, tablas y commits en **inglés**. Textos visibles para el usuario en **español rioplatense/argentino** (por ejemplo "Subí tu apunte").
- Componentes en `PascalCase`, hooks `useCamelCase`, archivos de componentes en `PascalCase.tsx`.
- Sin `any`. Los tipos de la API salen de los esquemas Zod de `packages/shared`.
- Componentes chicos, una responsabilidad por componente. Preferir shadcn/ui antes que CSS propio.
- Toda pantalla debe funcionar bien en 360 px de ancho y tener estados de carga, vacío y error.
- Accesibilidad básica: etiquetas, foco visible, contraste suficiente.
- Errores de la API con formato uniforme: `{ error: { code, message } }`.
- Tests para la lógica de negocio (puntos, moderación, permisos) y para los endpoints críticos.

## 7. Seguridad (no negociable)

- **Archivos subidos:** validar tipo por contenido (no solo extensión), limitar tamaño (25 MB por archivo, ajustable), tipos permitidos (PDF, imágenes, ZIP), renombrar con identificador único y calcular SHA-256 (también para detectar duplicados). Nunca ejecutar ni servir archivos como código.
- Guardar los archivos **fuera de cualquier carpeta pública**; se sirven solo a través de la API.
- Escaneo con ClamAV antes de aprobar un aporte *(a partir de la Semana 9)*.
- Rutas protegidas por rol (`user`, `moderator`, `admin`). Verificar permisos en el backend, nunca solo en el frontend.
- Sin contraseñas propias: login con Google. Sesiones con cookie `httpOnly`, `secure`, `sameSite`.
- Protección contra abuso: rate limiting en login, subida y reportes. CORS restringido al dominio propio.
- Variables sensibles solo en `.env` (nunca en el repo). Mantener un `.env.example`.
- Consultas siempre parametrizadas a través del ORM. Escapar toda salida que muestre contenido de usuarios.
- Datos personales mínimos (Ley 25.326). Permitir **alias** en lugar del nombre real en el ranking y borrar la cuenta.
- Respetar derechos de autor: botón "Reportar" en cada recurso y proceso de retiro rápido.

## 8. Modelo de datos (resumen inicial)

- `users`: id, google_id, email, name, last_name, alias, avatar_url, career_id, role, points, created_at
- `careers`: id, name
- `subjects`: id, career_id, year, name, description, prerequisites
- `resources`: id, subject_id, type (`theory`, `summary`, `practice`, `exam`, `video`, `notes`, `code`), title, description, file_id | external_url, author_id, status (`pending`, `approved`, `rejected`), views, created_at
- `files`: id, storage_key, sha256, size, mime_type
- `submissions`: id, resource_id, moderator_id, decision, reason
- `ratings`: user_id, resource_id, useful
- `favorites`: user_id, resource_id
- `reports`: id, resource_id, user_id, reason, status
- `point_events`: id, user_id, resource_id, points, reason, created_at

Los puntos se otorgan **solo cuando un moderador aprueba** el aporte.

## 9. Roadmap semanal

**Estado actual: Semana 1** *(actualizar al terminar cada semana)*

Cada semana tiene un objetivo, tareas y un criterio de "terminado". Al empezar una semana, el dueño te pedirá dividirla en pasos más pequeños. No avances a la siguiente hasta que se cumpla el criterio.

### Semana 1: Base del proyecto
- [ ] Monorepo con pnpm, TypeScript estricto, ESLint y Prettier
- [ ] `apps/web` con Vite, React, Tailwind y shadcn/ui
- [ ] `apps/api` con Fastify y endpoint `GET /health`
- [ ] `docker-compose.yml` con PostgreSQL, api y web
- [ ] `.env.example` y README con instrucciones de arranque

**Terminado cuando:** `docker compose up` levanta todo y la web muestra una pantalla inicial que consulta `/health`.

### Semana 2: Base de datos y catálogo (backend)
- [ ] Esquema Drizzle y migraciones para carreras, materias, recursos y archivos
- [ ] Seed con una carrera, dos materias y recursos de ejemplo
- [ ] Endpoints de lectura: carreras, materias por año, recursos por materia
- [ ] Interfaz `StorageProvider` con implementación `LocalDisk`
- [ ] Script en `scripts/` para importar archivos desde una carpeta local (descargada con rclone) a la estructura de storage

**Terminado cuando:** la API devuelve el catálogo desde la base y los archivos importados quedan guardados con su hash.

### Semana 3: Catálogo (frontend)
- [ ] Pantalla de inicio con selector de carrera
- [ ] Navegación carrera → año → materia → recursos agrupados por tipo
- [ ] Diseño mobile first, modo oscuro, estados de carga, vacío y error
- [ ] Página de materia con descripción y correlatividades

**Terminado cuando:** desde el celular se llega a la lista de recursos de una materia en 3 toques como máximo.

### Semana 4: Visor de PDFs y videos
- [ ] Endpoint que sirve archivos desde el storage con control de acceso
- [ ] Visor de PDF embebido con descarga y contador de vistas
- [ ] Videos con enlace de YouTube embebido
- [ ] Indicador de "nuevo" y "actualizado"

**Terminado cuando:** un PDF se ve dentro de la app en menos de 3 segundos en conexión móvil normal.

> **Hito:** mostrarle la app a 5 o 10 compañeros y juntar feedback antes de seguir.

### Semana 5: Búsqueda y filtros
- [ ] Búsqueda global por título, materia y tipo
- [ ] Filtros combinables: carrera, año, materia, tipo, cuatrimestre
- [ ] Orden por recientes, más vistos y mejor valorados

**Terminado cuando:** se encuentra un recurso por nombre en menos de 30 segundos.

### Semana 6: Usuarios y administración mínima
- [ ] Login con Google y sesiones seguras
- [ ] Perfil: nombre, apellido, alias, foto, carrera
- [ ] Roles (`user`, `moderator`, `admin`) con permisos en el backend
- [ ] Favoritos
- [ ] Panel de admin mínimo para cargar y editar recursos

**Terminado cuando:** un usuario inicia sesión, guarda favoritos y el admin puede cargar un recurso desde el panel.

### Semana 7: Despliegue y lanzamiento beta (cierre del MVP)
- [ ] Caddy y Cloudflare Tunnel con dominio propio y HTTPS
- [ ] Arranque automático tras reinicios o cortes de luz
- [ ] Backups automáticos de la base de datos y los archivos, con restauración probada
- [ ] Monitoreo con alerta al celular
- [ ] Política de privacidad, términos y botón de reportar
- [ ] Lanzamiento con 2 o 3 materias populares de primer año

**Terminado cuando:** la app es accesible por internet con el dominio propio y se restaura un backup con éxito.

### Semana 8: Programación con enunciados y resoluciones
- [ ] Definir la estructura del repo de GitHub (`materia/practico-N/ejercicio-M/` con archivo de metadatos)
- [ ] Sincronización con la API de GitHub
- [ ] Vista del enunciado en PDF con la resolución de cada punto, con resaltado de sintaxis
- [ ] Botones "Ver en GitHub" y "Copiar código", y resolución plegada por defecto

**Terminado cuando:** un práctico completo se ve con su enunciado y la resolución de cada punto.

### Semanas 9 y 10: Aportes y moderación
- [ ] Formulario de aporte (archivo o enlace, carrera, materia, año, tipo, título, descripción)
- [ ] Estados `pending`, `approved`, `rejected` con motivo
- [ ] Panel de moderación con cola, vista previa y decisión
- [ ] Detección de duplicados por hash
- [ ] Escaneo con ClamAV y botón "Reportar"

**Terminado cuando:** un usuario sube un aporte, un moderador lo aprueba y aparece publicado.

### Semanas 11 y 12: Puntos y ranking
- [ ] Reglas de puntos, otorgados solo tras la aprobación
- [ ] Valoraciones de utilidad con topes y reglas anti-abuso
- [ ] Ranking por carrera, por materia y por cuatrimestre, con opción de alias
- [ ] Niveles e insignias básicas

**Terminado cuando:** un aporte aprobado suma puntos y el usuario aparece en el ranking de su carrera.

### Después
Sección para ingresantes, calendario académico, banco de parciales, donaciones y plan premium, y migración a VPS según los disparadores de la sección 10.

## 10. Hosting local y migración

- El servidor corre en la PC del dueño. Todo debe quedar en contenedores para poder moverlo.
- Videos: nunca alojarlos en el servidor, solo enlaces a YouTube.
- Acceder al disco **siempre** a través de `StorageProvider`, para poder pasar a S3 o Cloudflare R2 cambiando la implementación.
- Migrar a un hosting pago cuando: los ingresos cubran un VPS básico, haya más de dos caídas por cuatrimestre, o la subida de internet se sature.

## 11. Fuera de alcance por ahora

App nativa iOS/Android (la PWA alcanza), chat o red social propia, marketplace de clases particulares, expansión a otras facultades y búsqueda dentro del contenido de los PDFs.

## 12. Decisiones pendientes (no asumir, preguntar al dueño)

- Backend definitivo (Fastify propuesto) y librería de autenticación.
- Sistema operativo del servidor (Windows o Linux) y cómo se ejecutará Docker.
- Cantidad y peso total de los archivos actuales, para dimensionar el disco.
- Política exacta de contenido aceptable (derechos de autor) y licencia de los aportes.
- Si el ranking muestra nombre real o solo alias por defecto.
