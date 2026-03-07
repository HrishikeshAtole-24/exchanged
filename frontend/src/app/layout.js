import '@/lib/fontawesome';
import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'exchanged — Crypto Intelligence Platform',
  description:
    'Real-time cryptocurrency market data, portfolio tracking, and price alerts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Header />
        <main className="page-wrapper">
          <div className="container page-content">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
