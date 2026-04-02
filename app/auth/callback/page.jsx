'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { AUTH_CALLBACK_TIMEOUT_MS } from '@/lib/config'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import styles from './page.module.css'

export default function AuthCallbackPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [timedOut, setTimedOut] = useState(false)

    // Redirect once auth resolves
    useEffect(() => {
        if (!loading && user) {
            router.replace('/account')
        }
    }, [loading, user, router])

    // Safety timeout — if auth never resolves, send back to login
    useEffect(() => {
        const timer = setTimeout(() => {
            setTimedOut(true)
        }, AUTH_CALLBACK_TIMEOUT_MS)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (timedOut && !user) {
            router.replace('/login')
        }
    }, [timedOut, user, router])

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.logoBlock}>
                        <span className={styles.logoText}>AB TATTOO</span>
                        <span className={styles.logoAccent}>SUPPLIES</span>
                    </div>

                    <div className={styles.spinner} />

                    <p className={styles.message}>
                        {timedOut
                            ? 'No se pudo verificar la sesión. Redirigiendo…'
                            : 'Configurando tu cuenta…'}
                    </p>
                    <p className={styles.hint}>Esto solo tardará un momento</p>
                </div>
            </div>

            <Footer />
        </main>
    )
}
