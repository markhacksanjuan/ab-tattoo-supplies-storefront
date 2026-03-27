'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Button from '@/components/atoms/Button/Button'
import Card from '@/components/atoms/Card/Card'
import styles from './page.module.css'

export default function AccountPage() {
    const router = useRouter()
    const { user, loading, logout } = useAuth()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    if (loading) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.loading}>Loading...</div>
                <Footer />
            </main>
        )
    }

    if (!user) {
        return null
    }

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>My Account</h1>
                    <Button variant="ghost" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </div>

                <div className={styles.content}>
                    <Card padding="large" className={styles.card}>
                        <h2 className={styles.cardTitle}>Studio Information</h2>
                        <div className={styles.info}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Studio Name</span>
                                <span className={styles.value}>{user.studio_name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Email</span>
                                <span className={styles.value}>{user.email}</span>
                            </div>
                            {user.tattoo_license && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>License</span>
                                    <span className={styles.value}>{user.tattoo_license}</span>
                                </div>
                            )}
                            {user.phone && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Phone</span>
                                    <span className={styles.value}>{user.phone}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card padding="large" className={styles.card}>
                        <h2 className={styles.cardTitle}>Account Status</h2>
                        <div className={styles.status}>
                            <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                {user.status}
                            </span>
                            <p className={styles.statusText}>
                                {user.status === 'pending' && 'Your account is pending approval.'}
                                {user.status === 'approved' && 'Your professional account is active.'}
                                {user.status === 'active' && 'Your professional account is active.'}
                            </p>
                        </div>
                    </Card>

                    <Card padding="large" className={styles.card}>
                        <h2 className={styles.cardTitle}>Quick Links</h2>
                        <div className={styles.links}>
                            <a href="/products" className={styles.quickLink}>Browse Products</a>
                            <a href="/cart" className={styles.quickLink}>View Cart</a>
                            <a href="/account/orders" className={styles.quickLink}>Order History</a>
                        </div>
                    </Card>
                </div>
            </div>

            <Footer />
        </main>
    )
}
