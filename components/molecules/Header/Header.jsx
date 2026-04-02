'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'
import { PRODUCT_TYPES, enrichWithApiData } from '@/lib/data/navigation'
import { getProductTypes } from '@/lib/api/medusa'
import { SEARCH_MIN_LENGTH } from '@/lib/config'
import styles from './Header.module.css'

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [mobileOpenSections, setMobileOpenSections] = useState({})
    const { user } = useAuth()
    const { cartCount } = useCart()
    const dropdownTimeout = useRef(null)
    const enrichedRef = useRef(false)

    // Enrich type IDs from API in background — no setState, no re-render
    useEffect(() => {
        if (enrichedRef.current) return
        enrichedRef.current = true
        enrichWithApiData(getProductTypes)
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        const html = document.documentElement
        const body = document.body
        if (mobileMenuOpen) {
            html.style.overflow = 'hidden'
            body.style.overflow = 'hidden'
            html.style.position = 'fixed'
            html.style.width = '100%'
            html.style.height = '100%'
        } else {
            html.style.overflow = ''
            body.style.overflow = ''
            html.style.position = ''
            html.style.width = ''
            html.style.height = ''
        }
        return () => {
            html.style.overflow = ''
            body.style.overflow = ''
            html.style.position = ''
            html.style.width = ''
            html.style.height = ''
        }
    }, [mobileMenuOpen])

    const handleMouseEnter = (index) => {
        if (window.innerWidth <= 768) return
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

    // Build dropdown content for a type
    const renderDropdownContent = (type) => {
        // Material has grouped categories
        if (type.categoryGroups) {
            return (
                <>
                    <Link
                        href={`/products?type=${type.slug}`}
                        className={styles.dropdownItem}
                        onClick={closeAll}
                    >
                        Todo {type.value}
                    </Link>
                    <div className={styles.dropdownDivider} />

                    {type.categoryGroups.map((group, gi) => (
                        <div key={group.groupLabel} className={styles.dropdownSection}>
                            <span className={styles.dropdownSectionTitle}>
                                {group.groupLabel}
                            </span>
                            {group.categories.map((cat) => (
                                <Link
                                    key={cat.handle}
                                    href={`/products?type=${type.slug}&category=${cat.handle}`}
                                    className={styles.dropdownItem}
                                    onClick={closeAll}
                                >
                                    {cat.label}
                                </Link>
                            ))}
                            {gi < type.categoryGroups.length - 1 && (
                                <div className={styles.dropdownDivider} />
                            )}
                        </div>
                    ))}
                </>
            )
        }

        // Agujas & Tintas — flat categories + brands section
        return (
            <>
                <Link
                    href={`/products?type=${type.slug}`}
                    className={styles.dropdownItem}
                    onClick={closeAll}
                >
                    {getArticlePrefix(type.value)} {type.value}
                </Link>
                <div className={styles.dropdownDivider} />
                {type.categories.map((cat) => (
                    <Link
                        key={cat.handle}
                        href={`/products?type=${type.slug}&category=${cat.handle}`}
                        className={styles.dropdownItem}
                        onClick={closeAll}
                    >
                        {cat.label}
                    </Link>
                ))}
                {type.brands.length > 0 && (
                    <>
                        <div className={styles.dropdownDivider} />
                        <span className={styles.dropdownSectionTitle}>Marcas</span>
                        {type.brands.map((brand) => (
                            <Link
                                key={brand.handle}
                                href={`/products?type=${type.slug}&collection=${brand.handle}`}
                                className={styles.dropdownItem}
                                onClick={closeAll}
                            >
                                {brand.label}
                            </Link>
                        ))}
                    </>
                )}
            </>
        )
    }

    return (
        <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>AB TATTOO</span>
                    <span className={styles.logoAccent}>SUPPLIES</span>
                </Link>

                {/* Navigation — rendered from static PRODUCT_TYPES (no API wait) */}
                <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
                    <Link href="/products" className={styles.navLink} onClick={closeAll}>
                        Todos
                    </Link>

                    {PRODUCT_TYPES.map((type, index) => (
                        <div
                            key={type.slug}
                            className={styles.navDropdown}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Link
                                href={`/products?type=${type.slug}`}
                                className={styles.navLink}
                                onClick={(e) => {
                                    // On mobile: toggle dropdown instead of navigating
                                    if (window.innerWidth <= 768) {
                                        e.preventDefault()
                                        toggleMobileSection(index)
                                    } else {
                                        closeAll()
                                    }
                                }}
                            >
                                {type.value}
                                <svg
                                    className={`${styles.chevron} ${mobileOpenSections[index] ? styles.chevronOpen : ''}`}
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </Link>

                            <div className={`${styles.dropdown} ${
                                type.categoryGroups ? styles.dropdownWide : ''
                            } ${
                                activeDropdown === index || mobileOpenSections[index]
                                    ? styles.dropdownOpen
                                    : ''
                            }`}>
                                {renderDropdownContent(type)}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Actions — order: Search · Cart · User · Mobile toggle */}
                <div className={styles.actions}>
                    {/* Desktop search pill */}
                    <form
                        className={styles.searchForm}
                        onSubmit={(e) => {
                            e.preventDefault()
                            const q = e.target.elements.q.value.trim()
                            if (q.length >= SEARCH_MIN_LENGTH) {
                                e.target.elements.q.value = ''
                                closeAll()
                                window.location.href = `/products?q=${encodeURIComponent(q)}`
                            }
                        }}
                    >
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            name="q"
                            placeholder="Buscar productos…"
                            className={styles.searchInput}
                            autoComplete="off"
                        />
                    </form>

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
 * Helper: returns the correct Spanish prefix for "Todas/Todos los/las X"
 * Simple heuristic: words ending in 'a' or 'as' use feminine
 */
function getArticlePrefix(name) {
    const lower = name.toLowerCase().trim()
    if (lower.endsWith('as') || lower.endsWith('a')) return 'Todas las'
    return 'Todo'
}
