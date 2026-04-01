'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getProduct, getVariantPrice, formatPrice, getAvailableOptionValues, findBestVariant } from '@/lib/api/medusa'
import { resolveTypeSlug } from '@/lib/data/navigation'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Button from '@/components/atoms/Button/Button'
import Badge from '@/components/atoms/Badge/Badge'
import { useCart } from '@/lib/context/CartContext'
import styles from './page.module.css'

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { addToCart } = useCart()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOptions, setSelectedOptions] = useState({})
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        loadProduct()
    }, [params.id])

    // Seleccionar variante basada en las opciones seleccionadas
    useEffect(() => {
        if (!product?.variants || !product?.options) return

        // Encontrar la variante que coincide con todas las opciones seleccionadas
        const matchingVariant = product.variants.find(variant => {
            if (!variant.options) return false
            return Object.entries(selectedOptions).every(([optionId, value]) => {
                return variant.options?.some(
                    variantOption => variantOption.option_id === optionId && variantOption.value === value
                )
            })
        })

        setSelectedVariant(matchingVariant || null)

        // Reset quantity on variant change
        setQuantity(1)

        // Si la variante tiene imagen propia, cambiar a ella automáticamente
        if (matchingVariant) {
            const varImg = matchingVariant.metadata?.image || matchingVariant.thumbnail
            if (varImg) {
                setSelectedImage(varImg)
            }
        }
    }, [selectedOptions, product])

    const loadProduct = async () => {
        setLoading(true)
        setError(null)
        
        try {
            const fetchedProduct = await getProduct(params.id)
            if (fetchedProduct) {
                setProduct(fetchedProduct)
                
                // Inicializar imagen seleccionada
                setSelectedImage(fetchedProduct.thumbnail || fetchedProduct.images?.[0]?.url || null)
                
                // Inicializar opciones seleccionadas con la primera variante
                if (fetchedProduct.options && fetchedProduct.variants?.[0]) {
                    const initialOptions = {}
                    fetchedProduct.variants[0].options?.forEach(opt => {
                        initialOptions[opt.option_id] = opt.value
                    })
                    setSelectedOptions(initialOptions)
                    setSelectedVariant(fetchedProduct.variants[0])
                }
            } else {
                setError('Producto no encontrado')
            }
        } catch (err) {
            console.error('Error loading product:', err)
            setError('Error al cargar el producto')
        } finally {
            setLoading(false)
        }
    }

    // ── All hooks must be above early returns ──

    // Construir lista completa de imágenes (thumbnail + product.images + variant images)
    const allImages = (() => {
        if (!product) return []
        const urls = new Set()
        const images = []
        if (product.thumbnail) {
            urls.add(product.thumbnail)
            images.push({ url: product.thumbnail, label: product.title })
        }
        if (product.images?.length) {
            product.images.forEach((img, i) => {
                const url = img.url || img
                if (url && !urls.has(url)) {
                    urls.add(url)
                    images.push({ url, label: `${product.title} - ${i + 1}` })
                }
            })
        }
        if (product.variants?.length) {
            product.variants.forEach(variant => {
                const variantImg = variant.metadata?.image || variant.thumbnail
                if (variantImg && !urls.has(variantImg)) {
                    urls.add(variantImg)
                    const variantLabel = variant.title || variant.options?.map(o => o.value).join(' / ') || 'Variante'
                    images.push({ url: variantImg, label: variantLabel })
                }
            })
        }
        return images
    })()

    const variantImage = selectedVariant?.metadata?.image || selectedVariant?.thumbnail || null
    const displayImage = selectedImage || variantImage || product?.thumbnail || allImages[0]?.url || null
    const currentIndex = allImages.findIndex(img => img.url === displayImage)

    const goToImage = useCallback((index) => {
        if (allImages.length === 0) return
        const wrapped = ((index % allImages.length) + allImages.length) % allImages.length
        setSelectedImage(allImages[wrapped].url)
    }, [allImages])

    const goPrev = useCallback(() => goToImage(currentIndex - 1), [currentIndex, goToImage])
    const goNext = useCallback(() => goToImage(currentIndex + 1), [currentIndex, goToImage])

    // Swipe support
    const touchStartX = useRef(null)
    const touchStartY = useRef(null)

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
    }, [])

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return
        const deltaX = e.changedTouches[0].clientX - touchStartX.current
        const deltaY = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) goNext()
            else goPrev()
        }
        touchStartX.current = null
        touchStartY.current = null
    }, [goNext, goPrev])

    // ── Early returns (after all hooks) ──

    if (loading) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.container}>
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Cargando producto...</p>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    if (error || !product) {
        return (
            <main className={styles.main}>
                <Header />
                <div className={styles.container}>
                    <div className={styles.error}>
                        <p>{error || 'Producto no encontrado'}</p>
                        <Button variant="primary" onClick={() => router.push('/products')}>
                            Volver a Productos
                        </Button>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    const handleAddToCart = () => {
        if (selectedVariant) {
            addToCart(product, selectedVariant, quantity)
            setQuantity(1)
        }
    }

    const handleOptionChange = (optionId, value) => {
        const newOptions = { ...selectedOptions, [optionId]: value }

        // Check if this exact combination has a matching variant
        const exactMatch = product.variants.find(variant =>
            variant.options && Object.entries(newOptions).every(([oId, oVal]) =>
                variant.options.some(vo => vo.option_id === oId && vo.value === oVal)
            )
        )

        if (exactMatch) {
            // Combination exists — just update
            setSelectedOptions(newOptions)
        } else {
            // No exact match — find the best variant that has the newly
            // selected value and adjust the other options to match
            const best = findBestVariant(product, newOptions)
            if (best?.options) {
                const adjusted = {}
                best.options.forEach(opt => {
                    adjusted[opt.option_id] = opt.value
                })
                // Ensure the user's explicit choice is kept
                adjusted[optionId] = value
                setSelectedOptions(adjusted)
            } else {
                setSelectedOptions(newOptions)
            }
        }
    }

    // Obtener precio de la variante seleccionada usando helper de Medusa v2
    const variantPrice = getVariantPrice(selectedVariant) || getVariantPrice(product.variants?.[0])
    const price = variantPrice?.amount || 0
    const currencyCode = variantPrice?.currency_code || 'EUR'
    
    // En Medusa v2, el inventario puede estar en manage_inventory y allow_backorder
    const inventory = selectedVariant?.inventory_quantity ?? product.variants?.[0]?.inventory_quantity ?? 0
    const manageInventory = selectedVariant?.manage_inventory ?? true

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <div className={styles.breadcrumb}>
                    <a href="/products">Productos</a>
                    {product.type?.value && (() => {
                        const typeObj = resolveTypeSlug(product.type.value)
                        return typeObj ? (
                            <>
                                <span>/</span>
                                <a href={`/products?type=${typeObj.slug}`}>{typeObj.value}</a>
                            </>
                        ) : null
                    })()}
                    {product.categories?.[0]?.name && (() => {
                        const cat = product.categories[0]
                        const typeObj = product.type?.value ? resolveTypeSlug(product.type.value) : null
                        const typeSlug = typeObj?.slug || ''
                        return (
                            <>
                                <span>/</span>
                                <a href={`/products?type=${typeSlug}&category=${cat.handle}`}>{cat.name}</a>
                            </>
                        )
                    })()}
                    {product.collection?.title && (() => {
                        const typeObj = product.type?.value ? resolveTypeSlug(product.type.value) : null
                        const typeSlug = typeObj?.slug || ''
                        return (
                            <>
                                <span>/</span>
                                <a href={`/products?type=${typeSlug}&collection=${product.collection.handle}`}>{product.collection.title}</a>
                            </>
                        )
                    })()}
                    <span>/</span>
                    <span>{product.title}</span>
                </div>

                <div className={styles.content}>
                    <div className={styles.imageSection}>
                        <div
                            className={styles.imageWrapper}
                            onTouchStart={allImages.length > 1 ? handleTouchStart : undefined}
                            onTouchEnd={allImages.length > 1 ? handleTouchEnd : undefined}
                        >
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={product.title}
                                    className={styles.image}
                                    draggable={false}
                                />
                            ) : (
                                <div className={styles.placeholder}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21,15 16,10 5,21" />
                                    </svg>
                                </div>
                            )}
                            {product.metadata?.isNew && (
                                <Badge variant="new" className={styles.badge}>Nuevo</Badge>
                            )}

                            {/* Flechas de navegación */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        className={`${styles.navArrow} ${styles.navArrowLeft}`}
                                        onClick={goPrev}
                                        aria-label="Imagen anterior"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                    </button>
                                    <button
                                        className={`${styles.navArrow} ${styles.navArrowRight}`}
                                        onClick={goNext}
                                        aria-label="Imagen siguiente"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                    <div className={styles.imageCounter}>
                                        {(currentIndex >= 0 ? currentIndex : 0) + 1} / {allImages.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Galería de miniaturas */}
                        {allImages.length > 1 && (
                            <div className={styles.thumbnailStrip}>
                                {allImages.map((img, index) => (
                                    <button
                                        key={img.url}
                                        className={`${styles.thumbnailButton} ${displayImage === img.url ? styles.thumbnailActive : ''}`}
                                        onClick={() => setSelectedImage(img.url)}
                                        title={img.label}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.label}
                                            className={styles.thumbnailImage}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.details}>
                        <div className={styles.header}>
                            {product.collection && (
                                <span className={styles.collection}>{product.collection.title}</span>
                            )}
                            <h1 className={styles.title}>{product.title}</h1>
                        </div>

                        <p className={styles.description}>{product.description}</p>

                        {/* Selector de opciones/variantes */}
                        {product.options && product.options.length > 0 && (
                            <div className={styles.optionsSection}>
                                {product.options.map(option => {
                                    const optionValues = getAvailableOptionValues(product, option, selectedOptions)
                                    return (
                                        <div key={option.id} className={styles.optionGroup}>
                                            <label className={styles.optionLabel}>{option.title}:</label>
                                            <div className={styles.optionValues}>
                                                {optionValues.map(value => {
                                                    const isSelected = selectedOptions[option.id] === value.value
                                                    const isUnavailable = !value.available && !isSelected
                                                    return (
                                                        <button
                                                            key={value.id}
                                                            className={`${styles.optionButton} ${
                                                                isSelected
                                                                    ? styles.optionButtonActive
                                                                    : isUnavailable
                                                                        ? styles.optionButtonUnavailable
                                                                        : ''
                                                            }`}
                                                            onClick={() => handleOptionChange(option.id, value.value)}
                                                            title={isUnavailable ? 'Combinación no disponible — se ajustarán las demás opciones' : ''}
                                                        >
                                                            {value.value}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Variante seleccionada */}
                        {selectedVariant && (
                            <div className={styles.variant}>
                                <span className={styles.variantLabel}>Selección:</span>
                                <span className={styles.variantValue}>
                                    {selectedVariant.options?.map((opt, index) => {
                                        const optionTitle = product.options?.find(o => o.id === opt.option_id)?.title
                                        return (
                                            <span key={opt.id}>
                                                {optionTitle}: {opt.value}
                                                {index < selectedVariant.options.length - 1 && ' / '}
                                            </span>
                                        )
                                    })}
                                </span>
                            </div>
                        )}

                        <div className={styles.priceSection}>
                            <span className={styles.price}>{formatPrice(price, currencyCode)}</span>
                            <span className={styles.stock}>
                                {!manageInventory || inventory > 0
                                    ? manageInventory ? `${inventory} en stock` : 'Disponible'
                                    : 'Agotado'
                                }
                            </span>
                        </div>

                        <div className={styles.actions}>
                            <div className={styles.quantityRow}>
                                <span className={styles.quantityLabel}>Cantidad:</span>
                                <div className={styles.quantityControls}>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        −
                                    </button>
                                    <span className={styles.quantityValue}>{quantity}</span>
                                    <button
                                        className={styles.quantityBtn}
                                        onClick={() => setQuantity(q => {
                                            const max = manageInventory ? inventory : 99
                                            return Math.min(max, q + 1)
                                        })}
                                        disabled={manageInventory && quantity >= inventory}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                size="large"
                                fullWidth
                                onClick={handleAddToCart}
                                disabled={manageInventory && inventory === 0}
                            >
                                Añadir al carrito
                            </Button>
                        </div>

                        <div className={styles.meta}>
                            <div className={styles.metaItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                                <span>Envío rápido a tu estudio</span>
                            </div>
                            <div className={styles.metaItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>100% productos auténticos</span>
                            </div>
                            <div className={styles.metaItem}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <span>Política de devolución de 30 días</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
