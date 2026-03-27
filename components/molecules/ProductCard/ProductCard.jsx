import Link from 'next/link'
import Badge from '@/components/atoms/Badge/Badge'
import Button from '@/components/atoms/Button/Button'
import { useCart } from '@/lib/context/CartContext'
import { getProductPrice, formatPrice } from '@/lib/api/medusa'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
    const { addToCart } = useCart()

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Pasar la primera variante por defecto
        const defaultVariant = product.variants?.[0]
        addToCart(product, defaultVariant)
    }

    // Obtener el precio usando el helper de Medusa v2
    const price = getProductPrice(product)

    return (
        <Link href={`/products/${product.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        className={styles.image}
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
