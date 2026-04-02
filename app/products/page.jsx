'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import ProductCard from '@/components/molecules/ProductCard/ProductCard'
import ProductFilters from '@/components/molecules/ProductFilters/ProductFilters'
import MobileSearch from '@/components/molecules/MobileSearch/MobileSearch'
import { getProducts, getCollection, getCategory, getProductTypes } from '@/lib/api/medusa'
import { resolveTypeSlug, enrichWithApiData } from '@/lib/data/navigation'
import { PRODUCTS_PER_PAGE } from '@/lib/config'
import styles from './page.module.css'

function ProductsContent() {
    const searchParams = useSearchParams()
    
    // Get filter values from URL — type always uses slugs (e.g. "agujas")
    const collectionHandle = searchParams.get('collection') || ''
    const categoryHandle = searchParams.get('category') || ''
    const typeParam = searchParams.get('type') || ''
    const searchQuery = searchParams.get('q') || ''

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [pageTitle, setPageTitle] = useState('Todos los Productos')
    const [totalCount, setTotalCount] = useState(0)
    const [currentOffset, setCurrentOffset] = useState(0)

    // Resolved filter params cached for "load more" calls
    const resolvedParams = useRef({})

    const loadProducts = useCallback(async (offset = 0, append = false) => {
        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
            setProducts([])
            setCurrentOffset(0)
        }
        setError(null)
        
        try {
            let params

            if (append) {
                // Reuse previously resolved filters
                params = { ...resolvedParams.current, offset, limit: PRODUCTS_PER_PAGE }
            } else {
                params = {
                    limit: PRODUCTS_PER_PAGE,
                    offset: 0,
                    expand: 'variants,variants.prices,collection,tags,type'
                }

                // Determine page title parts
                let titleParts = []

                // Search query
                if (searchQuery) {
                    params.q = searchQuery
                    titleParts.push(`Resultados: «${searchQuery}»`)
                }
                
                // Type filter — resolve slug to Medusa UUID via navigation map
                if (typeParam) {
                    await enrichWithApiData(getProductTypes)
                    
                    const typeObj = resolveTypeSlug(typeParam)
                    if (typeObj?.typeId) {
                        params.type_id = [typeObj.typeId]
                        titleParts.push(typeObj.value)
                    } else if (typeObj) {
                        const allTypes = await getProductTypes()
                        const match = allTypes.find(
                            t => t.value?.toLowerCase().trim() === typeParam.toLowerCase().trim()
                        )
                        if (match) {
                            params.type_id = [match.id]
                            titleParts.push(typeObj.value)
                        } else {
                            console.warn(`[products] Type "${typeParam}" not found in API`)
                            titleParts.push(typeObj.value)
                        }
                    } else {
                        console.warn(`[products] Unknown type slug: "${typeParam}"`)
                    }
                }

                // Category filter
                if (categoryHandle) {
                    const category = await getCategory(categoryHandle)
                    if (category) {
                        params.category_id = [category.id]
                        titleParts.push(category.name)
                    } else {
                        titleParts.push('Categoría no encontrada')
                    }
                }

                // Collection/brand filter
                if (collectionHandle) {
                    const collection = await getCollection(collectionHandle)
                    if (collection) {
                        params.collection_id = [collection.id]
                        titleParts.push(collection.title)
                    } else {
                        titleParts.push('Marca no encontrada')
                    }
                }

                // Set page title
                if (titleParts.length > 0) {
                    setPageTitle(titleParts.join(' — '))
                } else {
                    setPageTitle('Todos los Productos')
                }

                // Cache resolved params for subsequent "load more" calls
                resolvedParams.current = { ...params }
            }
            
            const { products: medusaProducts, count } = await getProducts(params)

            if (append) {
                setProducts(prev => [...prev, ...medusaProducts])
            } else {
                setProducts(medusaProducts)
                setTotalCount(count)
            }
            setCurrentOffset(offset + medusaProducts.length)
        } catch (err) {
            console.error('Error loading products:', err)
            setError('Error cargando productos. Por favor, inténtalo de nuevo más tarde.')
            if (!append) setProducts([])
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [collectionHandle, categoryHandle, typeParam, searchQuery])

    useEffect(() => {
        loadProducts(0, false)
    }, [loadProducts])

    const handleLoadMore = () => {
        loadProducts(currentOffset, true)
    }

    const hasMore = products.length < totalCount

    // Floating filter panel — appears when sidebar filters scroll out of view
    const filtersRef = useRef(null)
    const [showFloatingFilter, setShowFloatingFilter] = useState(false)
    const [floatingPanelOpen, setFloatingPanelOpen] = useState(false)

    useEffect(() => {
        const el = filtersRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                const offScreen = !entry.isIntersecting
                setShowFloatingFilter(offScreen)
                // Close panel when sidebar comes back into view
                if (!offScreen) setFloatingPanelOpen(false)
            },
            { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // Close the floating panel whenever any filter changes (URL navigates)
    useEffect(() => {
        setFloatingPanelOpen(false)
    }, [typeParam, categoryHandle, collectionHandle, searchQuery])

    const activeFilterCount = [typeParam, categoryHandle, collectionHandle].filter(Boolean).length

    return (
        <div className={styles.layout}>
            <div ref={filtersRef}>
                <Suspense fallback={<div className={styles.filtersSkeleton} />}>
                    <ProductFilters />
                </Suspense>
            </div>

            {showFloatingFilter && (
                <>
                    <button
                        className={`${styles.floatingFilterBtn} ${floatingPanelOpen ? styles.floatingFilterBtnActive : ''}`}
                        onClick={() => setFloatingPanelOpen(prev => !prev)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {floatingPanelOpen ? (
                                <path d="M18 6L6 18M6 6l12 12" />
                            ) : (
                                <>
                                    <line x1="4" y1="6" x2="20" y2="6" />
                                    <line x1="8" y1="12" x2="20" y2="12" />
                                    <line x1="12" y1="18" x2="20" y2="18" />
                                </>
                            )}
                        </svg>
                        {floatingPanelOpen ? 'Cerrar' : 'Filtros'}
                        {!floatingPanelOpen && activeFilterCount > 0 && (
                            <span className={styles.floatingFilterBadge}>{activeFilterCount}</span>
                        )}
                    </button>

                    {floatingPanelOpen && (
                        <>
                            <div
                                className={styles.floatingBackdrop}
                                onClick={() => setFloatingPanelOpen(false)}
                            />
                            <div className={styles.floatingPanel}>
                                <Suspense fallback={<div style={{ padding: '1rem', color: 'var(--color-white-muted)' }}>Cargando filtros...</div>}>
                                    <ProductFilters floating onFiltersChange={() => setFloatingPanelOpen(false)} />
                                </Suspense>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Mobile search button — below floating filter */}
            <MobileSearch />
            
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <p className={styles.count}>
                        {loading
                            ? 'Cargando…'
                            : `${products.length} de ${totalCount} ${totalCount === 1 ? 'producto' : 'productos'}`
                        }
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
                        <button onClick={() => loadProducts(0, false)} className={styles.retryButton}>
                            Intentar de nuevo
                        </button>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className={styles.grid}>
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Load more block */}
                        <div className={styles.loadMoreBlock}>
                            <p className={styles.loadMoreCount}>
                                Mostrando {products.length} de {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
                            </p>
                            {hasMore && (
                                <button
                                    className={styles.loadMoreBtn}
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className={styles.loadMoreSpinner} />
                                            Cargando…
                                        </>
                                    ) : (
                                        'Cargar más productos'
                                    )}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.empty}>
                        <p className={styles.emptyText}>No se encontraron productos</p>
                        <p className={styles.emptyHint}>
                            {collectionHandle || categoryHandle || typeParam || searchQuery
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
