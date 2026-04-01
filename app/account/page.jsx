'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Button from '@/components/atoms/Button/Button'
import Card from '@/components/atoms/Card/Card'
import { MapPin, Package, ShoppingCart, ShoppingBag } from 'lucide-react'
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
                    <h1 className={styles.title}>Mi cuenta</h1>
                    <Button variant="ghost" onClick={handleLogout} className={styles.headerLogout}>
                        Cerrar sesión
                    </Button>
                </div>

                <div className={styles.content}>
                    <Card padding="large" className={styles.card}>
                        <h2 className={styles.cardTitle}>Información del estudio</h2>
                        <div className={styles.info}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Nombre del estudio</span>
                                <span className={styles.value}>{user.studio_name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Correo electrónico</span>
                                <span className={styles.value}>{user.email}</span>
                            </div>
                            {user.tattoo_license && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Licencia</span>
                                    <span className={styles.value}>{user.tattoo_license}</span>
                                </div>
                            )}
                            {user.phone && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Teléfono</span>
                                    <span className={styles.value}>{user.phone}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card padding="large" className={styles.card}>
                        <h2 className={styles.cardTitle}>Enlaces rápidos</h2>
                        <div className={styles.links}>
                            <a href="/account/addresses" className={styles.quickLink}><MapPin size={18} /> Mis direcciones</a>
                            <a href="/account/orders" className={styles.quickLink}><Package size={18} /> Historial de pedidos</a>
                            <a href="/products" className={styles.quickLink}><ShoppingCart size={18} /> Explorar productos</a>
                            <a href="/cart" className={styles.quickLink}><ShoppingBag size={18} /> Ver carrito</a>
                        </div>
                    </Card>
                </div>

                <div className={styles.logoutBottom}>
                    <Button variant="ghost" onClick={handleLogout} fullWidth>
                        Cerrar sesión
                    </Button>
                </div>
            </div>

            <Footer />
        </main>
    )
}
