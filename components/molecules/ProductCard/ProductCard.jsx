import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Badge from '@/components/atoms/Badge/Badge'
import Button from '@/components/atoms/Button/Button'
import { useCart } from '@/lib/context/CartContext'
import { getProductPrice, formatPrice } from '@/lib/api/medusa'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
    const { addToCart } = useCart()
    const [imageIndex, setImageIndex] = useState(0)
    const touchStartX = useRef(null)
    const touchStartY = useRef(null)

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Pasar la primera variante por defecto
        const defaultVariant = product.variants?.[0]
        addToCart(product, defaultVariant)
    }

    // Obtener el precio usando el helper de Medusa v2
    const price = getProductPrice(product)

    // Construir lista de todas las imágenes disponibles (sin duplicados)
    const allImages = (() => {
        const urls = new Set()
        const imgs = []
        if (product.thumbnail) {
            urls.add(product.thumbnail)
            imgs.push(product.thumbnail)
        }
        if (product.images?.length) {
            product.images.forEach(img => {
                const url = img.url || img
                if (url && !urls.has(url)) {
                    urls.add(url)
                    imgs.push(url)
                }
            })
        }
        if (product.variants?.length) {
            product.variants.forEach(variant => {
                const varImg = variant.metadata?.image || variant.thumbnail
                if (varImg && !urls.has(varImg)) {
                    urls.add(varImg)
                    imgs.push(varImg)
                }
            })
        }
        return imgs
    })()

    const hasMultipleImages = allImages.length > 1
    const currentImage = allImages[imageIndex] || null

    const goNext = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setImageIndex(prev => (prev + 1) % allImages.length)
    }, [allImages.length])

    const goPrev = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        setImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)
    }, [allImages.length])

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
    }, [])

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return
        const deltaX = e.changedTouches[0].clientX - touchStartX.current
        const deltaY = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault()
            if (deltaX < 0) setImageIndex(prev => (prev + 1) % allImages.length)
            else setImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)
        }
        touchStartX.current = null
        touchStartY.current = null
    }, [allImages.length])

    return (
        <Link href={`/products/${product.id}`} className={styles.card}>
            <div
                className={styles.imageWrapper}
                onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
                onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
            >
                {currentImage ? (
                    <img
                        src={currentImage}
                        alt={product.title}
                        className={styles.image}
                        draggable={false}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21,15 16,10 5,21" />
                        </svg>
                    </div>
                )}
                {product.metadata?.isNew && (
                    <Badge variant="new" className={styles.badge}>Nuevo</Badge>
                )}

                {/* Flechas + indicador de puntos */}
                {hasMultipleImages && (
                    <>
                        <button
                            className={`${styles.cardArrow} ${styles.cardArrowLeft}`}
                            onClick={goPrev}
                            aria-label="Imagen anterior"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            className={`${styles.cardArrow} ${styles.cardArrowRight}`}
                            onClick={goNext}
                            aria-label="Imagen siguiente"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                        <div className={styles.dotIndicators}>
                            {allImages.map((_, i) => (
                                <span
                                    key={i}
                                    className={`${styles.dot} ${i === imageIndex ? styles.dotActive : ''}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{product.title}</h3>
                <p className={styles.description}>{product.description}</p>

                <div className={styles.footer}>
                    <div className={styles.priceWrapper}>
                        {price && (
                            <span className={styles.price}>
                                {formatPrice(price.amount, price.currency_code || 'EUR')}
                            </span>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="small"
                        onClick={handleAddToCart}
                    >
                        Añadir
                    </Button>
                </div>
            </div>
        </Link>
    )
}
