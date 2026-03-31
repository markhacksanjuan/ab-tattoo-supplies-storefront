'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'
import styles from './Header.module.css'

// Estructura de navegación estática basada en la jerarquía de productos
// Types (navbar) → Categories (dropdown)
const NAV_ITEMS = [
    {
        label: 'Agujas',
        href: '/products?type=agujas',
        subcategories: [
            { label: 'Todas las Agujas', href: '/products?type=agujas' },
            { label: 'Round Liner (RL)', href: '/products?category=round-liner' },
            { label: 'Round Shader (RS)', href: '/products?category=round-shader' },
            { label: 'Magnum (M1)', href: '/products?category=magnum' },
            { label: 'Curved Magnum (CM)', href: '/products?category=curved-magnum' },
            { label: 'Long Taper', href: '/products?category=long-taper' },
        ],
    },
    {
        label: 'Tintas',
        href: '/products?type=tintas',
        subcategories: [
            { label: 'Todas las Tintas', href: '/products?type=tintas' },
            { label: 'Tintas Color', href: '/products?category=tintas-color' },
            { label: 'Negro y Grises', href: '/products?category=tintas-negro' },
            { label: 'Blancos', href: '/products?category=tintas-blanco' },
            { label: 'Sets de Tintas', href: '/products?category=sets-tintas' },
        ],
    },
    {
        label: 'Material',
        href: '/products?type=material',
        subcategories: [
            { label: 'Todo el Material', href: '/products?type=material' },
            { label: 'Desechables', href: '/products?category=desechables' },
            { label: 'Jabones', href: '/products?category=jabones' },
            { label: 'Cremas', href: '/products?category=cremas' },
            { label: 'Vaselinas', href: '/products?category=vaselinas' },
            { label: 'Stencil', href: '/products?category=stencil' },
            { label: 'Desinfectantes', href: '/products?category=desinfectantes' },
            { label: 'Cups', href: '/products?category=cups' },
            { label: 'Accesorios', href: '/products?category=accesorios-tatuaje' },
            { label: 'Curación', href: '/products?category=curacion' },
        ],
    },
]

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)
    const { user, logout } = useAuth()
    const { cartCount } = useCart()
    const dropdownTimeout = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleMouseEnter = (index) => {
        clearTimeout(dropdownTimeout.current)
        setActiveDropdown(index)
    }

    const handleMouseLeave = () => {
        dropdownTimeout.current = setTimeout(() => {
            setActiveDropdown(null)
        }, 150)
    }

    const closeAll = () => {
        setActiveDropdown(null)
        setMobileMenuOpen(false)
    }

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
                    <Link href="/products" className={styles.navLink} onClick={closeAll}>
                        Todos
                    </Link>

                    {NAV_ITEMS.map((item, index) => (
                        <div
                            key={item.label}
                            className={styles.navDropdown}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Link href={item.href} className={styles.navLink} onClick={closeAll}>
                                {item.label}
                                <svg className={styles.chevron} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </Link>

                            {item.subcategories && (
                                <div className={`${styles.dropdown} ${activeDropdown === index ? styles.dropdownOpen : ''}`}>
                                    {item.subcategories.map((sub) => (
                                        <Link
                                            key={sub.href}
                                            href={sub.href}
                                            className={styles.dropdownItem}
                                            onClick={closeAll}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
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
