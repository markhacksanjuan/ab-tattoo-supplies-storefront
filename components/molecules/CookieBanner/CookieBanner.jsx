'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './CookieBanner.module.css'

export default function CookieBanner() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent')
        if (!consent) {
            // Small delay to avoid layout shift on page load
            const timer = setTimeout(() => setVisible(true), 500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAcceptAll = () => {
        localStorage.setItem('cookie_consent', 'all')
        setVisible(false)
    }

    const handleNecessaryOnly = () => {
        localStorage.setItem('cookie_consent', 'necessary')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className={styles.banner} role="dialog" aria-label="Consentimiento de cookies">
            <div className={styles.container}>
                <p className={styles.text}>
                    Utilizamos cookies propias y de terceros para el funcionamiento de la web, 
                    el procesamiento de pagos y el inicio de sesión.{' '}
                    <Link href="/legal#cookies" className={styles.link}>
                        Más información
                    </Link>
                </p>
                <div className={styles.actions}>
                    <button
                        onClick={handleNecessaryOnly}
                        className={styles.secondaryButton}
                    >
                        Solo necesarias
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className={styles.primaryButton}
                    >
                        Aceptar cookies
                    </button>
                </div>
            </div>
        </div>
    )
}
