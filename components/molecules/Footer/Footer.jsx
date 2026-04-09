'use client'

import Link from 'next/link'
import { useNavigation } from '@/lib/context/NavigationContext'
import styles from './Footer.module.css'

export default function Footer() {
    const { navTree } = useNavigation()

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Brand */}
                <div className={styles.brand}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>AB</span>
                        <span className={styles.logoAccent}>TATTOO</span>
                    </Link>
                    <p className={styles.tagline}>
                        Tattoo supplies para profesionales.
                    </p>
                </div>

                {/* Links */}
                <div className={styles.links}>
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Productos</h4>
                        <Link href="/products" className={styles.link}>Todos los productos</Link>
                        {navTree.map(type => (
                            <Link key={type.slug} href={`/products?type=${type.slug}`} className={styles.link}>
                                {type.name}
                            </Link>
                        ))}
                    </div>
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Cuenta</h4>
                        <Link href="/login" className={styles.link}>Iniciar sesión</Link>
                        <Link href="/register" className={styles.link}>Registrarse</Link>
                        <Link href="/account" className={styles.link}>Mi Cuenta</Link>
                        <Link href="/account/orders" className={styles.link}>Pedidos</Link>
                    </div>
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Soporte</h4>
                        <Link href="/contact" className={styles.link}>Contacto</Link>
                        <Link href="/shipping" className={styles.link}>Envío</Link>
                        <Link href="/returns" className={styles.link}>Devoluciones</Link>
                        <Link href="/faq" className={styles.link}>Preguntas Frecuentes</Link>
                    </div>
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Legal</h4>
                        <Link href="/legal#aviso-legal" className={styles.link}>Aviso Legal</Link>
                        <Link href="/legal#privacidad" className={styles.link}>Privacidad</Link>
                        <Link href="/legal#cookies" className={styles.link}>Cookies</Link>
                    </div>
                </div>

                {/* Bottom */}
                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} AB Tattoo Supplies. Todos los derechos reservados.
                    </p>
                    <p className={styles.pro}>
                        Solo para uso profesional
                    </p>
                </div>
            </div>
        </footer>
    )
}
