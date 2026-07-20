import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'SIIH - Sistema Integrado de Información Hospitalaria',
  description: 'Gestión hospitalaria para la Clínica San Andrés',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground selection:bg-primary/30`}>
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-medical-500)',
                secondary: 'var(--card)',
              },
            },
          }} 
        />
      </body>
    </html>
  );
}
