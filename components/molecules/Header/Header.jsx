'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'
import styles from './Header.module.css'

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const { user, logout } = useAuth()
    const { cartCount } = useCart()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll() // Check initial scroll position

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>AB TATTOO</span>
                    <span className={styles.logoAccent}>SUPPLIES</span>
                </Link>

                {/* Navigation */}
                <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
                    <Link href="/products" className={styles.navLink}>
                        Productos
                    </Link>
                    <Link href="/products?category=tintas" className={styles.navLink}>
                        Tintas
                    </Link>
                    <Link href="/products?category=needles" className={styles.navLink}>
                        Agujas
                    </Link>
                </nav>

                {/* Actions */}
                <div className={styles.actions}>
                    {user ? (
                        <div className={styles.userMenu}>
                            <Link href="/account" className={styles.actionLink}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.actionLink}>
                            Login
                        </Link>
                    )}

                    <Link href="/cart" className={styles.cartLink}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cartCount > 0 && (
                            <span className={styles.cartBadge}>{cartCount}</span>
                        )}
                    </Link>

                    {/* Mobile menu toggle */}
                    <button
                        className={styles.mobileToggle}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`${styles.hamburger} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`} />
                    </button>
                </div>
            </div>
        </header>
    )
}
