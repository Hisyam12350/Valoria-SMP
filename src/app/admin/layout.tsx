import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - VALORIA SMP',
  description: 'Panel Administrasi VALORIA SMP',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0a1a', color: 'white' }}>
        {children}
      </body>
    </html>
  );
}
