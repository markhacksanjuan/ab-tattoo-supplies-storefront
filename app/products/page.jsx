'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import ProductCard from '@/components/molecules/ProductCard/ProductCard'
import ProductFilters from '@/components/molecules/ProductFilters/ProductFilters'
import { getProducts, getCollection, getCategory, getProductTypes } from '@/lib/api/medusa'
import styles from './page.module.css'

// Map type handles (used in URL) to display names
const TYPE_LABELS = {
    agujas: 'Agujas',
    tintas: 'Tintas',
    material: 'Material',
}

function ProductsContent() {
    const searchParams = useSearchParams()
    
    // Get filter values from URL
    const collectionHandle = searchParams.get('collection') || ''
    const categoryHandle = searchParams.get('category') || ''
    const typeParam = searchParams.get('type') || ''

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pageTitle, setPageTitle] = useState('All Products')

    const loadProducts = useCallback(async () => {
        setLoading(true)
        setError(null)
        
        try {
            // Build query params for Medusa API
            const params = {
                limit: 100,
                expand: 'variants,variants.prices,collection,tags,type'
            }
            
            // Apply filters based on URL params
            if (collectionHandle) {
                // First get the collection ID from handle
                const collection = await getCollection(collectionHandle)
                if (collection) {
                    params.collection_id = [collection.id]
                    setPageTitle(collection.title)
                } else {
                    setPageTitle('Colección no encontrada')
                }
            } else if (categoryHandle) {
                // Get category ID from handle
                const category = await getCategory(categoryHandle)
                if (category) {
                    params.category_id = [category.id]
                    setPageTitle(category.name)
                } else {
                    setPageTitle('Categoría no encontrada')
                }
            } else if (typeParam) {
                // typeParam can be a handle (e.g. "agujas") or an actual type ID
                // First try to find the type by matching the value
                const allTypes = await getProductTypes()
                const matchedType = allTypes.find(
                    t => t.value?.toLowerCase() === typeParam.toLowerCase()
                )
                if (matchedType) {
                    params.type_id = [matchedType.id]
                    setPageTitle(matchedType.value)
                } else {
                    // Fallback: try using it as a direct type ID
                    params.type_id = [typeParam]
                    setPageTitle(TYPE_LABELS[typeParam] || 'Productos por Tipo')
                }
            } else {
                setPageTitle('Todos los Productos')
            }
            
            const { products: medusaProducts } = await getProducts(params)
            setProducts(medusaProducts)
        } catch (err) {
            console.error('Error loading products:', err)
            setError('Error cargando productos. Por favor, inténtalo de nuevo más tarde.')
            setProducts([])
        } finally {
            setLoading(false)
        }
    }, [collectionHandle, categoryHandle, typeParam])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    return (
        <div className={styles.layout}>
            <Suspense fallback={<div className={styles.filtersSkeleton} />}>
                <ProductFilters />
            </Suspense>
            
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <p className={styles.count}>
                        {products.length} {products.length === 1 ? 'producto' : 'productos'}
                    </p>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Cargando productos...</p>
                    </div>
                ) : error ? (
                    <div className={styles.empty}>
                        <p className={styles.emptyText}>{error}</p>
                        <button onClick={loadProducts} className={styles.retryButton}>
                            Intentar de nuevo
                        </button>
                    </div>
                ) : products.length > 0 ? (
                    <div className={styles.grid}>
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <p className={styles.emptyText}>No se encontraron productos</p>
                        <p className={styles.emptyHint}>
                            {collectionHandle || categoryHandle || typeId
                                ? 'Intenta seleccionar un filtro diferente o vuelve a intentarlo más tarde.'
                                : 'Los productos aparecerán aquí una vez que se agreguen a la tienda.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ProductsPage() {
    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <Suspense fallback={
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Cargando productos...</p>
                    </div>
                }>
                    <ProductsContent />
                </Suspense>
            </div>

            <Footer />
        </main>
    )
}
