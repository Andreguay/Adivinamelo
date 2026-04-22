# Adivina el Número

Aplicación web interactiva para jugar a adivinar un número secreto, construida con Next.js y PostgreSQL. Incluye configuraciones dinámicas, niveles de dificultad, historial de intentos, persistencia local y almacenamiento de sesiones en la base de datos.

## Instrucciones

1. Copia `.env.example` a `.env` y actualiza `DATABASE_URL` con tu conexión a PostgreSQL.
2. Ejecuta `npm install`.
3. Crea la tabla ejecutando `psql < db/schema.sql` o usando tu herramienta preferida.
4. Inicia la aplicación con `npm run dev`.
5. Abre `http://localhost:3000` en un navegador moderno.
6. Selecciona un nivel de dificultad o ajusta manualmente el rango y los intentos.
7. Ingresa un número y presiona `Ejecutar intento`.
8. El sistema indicará si debes probar más alto o más bajo.
9. Si agotas los intentos, el juego mostrará la respuesta correcta.

## Características

- Next.js con React
- PostgreSQL para guardar partidas
- API routes para resultados y estadísticas globales
- Rango dinámico de número secreto
- Intentos limitados configurables
- Feedback de mayor/menor
- Historial de intentos
- Puntuación y mejor marca guardada en `localStorage`
- Modo oscuro/claro
- Interfaz responsiva y moderna

## Despliegue

- Instala dependencias: `npm install`
- Crea la base de datos y ejecuta `db/schema.sql`
- Define `DATABASE_URL` en `.env`
- Inicia en modo desarrollo: `npm run dev`
- Construye para producción: `npm run build`
- Inicia en producción: `npm run start`
