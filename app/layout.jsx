import './globals.css'
import { CartProvider } from '@/lib/context/CartContext'
import { AuthProvider } from '@/lib/context/AuthContext'

export const metadata = {
    title: 'AB-Tattoo - Professional Tattoo Supplies',
    description: 'Premium tattoo supplies for professional artists. Quality inks, needles, machines, and equipment.',
    keywords: 'tattoo supplies, tattoo ink, tattoo needles, tattoo machines, professional tattoo equipment',
}

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AuthProvider>
                    <CartProvider>
                        {children}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
