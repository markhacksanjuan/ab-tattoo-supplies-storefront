'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import { formatPrice } from '@/lib/api/medusa'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Input from '@/components/atoms/Input/Input'
import Button from '@/components/atoms/Button/Button'
import Card from '@/components/atoms/Card/Card'
import styles from './page.module.css'

export default function CheckoutPage() {
    const router = useRouter()
    const { items, cartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [orderComplete, setOrderComplete] = useState(false)
    const [orderId, setOrderId] = useState('')

    const [shippingData, setShippingData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        postalCode: '',
        country: 'España'
    })

    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        cardName: '',
        expiry: '',
        cvv: ''
    })

    const handleShippingChange = (e) => {
        const { name, value } = e.target
        setShippingData(prev => ({ ...prev, [name]: value }))
    }

    const handlePaymentChange = (e) => {
        const { name, value } = e.target
        setPaymentData(prev => ({ ...prev, [name]: value }))
    }

    const handleShippingSubmit = (e) => {
        e.preventDefault()
        setStep(2)
    }

    const handlePaymentSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Generate mock order ID
        const mockOrderId = `ABT-${Date.now().toString(36).toUpperCase()}`
        setOrderId(mockOrderId)
        setOrderComplete(true)
        clearCart()
        setLoading(false)
    }

    const shippingCost = cartTotal > 10000 ? 0 : 500 // Free shipping over 100€
    const totalWithShipping = cartTotal + shippingCost

    if (items.length === 0 && !orderComplete) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.emptyContainer}>
                    <h1 className={styles.emptyTitle}>Your cart is empty</h1>
                    <p className={styles.emptyText}>Add some products before checkout</p>
                    <Link href="/products">
                        <Button variant="primary" size="large">
                            Browse Products
                        </Button>
                    </Link>
                </div>
                <Footer />
            </main>
        )
    }

    if (orderComplete) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.successContainer}>
                    <div className={styles.successIcon}>✓</div>
                    <h1 className={styles.successTitle}>Order Confirmed!</h1>
                    <p className={styles.successText}>
                        Thank you for your order. Your order number is:
                    </p>
                    <span className={styles.orderId}>{orderId}</span>
                    <p className={styles.successNote}>
                        A confirmation email has been sent to {shippingData.email}
                    </p>
                    <div className={styles.successActions}>
                        <Link href="/products">
                            <Button variant="primary" size="large">
                                Continue Shopping
                            </Button>
                        </Link>
                        <Link href="/account">
                            <Button variant="outline" size="large">
                                View Orders
                            </Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <h1 className={styles.title}>Checkout</h1>

                {/* Progress Steps */}
                <div className={styles.steps}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                        <span className={styles.stepNumber}>1</span>
                        <span className={styles.stepLabel}>Shipping</span>
                    </div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                        <span className={styles.stepNumber}>2</span>
                        <span className={styles.stepLabel}>Payment</span>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.formSection}>
                        {step === 1 && (
                            <Card padding="large">
                                <h2 className={styles.sectionTitle}>Shipping Information</h2>
                                <form onSubmit={handleShippingSubmit} className={styles.form}>
                                    <div className={styles.row}>
                                        <Input
                                            name="firstName"
                                            label="First Name"
                                            placeholder="John"
                                            value={shippingData.firstName}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                        <Input
                                            name="lastName"
                                            label="Last Name"
                                            placeholder="Doe"
                                            value={shippingData.lastName}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.row}>
                                        <Input
                                            type="email"
                                            name="email"
                                            label="Email"
                                            placeholder="john@studio.com"
                                            value={shippingData.email}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                        <Input
                                            type="tel"
                                            name="phone"
                                            label="Phone"
                                            placeholder="+34 600 000 000"
                                            value={shippingData.phone}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </div>
                                    <Input
                                        name="address"
                                        label="Address"
                                        placeholder="Street address"
                                        value={shippingData.address}
                                        onChange={handleShippingChange}
                                        required
                                    />
                                    <div className={styles.row}>
                                        <Input
                                            name="city"
                                            label="City"
                                            placeholder="Madrid"
                                            value={shippingData.city}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                        <Input
                                            name="postalCode"
                                            label="Postal Code"
                                            placeholder="28001"
                                            value={shippingData.postalCode}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" variant="primary" size="large" fullWidth>
                                        Continue to Payment
                                    </Button>
                                </form>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card padding="large">
                                <div className={styles.stepHeader}>
                                    <h2 className={styles.sectionTitle}>Payment</h2>
                                    <button
                                        className={styles.backBtn}
                                        onClick={() => setStep(1)}
                                    >
                                        ← Back to shipping
                                    </button>
                                </div>
                                <form onSubmit={handlePaymentSubmit} className={styles.form}>
                                    <div className={styles.paymentMethods}>
                                        <p className={styles.paymentLabel}>Credit / Debit Card</p>
                                        <div className={styles.cardIcons}>
                                            <span>💳</span>
                                        </div>
                                    </div>
                                    <Input
                                        name="cardNumber"
                                        label="Card Number"
                                        placeholder="4242 4242 4242 4242"
                                        value={paymentData.cardNumber}
                                        onChange={handlePaymentChange}
                                        required
                                    />
                                    <Input
                                        name="cardName"
                                        label="Name on Card"
                                        placeholder="JOHN DOE"
                                        value={paymentData.cardName}
                                        onChange={handlePaymentChange}
                                        required
                                    />
                                    <div className={styles.row}>
                                        <Input
                                            name="expiry"
                                            label="Expiry Date"
                                            placeholder="MM/YY"
                                            value={paymentData.expiry}
                                            onChange={handlePaymentChange}
                                            required
                                        />
                                        <Input
                                            name="cvv"
                                            label="CVV"
                                            placeholder="123"
                                            value={paymentData.cvv}
                                            onChange={handlePaymentChange}
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="large"
                                        fullWidth
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing...' : `Pay ${formatPrice(totalWithShipping)}`}
                                    </Button>
                                    <p className={styles.secureNote}>
                                        🔒 Your payment is secure and encrypted
                                    </p>
                                </form>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summarySection}>
                        <Card padding="large">
                            <h2 className={styles.sectionTitle}>Order Summary</h2>
                            <div className={styles.items}>
                                {items.map((item) => (
                                    <div key={item.variant_id} className={styles.item}>
                                        <div className={styles.itemImage}>
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} alt={item.title} />
                                            ) : (
                                                <div className={styles.itemPlaceholder}>📦</div>
                                            )}
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <span className={styles.itemName}>{item.title}</span>
                                            {item.variant_title && (
                                                <span className={styles.itemVariant}>{item.variant_title}</span>
                                            )}
                                            <span className={styles.itemQty}>Qty: {item.quantity}</span>
                                        </div>
                                        <span className={styles.itemPrice}>
                                            {formatPrice((item.price?.amount || 0) * item.quantity, item.price?.currency_code || 'EUR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.totals}>
                                <div className={styles.totalRow}>
                                    <span>Subtotal</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className={styles.totalRow}>
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                                </div>
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                    <span>Total</span>
                                    <span>{formatPrice(totalWithShipping)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
