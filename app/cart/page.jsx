'use client'

import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'
import { formatPrice } from '@/lib/api/medusa'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Button from '@/components/atoms/Button/Button'
import styles from './page.module.css'

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <h1 className={styles.title}>Tu Carrito</h1>

                {items.length > 0 ? (
                    <div className={styles.content}>
                        <div className={styles.items}>
                            {items.map((item) => (
                                <div key={item.variant_id} className={styles.item}>
                                    <div className={styles.itemImage}>
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt={item.title} />
                                        ) : (
                                            <div className={styles.placeholder}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21,15 16,10 5,21" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <h3 className={styles.itemTitle}>{item.title}</h3>
                                        {item.variant_title && (
                                            <p className={styles.itemVariant}>{item.variant_title}</p>
                                        )}
                                        <p className={styles.itemPrice}>
                                            {item.price && formatPrice(item.price.amount, item.price.currency_code || 'EUR')}
                                        </p>
                                    </div>
                                    <div className={styles.itemQuantity}>
                                        <button
                                            className={styles.quantityBtn}
                                            onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className={styles.quantityValue}>{item.quantity}</span>
                                        <button
                                            className={styles.quantityBtn}
                                            onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFromCart(item.variant_id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summary}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Envío</span>
                                <span>Calculado al finalizar la compra</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <Link href="/checkout">
                                <Button variant="primary" size="large" fullWidth>
                                    Proceder al Pago
                                </Button>
                            </Link>
                            <button className={styles.clearBtn} onClick={clearCart}>
                                Vaciar Carrito
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <p className={styles.emptyText}>Tu carrito está vacío</p>
                        <Link href="/products">
                            <Button variant="outline" size="large">
                                Continuar Comprando
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}
