import 'leaflet/dist/leaflet.css';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';

export const metadata = {
  title: 'Smart House Rent — Precision Spatial House Search in Dhaka',
  description:
    'Web-Based Smart House Rent Management System with precise latitude/longitude storage, 500m/1000m radius proximity search, NID verification, and interactive map.',
  keywords: ['House Rent Dhaka', 'Apartment Rent', 'Spatial Radius Search', 'Uttara', 'Mirpur', 'Dhanmondi'],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-text antialiased selection:bg-primary selection:text-on-primary">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            <SmoothScrollProvider>
              <ScrollProgress />
              <Navbar />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
            </SmoothScrollProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
