import './globals.css';

export const metadata = {
  title: 'Número Misterioso',
  description: 'Juego de adivinar el número con Next.js y PostgreSQL.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
