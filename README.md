# Adivina el Número

Aplicación web interactiva para jugar a adivinar un número secreto, construida con Next.js. Incluye configuraciones dinámicas, niveles de dificultad, historial de intentos, persistencia local y almacenamiento de sesiones en archivos JSON.

## Instrucciones

1. Ejecuta `npm install`.
2. Inicia la aplicación con `npm run dev`.
3. Abre `http://localhost:3000` en un navegador moderno.
4. Selecciona un nivel de dificultad o ajusta manualmente el rango y los intentos.
5. Ingresa un número y presiona `Ejecutar intento`.
6. El sistema indicará si debes probar más alto o más bajo.
7. Si agotas los intentos, el juego mostrará la respuesta correcta.

## Características

- Next.js con React
- Almacenamiento local en archivos JSON para guardar partidas
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
- Inicia en modo desarrollo: `npm run dev`
- Construye para producción: `npm run build`
- Inicia en producción: `npm run start`
