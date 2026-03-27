'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { formatPrice } from '@/lib/api/medusa'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Card from '@/components/atoms/Card/Card'
import styles from './page.module.css'

const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8000'

export default function OrdersPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [orders, setOrders] = useState(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (!user) return

        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('auth_token')
                const response = await fetch(`${USER_API_URL}/api/users/me/orders`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    setOrders(data.orders || [])
                } else {
                    setOrders([])
                }
            } catch (error) {
                console.error('Error fetching orders:', error)
                setOrders([])
            }
        }

        fetchOrders()
    }, [user])

    if (loading) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.loading}>Cargando...</div>
                <Footer />
            </main>
        )
    }

    if (!user) return null

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendiente',
            completed: 'Completado',
            archived: 'Archivado',
            canceled: 'Cancelado',
            requires_action: 'Requiere acción',
        }
        return labels[status] || status
    }

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <h1 className={styles.title}>Historial de pedidos</h1>

                <Card padding="large" className={styles.card}>
                    {orders === null ? (
                        <div className={styles.loading}>Cargando pedidos...</div>
                    ) : orders.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No hay pedidos aún.</p>
                            <a href="/products" className={styles.link}>Explorar productos</a>
                        </div>
                    ) : (
                        <ul className={styles.list}>
                            {orders.map((order) => (
                                <li key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderRow}>
                                        <strong>Pedido #{order.display_id || order.id}</strong>
                                        <span className={styles.status}>{getStatusLabel(order.status)}</span>
                                    </div>
                                    <div className={styles.orderRow}>
                                        <span>{new Date(order.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}</span>
                                        <span style={{ fontWeight: 600 }}>
                                            {order.total != null && formatPrice(order.total, order.currency_code || 'EUR')}
                                        </span>
                                    </div>
                                    {order.items && order.items.length > 0 && (
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-white-muted)' }}>
                                            {order.items.map((item, idx) => (
                                                <span key={item.id || idx}>
                                                    {item.title} ×{item.quantity}
                                                    {idx < order.items.length - 1 && ' · '}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <Footer />
        </main>
    )
}
