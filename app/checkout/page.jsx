'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '@/lib/context/CartContext'
import { useAuth } from '@/lib/context/AuthContext'
import {
    formatPrice,
    updateCart,
    getShippingOptions,
    addShippingMethod,
    initializePaymentSession,
    completeCart,
    getCart as getCartApi,
} from '@/lib/api/medusa'
import { getAddresses, addShippingAddress as saveShippingAddress } from '@/lib/api/user'
import { CreditCard, Lock, Package } from 'lucide-react'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Input from '@/components/atoms/Input/Input'
import Button from '@/components/atoms/Button/Button'
import Card from '@/components/atoms/Card/Card'
import styles from './page.module.css'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '')

// ============================================
// PAYMENT FORM COMPONENT (Stripe Elements)
// ============================================
function PaymentForm({ cart, onComplete, onBack }) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setLoading(true)
        setError(null)

        try {
            const { error: stripeError } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout`,
                },
                redirect: 'if_required',
            })

            if (stripeError) {
                setError(stripeError.message)
                setLoading(false)
                return
            }

            // Payment succeeded — complete the cart in Medusa
            const result = await completeCart(cart.id)
            if (result) {
                onComplete(result)
            } else {
                setError('Error al finalizar el pedido. Contacta con soporte.')
            }
        } catch (err) {
            console.error('Payment error:', err)
            setError('Error procesando el pago. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const currencyCode = cart?.currency_code || 'EUR'

    return (
        <Card padding="large">
            <div className={styles.stepHeader}>
                <h2 className={styles.sectionTitle}>Pago</h2>
                <button className={styles.backBtn} onClick={onBack}>
                    ← Volver al envío
                </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.paymentMethods}>
                    <p className={styles.paymentLabel}>Tarjeta de crédito / débito</p>
                    <div className={styles.cardIcons}><CreditCard size={24} /></div>
                </div>

                <PaymentElement options={{ layout: 'tabs' }} />

                {error && (
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    fullWidth
                    disabled={!stripe || !elements || loading}
                >
                    {loading ? 'Procesando...' : `Pagar ${formatPrice(cart?.total || 0, currencyCode)}`}
                </Button>

                <p className={styles.secureNote}>
                    <Lock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Tu pago es seguro y está encriptado
                </p>
            </form>
        </Card>
    )
}

// ============================================
// MAIN CHECKOUT PAGE
// ============================================
export default function CheckoutPage() {
    const router = useRouter()
    const { cart, items, cartTotal, clearCart, refreshCart } = useCart()
    const { user } = useAuth()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [orderComplete, setOrderComplete] = useState(false)
    const [orderData, setOrderData] = useState(null)

    // Shipping options from Medusa
    const [shippingOptions, setShippingOptions] = useState([])
    const [selectedShippingOption, setSelectedShippingOption] = useState(null)

    // Stripe client secret for PaymentElement
    const [clientSecret, setClientSecret] = useState(null)

    // Saved addresses
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState('new')
    const [billingAddress, setBillingAddress] = useState(null)
    const [useSameForBilling, setUseSameForBilling] = useState(true)
    const [saveAddress, setSaveAddress] = useState(false)

    const [shippingData, setShippingData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        address2: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'es'
    })

    const [billingData, setBillingData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        address2: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'es',
        phone: '',
    })

    // Load saved addresses and pre-fill on mount
    useEffect(() => {
        if (!user) return
        const loadAddresses = async () => {
            try {
                const data = await getAddresses()
                const addrs = data.shipping_addresses || []
                setSavedAddresses(addrs)
                setBillingAddress(data.billing_address || null)

                // Pre-fill billing data from saved billing address
                if (data.billing_address) {
                    const ba = data.billing_address
                    setBillingData({
                        firstName: ba.first_name || '',
                        lastName: ba.last_name || '',
                        address: ba.address_1 || '',
                        address2: ba.address_2 || '',
                        city: ba.city || '',
                        province: ba.province || '',
                        postalCode: ba.postal_code || '',
                        country: ba.country_code || 'es',
                        phone: ba.phone || '',
                    })
                }

                // Pre-fill shipping from default address
                const defaultAddr = addrs.find(a => a.is_default) || addrs[0]
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id)
                    fillShippingFrom(defaultAddr)
                } else {
                    // Fallback: pre-fill from user profile
                    setShippingData(prev => ({
                        ...prev,
                        email: user.email || '',
                        phone: user.phone || '',
                        firstName: user.studio_name?.split(' ')[0] || '',
                    }))
                }
            } catch (err) {
                // Fallback to user data
                setShippingData(prev => ({
                    ...prev,
                    email: user.email || '',
                    phone: user.phone || '',
                }))
            }
        }
        loadAddresses()
    }, [user])

    const fillShippingFrom = (addr) => {
        setShippingData(prev => ({
            ...prev,
            firstName: addr.first_name || '',
            lastName: addr.last_name || '',
            email: prev.email || user?.email || '',
            phone: addr.phone || prev.phone || user?.phone || '',
            address: addr.address_1 || '',
            address2: addr.address_2 || '',
            city: addr.city || '',
            province: addr.province || '',
            postalCode: addr.postal_code || '',
            country: addr.country_code || 'es',
        }))
    }

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId)
        if (addressId === 'new') {
            setShippingData({
                firstName: '',
                lastName: '',
                email: user?.email || '',
                phone: user?.phone || '',
                address: '',
                address2: '',
                city: '',
                province: '',
                postalCode: '',
                country: 'es',
            })
            setSaveAddress(true)
        } else {
            const addr = savedAddresses.find(a => a.id === addressId)
            if (addr) fillShippingFrom(addr)
            setSaveAddress(false)
        }
    }

    const handleShippingChange = (e) => {
        const { name, value } = e.target
        setShippingData(prev => ({ ...prev, [name]: value }))
    }

    const handleBillingChange = (e) => {
        const { name, value } = e.target
        setBillingData(prev => ({ ...prev, [name]: value }))
    }

    const handleShippingSubmit = async (e) => {
        e.preventDefault()
        if (!cart?.id) return

        setLoading(true)

        try {
            // 1. Build shipping address
            const shippingAddress = {
                first_name: shippingData.firstName,
                last_name: shippingData.lastName,
                address_1: shippingData.address,
                address_2: shippingData.address2 || '',
                city: shippingData.city,
                province: shippingData.province || '',
                postal_code: shippingData.postalCode,
                country_code: shippingData.country,
                phone: shippingData.phone,
            }

            // 2. Build billing address (same or different)
            const billingAddr = useSameForBilling
                ? shippingAddress
                : {
                    first_name: billingData.firstName,
                    last_name: billingData.lastName,
                    address_1: billingData.address,
                    address_2: billingData.address2 || '',
                    city: billingData.city,
                    province: billingData.province || '',
                    postal_code: billingData.postalCode,
                    country_code: billingData.country,
                    phone: billingData.phone,
                }

            await updateCart(cart.id, {
                email: shippingData.email,
                shipping_address: shippingAddress,
                billing_address: billingAddr,
            })

            // 3. Save address if requested
            if (saveAddress && selectedAddressId === 'new') {
                try {
                    await saveShippingAddress({
                        label: '',
                        first_name: shippingData.firstName,
                        last_name: shippingData.lastName,
                        address_1: shippingData.address,
                        address_2: shippingData.address2 || '',
                        city: shippingData.city,
                        province: shippingData.province || '',
                        postal_code: shippingData.postalCode,
                        country_code: shippingData.country,
                        phone: shippingData.phone,
                        is_default: savedAddresses.length === 0,
                    })
                } catch (err) {
                    console.error('Error saving address:', err)
                }
            }

            // 4. Fetch shipping options
            const options = await getShippingOptions(cart.id)
            setShippingOptions(options)

            if (options.length > 0) {
                const firstOption = options[0]
                setSelectedShippingOption(firstOption.id)
                await addShippingMethod(cart.id, firstOption.id)
            }

            // 5. Initialize Stripe payment session
            const paymentSession = await initializePaymentSession(cart.id)
            if (paymentSession?.data?.client_secret) {
                setClientSecret(paymentSession.data.client_secret)
            }

            await refreshCart()
            setStep(2)
        } catch (err) {
            console.error('Error in shipping step:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleShippingOptionChange = async (optionId) => {
        if (!cart?.id) return
        setSelectedShippingOption(optionId)
        setLoading(true)

        try {
            await addShippingMethod(cart.id, optionId)

            // Re-initialize payment session with updated amount
            const paymentSession = await initializePaymentSession(cart.id)
            if (paymentSession?.data?.client_secret) {
                setClientSecret(paymentSession.data.client_secret)
            }

            await refreshCart()
        } catch (err) {
            console.error('Error changing shipping option:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleOrderComplete = (result) => {
        const order = result?.order || result
        setOrderData(order)
        setOrderComplete(true)
        clearCart()
    }

    const currencyCode = cart?.currency_code || 'EUR'

    if (items.length === 0 && !orderComplete) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.emptyContainer}>
                    <h1 className={styles.emptyTitle}>Tu carrito está vacío</h1>
                    <p className={styles.emptyText}>Añade productos antes de realizar el pago</p>
                    <Link href="/products">
                        <Button variant="primary" size="large">
                            Explorar Productos
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
                    <h1 className={styles.successTitle}>¡Pedido confirmado!</h1>
                    <p className={styles.successText}>
                        Gracias por tu pedido. Tu número de pedido es:
                    </p>
                    <span className={styles.orderId}>
                        {orderData?.display_id ? `#${orderData.display_id}` : orderData?.id || ''}
                    </span>
                    <p className={styles.successNote}>
                        Se ha enviado un email de confirmación a {shippingData.email}
                    </p>
                    <div className={styles.successActions}>
                        <Link href="/products">
                            <Button variant="primary" size="large">
                                Seguir Comprando
                            </Button>
                        </Link>
                        <Link href="/account/orders">
                            <Button variant="outline" size="large">
                                Ver Pedidos
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
                        <span className={styles.stepLabel}>Envío</span>
                    </div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                        <span className={styles.stepNumber}>2</span>
                        <span className={styles.stepLabel}>Pago</span>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.formSection}>
                        {step === 1 && (
                            <Card padding="large">
                                <h2 className={styles.sectionTitle}>Información de envío</h2>

                                {/* Address selector */}
                                {savedAddresses.length > 0 && (
                                    <div className={styles.addressSelector}>
                                        <label className={styles.addressSelectorLabel}>Dirección guardada</label>
                                        <select
                                            value={selectedAddressId}
                                            onChange={(e) => handleAddressSelect(e.target.value)}
                                            className={styles.addressSelect}
                                        >
                                            {savedAddresses.map((addr) => (
                                                <option key={addr.id} value={addr.id}>
                                                    {addr.label || `${addr.address_1}, ${addr.city}`}
                                                    {addr.is_default ? ' ★' : ''}
                                                </option>
                                            ))}
                                            <option value="new">+ Nueva dirección</option>
                                        </select>
                                    </div>
                                )}

                                <form onSubmit={handleShippingSubmit} className={styles.form}>
                                    <div className={styles.row}>
                                        <Input
                                            name="firstName"
                                            label="Nombre"
                                            placeholder="Juan"
                                            value={shippingData.firstName}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                        <Input
                                            name="lastName"
                                            label="Apellidos"
                                            placeholder="García"
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
                                            placeholder="juan@estudio.com"
                                            value={shippingData.email}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                        <Input
                                            type="tel"
                                            name="phone"
                                            label="Teléfono"
                                            placeholder="+34 600 000 000"
                                            value={shippingData.phone}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </div>
                                    <Input
                                        name="address"
                                        label="Dirección"
                                        placeholder="Calle y número"
                                        value={shippingData.address}
                                        onChange={handleShippingChange}
                                        required
                                    />
                                    <Input
                                        name="address2"
                                        label="Piso / Puerta (opcional)"
                                        placeholder="Piso 2, Puerta B"
                                        value={shippingData.address2}
                                        onChange={handleShippingChange}
                                    />
                                    <div className={styles.row}>
                                        <Input
                                            name="city"
                                            label="Ciudad"
                                            placeholder="Madrid"
                                            value={shippingData.city}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                        <Input
                                            name="province"
                                            label="Provincia"
                                            placeholder="Madrid"
                                            value={shippingData.province}
                                            onChange={handleShippingChange}
                                        />
                                    </div>
                                    <div className={styles.row}>
                                        <Input
                                            name="postalCode"
                                            label="Código Postal"
                                            placeholder="28001"
                                            value={shippingData.postalCode}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                        <div />
                                    </div>

                                    {/* Save address checkbox */}
                                    {selectedAddressId === 'new' && user && (
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={saveAddress}
                                                onChange={(e) => setSaveAddress(e.target.checked)}
                                            />
                                            <span>Guardar esta dirección para futuros pedidos</span>
                                        </label>
                                    )}

                                    {/* Billing address toggle */}
                                    <div className={styles.billingToggle}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={useSameForBilling}
                                                onChange={(e) => setUseSameForBilling(e.target.checked)}
                                            />
                                            <span>La dirección de facturación es la misma que la de envío</span>
                                        </label>
                                    </div>

                                    {/* Billing address form */}
                                    {!useSameForBilling && (
                                        <div className={styles.billingSection}>
                                            <h3 className={styles.billingTitle}>Dirección de facturación</h3>
                                            <div className={styles.row}>
                                                <Input
                                                    name="firstName"
                                                    label="Nombre"
                                                    placeholder="Juan"
                                                    value={billingData.firstName}
                                                    onChange={handleBillingChange}
                                                    required
                                                />
                                                <Input
                                                    name="lastName"
                                                    label="Apellidos"
                                                    placeholder="García"
                                                    value={billingData.lastName}
                                                    onChange={handleBillingChange}
                                                    required
                                                />
                                            </div>
                                            <Input
                                                name="address"
                                                label="Dirección"
                                                placeholder="Calle y número"
                                                value={billingData.address}
                                                onChange={handleBillingChange}
                                                required
                                            />
                                            <Input
                                                name="address2"
                                                label="Piso / Puerta (opcional)"
                                                placeholder="Piso 2, Puerta B"
                                                value={billingData.address2}
                                                onChange={handleBillingChange}
                                            />
                                            <div className={styles.row}>
                                                <Input
                                                    name="city"
                                                    label="Ciudad"
                                                    placeholder="Madrid"
                                                    value={billingData.city}
                                                    onChange={handleBillingChange}
                                                    required
                                                />
                                                <Input
                                                    name="postalCode"
                                                    label="Código Postal"
                                                    placeholder="28001"
                                                    value={billingData.postalCode}
                                                    onChange={handleBillingChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="large"
                                        fullWidth
                                        disabled={loading}
                                    >
                                        {loading ? 'Procesando...' : 'Continuar al pago'}
                                    </Button>
                                </form>
                            </Card>
                        )}

                        {step === 2 && (
                            <>
                                {/* Shipping Options (if multiple) */}
                                {shippingOptions.length > 1 && (
                                    <Card padding="large" className={styles.card}>
                                        <h2 className={styles.sectionTitle}>Método de envío</h2>
                                        <div className={styles.form}>
                                            {shippingOptions.map((option) => (
                                                <label
                                                    key={option.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '1rem',
                                                        border: `2px solid ${selectedShippingOption === option.id ? 'var(--color-gold)' : 'var(--color-gray-200)'}`,
                                                        borderRadius: 'var(--radius-md)',
                                                        cursor: 'pointer',
                                                        transition: 'border-color 0.2s',
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="shippingOption"
                                                        value={option.id}
                                                        checked={selectedShippingOption === option.id}
                                                        onChange={() => handleShippingOptionChange(option.id)}
                                                    />
                                                    <span style={{ flex: 1 }}>{option.name}</span>
                                                    <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>
                                                        {option.amount === 0 ? 'Gratis' : formatPrice(option.amount, currencyCode)}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {/* Stripe Payment */}
                                {clientSecret ? (
                                    <Elements
                                        stripe={stripePromise}
                                        options={{
                                            clientSecret,
                                            appearance: {
                                                theme: 'night',
                                                variables: {
                                                    colorPrimary: '#d4a843',
                                                    colorBackground: '#1a1a1a',
                                                    colorText: '#ffffff',
                                                    colorDanger: '#ef4444',
                                                    fontFamily: 'Inter, sans-serif',
                                                    borderRadius: '8px',
                                                },
                                            },
                                        }}
                                    >
                                        <PaymentForm
                                            cart={cart}
                                            onComplete={handleOrderComplete}
                                            onBack={() => setStep(1)}
                                        />
                                    </Elements>
                                ) : (
                                    <Card padding="large">
                                        <div className={styles.stepHeader}>
                                            <h2 className={styles.sectionTitle}>Pago</h2>
                                            <button className={styles.backBtn} onClick={() => setStep(1)}>
                                                ← Volver al envío
                                            </button>
                                        </div>
                                        <p style={{ color: 'var(--color-white-muted)', textAlign: 'center', padding: '2rem 0' }}>
                                            {loading ? 'Preparando el pago...' : 'No se pudo inicializar el pago. Verifica que Stripe esté configurado.'}
                                        </p>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className={styles.summarySection}>
                        <Card padding="large">
                            <h2 className={styles.sectionTitle}>Resumen del pedido</h2>
                            <div className={styles.items}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.item}>
                                        <div className={styles.itemImage}>
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} alt={item.title} />
                                            ) : (
                                                <div className={styles.itemPlaceholder}><Package size={24} /></div>
                                            )}
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <span className={styles.itemName}>{item.title}</span>
                                            {(item.subtitle || item.variant_title) && (
                                                <span className={styles.itemVariant}>{item.subtitle || item.variant_title}</span>
                                            )}
                                            <span className={styles.itemQty}>Cant: {item.quantity}</span>
                                        </div>
                                        <span className={styles.itemPrice}>
                                            {formatPrice((item.unit_price || 0) * item.quantity, currencyCode)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.totals}>
                                <div className={styles.totalRow}>
                                    <span>Subtotal</span>
                                    <span>{formatPrice(cart?.item_total || cartTotal, currencyCode)}</span>
                                </div>
                                <div className={styles.totalRow}>
                                    <span>Envío</span>
                                    <span>
                                        {cart?.shipping_total != null
                                            ? (cart.shipping_total === 0 ? 'Gratis' : formatPrice(cart.shipping_total, currencyCode))
                                            : 'Calculado en el siguiente paso'
                                        }
                                    </span>
                                </div>
                                {(cart?.tax_total > 0) && (
                                    <div className={styles.totalRow}>
                                        <span>Impuestos</span>
                                        <span>{formatPrice(cart.tax_total, currencyCode)}</span>
                                    </div>
                                )}
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                    <span>Total</span>
                                    <span>{formatPrice(cart?.total || cartTotal, currencyCode)}</span>
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
