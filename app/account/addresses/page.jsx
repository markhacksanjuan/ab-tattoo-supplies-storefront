'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import {
    getAddresses,
    setBillingAddress,
    deleteBillingAddress,
    addShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
    setDefaultShippingAddress,
} from '@/lib/api/user'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Input from '@/components/atoms/Input/Input'
import Button from '@/components/atoms/Button/Button'
import Card from '@/components/atoms/Card/Card'
import { Pencil, Trash2, Phone, FileText, Package } from 'lucide-react'
import styles from './page.module.css'

// ============================================
// ADDRESS FORM COMPONENT (reusable)
// ============================================
function AddressForm({ initial = {}, onSubmit, onCancel, submitLabel = 'Guardar', isBilling = false }) {
    const [form, setForm] = useState({
        label: initial.label || '',
        first_name: initial.first_name || '',
        last_name: initial.last_name || '',
        company: initial.company || '',
        address_1: initial.address_1 || '',
        address_2: initial.address_2 || '',
        city: initial.city || '',
        province: initial.province || '',
        postal_code: initial.postal_code || '',
        country_code: initial.country_code || 'es',
        phone: initial.phone || '',
        ...(isBilling ? { tax_id: initial.tax_id || '' } : { is_default: initial.is_default || false }),
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit(form)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.addressForm}>
            {!isBilling && (
                <Input
                    name="label"
                    label="Etiqueta"
                    placeholder="Ej: Estudio principal, Casa..."
                    value={form.label}
                    onChange={handleChange}
                />
            )}
            <div className={styles.row}>
                <Input
                    name="first_name"
                    label="Nombre"
                    placeholder="Juan"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                />
                <Input
                    name="last_name"
                    label="Apellidos"
                    placeholder="García"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                />
            </div>
            <Input
                name="company"
                label="Empresa / Estudio"
                placeholder="Nombre del estudio"
                value={form.company}
                onChange={handleChange}
            />
            <Input
                name="address_1"
                label="Dirección"
                placeholder="Calle y número"
                value={form.address_1}
                onChange={handleChange}
                required
            />
            <Input
                name="address_2"
                label="Piso / Puerta (opcional)"
                placeholder="Piso 2, Puerta B"
                value={form.address_2}
                onChange={handleChange}
            />
            <div className={styles.row}>
                <Input
                    name="city"
                    label="Ciudad"
                    placeholder="Madrid"
                    value={form.city}
                    onChange={handleChange}
                    required
                />
                <Input
                    name="province"
                    label="Provincia"
                    placeholder="Madrid"
                    value={form.province}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.row}>
                <Input
                    name="postal_code"
                    label="Código Postal"
                    placeholder="28001"
                    value={form.postal_code}
                    onChange={handleChange}
                    required
                />
                <Input
                    name="phone"
                    label="Teléfono"
                    placeholder="+34 600 000 000"
                    value={form.phone}
                    onChange={handleChange}
                />
            </div>
            {isBilling && (
                <Input
                    name="tax_id"
                    label="NIF / CIF"
                    placeholder="B12345678"
                    value={form.tax_id}
                    onChange={handleChange}
                />
            )}
            {!isBilling && (
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="is_default"
                        checked={form.is_default}
                        onChange={handleChange}
                    />
                    <span>Usar como dirección de envío predeterminada</span>
                </label>
            )}
            <div className={styles.formActions}>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Guardando...' : submitLabel}
                </Button>
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    )
}

// ============================================
// ADDRESS CARD (display)
// ============================================
function AddressCard({ address, onEdit, onDelete, onSetDefault, isBilling = false }) {
    return (
        <div className={styles.addressCard}>
            <div className={styles.addressCardHeader}>
                <div className={styles.addressCardTitle}>
                    {isBilling ? (
                        <span className={styles.addressBadge}>Facturación</span>
                    ) : (
                        <>
                            <span>{address.label || 'Dirección de envío'}</span>
                            {address.is_default && <span className={styles.defaultBadge}>Predeterminada</span>}
                        </>
                    )}
                </div>
                <div className={styles.addressCardActions}>
                    {onEdit && (
                        <button className={styles.actionBtn} onClick={onEdit} title="Editar"><Pencil size={16} /></button>
                    )}
                    {onDelete && (
                        <button className={styles.actionBtn} onClick={onDelete} title="Eliminar"><Trash2 size={16} /></button>
                    )}
                </div>
            </div>
            <div className={styles.addressCardBody}>
                <p className={styles.addressName}>
                    {address.first_name} {address.last_name}
                    {address.company && <span className={styles.addressCompany}> · {address.company}</span>}
                </p>
                <p>{address.address_1}</p>
                {address.address_2 && <p>{address.address_2}</p>}
                <p>{address.postal_code} {address.city}{address.province ? `, ${address.province}` : ''}</p>
                {address.phone && <p><Phone size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{address.phone}</p>}
                {isBilling && address.tax_id && <p className={styles.taxId}>NIF/CIF: {address.tax_id}</p>}
            </div>
            {onSetDefault && !address.is_default && (
                <button className={styles.setDefaultBtn} onClick={onSetDefault}>
                    Establecer como predeterminada
                </button>
            )}
        </div>
    )
}

// ============================================
// MAIN PAGE
// ============================================
export default function AddressesPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    const [billing, setBilling] = useState(null)
    const [shipping, setShipping] = useState([])
    const [loading, setLoading] = useState(true)

    // UI states
    const [editingBilling, setEditingBilling] = useState(false)
    const [addingShipping, setAddingShipping] = useState(false)
    const [editingShippingId, setEditingShippingId] = useState(null)

    useEffect(() => {
        if (!authLoading && !user) router.push('/login')
    }, [user, authLoading, router])

    useEffect(() => {
        if (!user) return
        fetchAddresses()
    }, [user])

    const fetchAddresses = async () => {
        setLoading(true)
        try {
            const data = await getAddresses()
            setBilling(data.billing_address || null)
            setShipping(data.shipping_addresses || [])
        } catch (err) {
            console.error('Error fetching addresses:', err)
        } finally {
            setLoading(false)
        }
    }

    // BILLING
    const handleSaveBilling = async (form) => {
        await setBillingAddress(form)
        setEditingBilling(false)
        await fetchAddresses()
    }

    const handleDeleteBilling = async () => {
        if (!confirm('¿Eliminar la dirección de facturación?')) return
        await deleteBillingAddress()
        await fetchAddresses()
    }

    // SHIPPING
    const handleAddShipping = async (form) => {
        await addShippingAddress(form)
        setAddingShipping(false)
        await fetchAddresses()
    }

    const handleUpdateShipping = async (form) => {
        await updateShippingAddress(editingShippingId, form)
        setEditingShippingId(null)
        await fetchAddresses()
    }

    const handleDeleteShipping = async (id) => {
        if (!confirm('¿Eliminar esta dirección de envío?')) return
        await deleteShippingAddress(id)
        await fetchAddresses()
    }

    const handleSetDefault = async (id) => {
        await setDefaultShippingAddress(id)
        await fetchAddresses()
    }

    if (authLoading || !user) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.loadingState}>Cargando...</div>
                <Footer />
            </main>
        )
    }

    const editingShipping = shipping.find(a => a.id === editingShippingId)

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                    <Link href="/account" className={styles.breadcrumbLink}>Mi cuenta</Link>
                    <span className={styles.breadcrumbSep}>›</span>
                    <span>Direcciones</span>
                </div>

                <h1 className={styles.title}>Mis direcciones</h1>

                {loading ? (
                    <div className={styles.loadingState}>Cargando direcciones...</div>
                ) : (
                    <div className={styles.sections}>
                        {/* ========== BILLING ADDRESS ========== */}
                        <Card padding="large" className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}><FileText size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Dirección de facturación</h2>
                                {!editingBilling && !billing && (
                                    <Button variant="outline" size="small" onClick={() => setEditingBilling(true)}>
                                        + Añadir
                                    </Button>
                                )}
                            </div>
                            <p className={styles.sectionDesc}>
                                Dirección fiscal donde se generarán tus facturas.
                            </p>

                            {editingBilling ? (
                                <AddressForm
                                    initial={billing || {}}
                                    onSubmit={handleSaveBilling}
                                    onCancel={() => setEditingBilling(false)}
                                    isBilling
                                />
                            ) : billing ? (
                                <AddressCard
                                    address={billing}
                                    isBilling
                                    onEdit={() => setEditingBilling(true)}
                                    onDelete={handleDeleteBilling}
                                />
                            ) : (
                                <p className={styles.emptyText}>No tienes dirección de facturación configurada.</p>
                            )}
                        </Card>

                        {/* ========== SHIPPING ADDRESSES ========== */}
                        <Card padding="large" className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}><Package size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Direcciones de envío</h2>
                                {!addingShipping && !editingShippingId && (
                                    <Button variant="outline" size="small" onClick={() => setAddingShipping(true)}>
                                        + Añadir
                                    </Button>
                                )}
                            </div>
                            <p className={styles.sectionDesc}>
                                Puedes añadir varias direcciones de envío y elegir la predeterminada.
                            </p>

                            {addingShipping && (
                                <div className={styles.formContainer}>
                                    <h3 className={styles.formTitle}>Nueva dirección de envío</h3>
                                    <AddressForm
                                        onSubmit={handleAddShipping}
                                        onCancel={() => setAddingShipping(false)}
                                        submitLabel="Añadir dirección"
                                    />
                                </div>
                            )}

                            {editingShippingId && editingShipping && (
                                <div className={styles.formContainer}>
                                    <h3 className={styles.formTitle}>Editar dirección</h3>
                                    <AddressForm
                                        initial={editingShipping}
                                        onSubmit={handleUpdateShipping}
                                        onCancel={() => setEditingShippingId(null)}
                                        submitLabel="Actualizar dirección"
                                    />
                                </div>
                            )}

                            {!addingShipping && !editingShippingId && shipping.length === 0 && (
                                <p className={styles.emptyText}>No tienes direcciones de envío guardadas.</p>
                            )}

                            {!addingShipping && !editingShippingId && shipping.length > 0 && (
                                <div className={styles.addressList}>
                                    {shipping.map((addr) => (
                                        <AddressCard
                                            key={addr.id}
                                            address={addr}
                                            onEdit={() => setEditingShippingId(addr.id)}
                                            onDelete={() => handleDeleteShipping(addr.id)}
                                            onSetDefault={() => handleSetDefault(addr.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}
