'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'
import { getCategories } from '@/lib/api/medusa'
import styles from './Header.module.css'

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [navItems, setNavItems] = useState([])
    const [mobileOpenSections, setMobileOpenSections] = useState({})
    const { user, logout } = useAuth()
    const { cartCount } = useCart()
    const dropdownTimeout = useRef(null)

    // Fetch categories from Medusa and build nav structure
    useEffect(() => {
        let cancelled = false

        async function loadNavigation() {
            try {
                const categories = await getCategories()
                if (cancelled) return

                // Parent categories (no parent) become main nav items
                // Their children become dropdown sub-items
                const parentCategories = categories.filter(
                    cat => !cat.parent_category_id && !cat.parent_category
                )

                const items = parentCategories.map(parent => {
                    const children = parent.category_children || []

                    // Build subcategories: first item = "All" link, then children
                    const subcategories = [
                        {
                            label: `Tod${getArticle(parent.name)} ${parent.name}`,
                            href: `/products?category=${parent.handle}`,
                        },
                        ...children.map(child => ({
                            label: child.name,
                            href: `/products?category=${child.handle}`,
                        })),
                    ]

                    return {
                        label: parent.name,
                        href: `/products?category=${parent.handle}`,
                        subcategories: subcategories.length > 1 ? subcategories : null,
                    }
                })

                setNavItems(items)
            } catch (error) {
                console.error('Error loading navigation categories:', error)
            }
        }

        loadNavigation()
        return () => { cancelled = true }
    }, [])

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
        setMobileOpenSections({})
    }

    const toggleMobileSection = (index) => {
        setMobileOpenSections(prev => ({
            ...prev,
            [index]: !prev[index],
        }))
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

                    {navItems.map((item, index) => (
                        <div
                            key={item.label}
                            className={styles.navDropdown}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Link href={item.href} className={styles.navLink} onClick={closeAll}>
                                {item.label}
                                {item.subcategories && (
                                    <svg
                                        className={styles.chevron}
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        onClick={(e) => {
                                            // On mobile, toggle section instead of navigating
                                            if (window.innerWidth <= 768) {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                toggleMobileSection(index)
                                            }
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                )}
                            </Link>

                            {item.subcategories && (
                                <div className={`${styles.dropdown} ${
                                    activeDropdown === index || mobileOpenSections[index]
                                        ? styles.dropdownOpen
                                        : ''
                                }`}>
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

/**
 * Helper: returns the correct Spanish article suffix for "Todos/Todas las X"
 * Simple heuristic: words ending in 'a' or 'as' use feminine
 */
function getArticle(name) {
    const lower = name.toLowerCase().trim()
    if (lower.endsWith('as') || lower.endsWith('a')) return 'as las'
    return 'os los'
}
