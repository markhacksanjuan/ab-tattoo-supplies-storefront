'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import ProductCard from '@/components/molecules/ProductCard/ProductCard'
import ProductFilters from '@/components/molecules/ProductFilters/ProductFilters'
import MobileSearch from '@/components/molecules/MobileSearch/MobileSearch'
import { getProducts, getCollection, getCollections, getCategory, getCategories, getProductTypes } from '@/lib/api/medusa'
import { PRODUCT_TYPES, resolveTypeSlug, enrichWithApiData } from '@/lib/data/navigation'
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

                // ── Universal search resolution ──────────────────────
                // Priority: type → category → collection/brand → universal fallback
                if (searchQuery) {
                    const normalized = searchQuery.toLowerCase().trim()
                    let searchResolved = false

                    // 1. Product type match
                    await enrichWithApiData(getProductTypes)
                    const matchedType = resolveTypeSlug(normalized)
                    if (matchedType?.typeId) {
                        params.type_id = [matchedType.typeId]
                        titleParts.push(matchedType.value)
                        searchResolved = true
                    }

                    // 2. Category match (navigation data → API fallback)
                    if (!searchResolved) {
                        const allNavCats = PRODUCT_TYPES.flatMap(t => t.categories)
                        const navCat = allNavCats.find(c =>
                            c.handle === normalized ||
                            c.handle.replace(/-/g, ' ') === normalized ||
                            c.label.toLowerCase() === normalized
                        )
                        if (navCat) {
                            const cat = await getCategory(navCat.handle)
                            if (cat) {
                                params.category_id = [cat.id]
                                titleParts.push(navCat.label)
                                searchResolved = true
                            }
                        }
                        if (!searchResolved) {
                            const apiCats = await getCategories()
                            const catMatch = apiCats.find(c =>
                                c.name?.toLowerCase() === normalized ||
                                c.handle === normalized ||
                                c.handle?.replace(/-/g, ' ') === normalized
                            )
                            if (catMatch) {
                                params.category_id = [catMatch.id]
                                titleParts.push(catMatch.name)
                                searchResolved = true
                            }
                        }
                    }

                    // 3. Collection / brand match (navigation data → API fallback)
                    if (!searchResolved) {
                        const allNavBrands = PRODUCT_TYPES.flatMap(t => t.brands)
                        const navBrand = allNavBrands.find(b =>
                            b.handle === normalized ||
                            b.handle.replace(/-/g, ' ') === normalized ||
                            b.label.toLowerCase() === normalized
                        )
                        if (navBrand) {
                            const col = await getCollection(navBrand.handle)
                            if (col) {
                                params.collection_id = [col.id]
                                titleParts.push(navBrand.label)
                                searchResolved = true
                            }
                        }
                        if (!searchResolved) {
                            const apiCols = await getCollections()
                            const colMatch = apiCols.find(c =>
                                c.title?.toLowerCase() === normalized ||
                                c.handle === normalized ||
                                c.handle?.replace(/-/g, ' ') === normalized
                            )
                            if (colMatch) {
                                params.collection_id = [colMatch.id]
                                titleParts.push(colMatch.title)
                                searchResolved = true
                            }
                        }
                    }

                    // 4. Universal fallback — fetch all products and filter
                    //    client-side across ALL metadata (title, description,
                    //    tags, type, collection, categories, handle)
                    if (!searchResolved) {
                        params.limit = 1000
                        params._universalSearch = normalized
                        titleParts.push(`Resultados: «${searchQuery}»`)
                    }
                }
                
                // Type filter — resolve slug to Medusa UUID via navigation map
                if (typeParam) {
                    await enrichWithApiData(getProductTypes)
                    
                    const typeObj = resolveTypeSlug(typeParam)
                    if (typeObj?.typeId) {
                        params.type_id = [typeObj.typeId]
                        titleParts.push(typeObj.value)
                    } else if (typeObj) {
                        // Type exists in navigation but enrichment didn't
                        // populate typeId (no products have this type yet).
                        // Try a direct API lookup as a last resort.
                        const allTypes = await getProductTypes()
                        const match = allTypes.find(
                            t => t.value?.toLowerCase().trim() === typeParam.toLowerCase().trim()
                        )
                        if (match) {
                            params.type_id = [match.id]
                        } else {
                            // Type is known but has zero products — force empty
                            params._emptyResult = true
                        }
                        titleParts.push(typeObj.value)
                    } else {
                        // Completely unknown type slug — force empty
                        console.warn(`[products] Unknown type slug: "${typeParam}"`)
                        params._emptyResult = true
                        titleParts.push(typeParam)
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

            // Short-circuit: filters resolved to a known-empty result
            // (e.g. a type with zero products in the catalogue)
            if (params._emptyResult || resolvedParams.current?._emptyResult) {
                setProducts([])
                setTotalCount(0)
                setCurrentOffset(0)
                setLoading(false)
                setLoadingMore(false)
                return
            }
            
            let { products: fetchedProducts, count } = await getProducts(params)

            // Universal search: client-side filtering across all metadata
            const universalQuery = append
                ? resolvedParams.current._universalSearch
                : params._universalSearch

            if (universalQuery) {
                fetchedProducts = fetchedProducts.filter(p => {
                    const haystack = [
                        p.title,
                        p.description,
                        p.handle,
                        p.type?.value,
                        p.collection?.title,
                        ...(p.categories?.map(c => c.name) || []),
                        ...(p.tags?.map(t => t.value) || []),
                        // ── Variant data (title, sku) ──
                        ...(p.variants?.map(v => v.title) || []),
                        ...(p.variants?.map(v => v.sku) || []),
                        // ── Product options & values (e.g. Color → Orange) ──
                        ...(p.options?.map(o => o.title) || []),
                        ...(p.options?.flatMap(o =>
                            o.values?.map(v => v.value) || []
                        ) || []),
                    ].filter(Boolean).join(' ').toLowerCase()
                    return haystack.includes(universalQuery)
                })
                count = fetchedProducts.length
            }

            if (append) {
                setProducts(prev => [...prev, ...fetchedProducts])
            } else {
                setProducts(fetchedProducts)
                setTotalCount(count)
            }
            setCurrentOffset(offset + fetchedProducts.length)
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

    // Signal to MobileSearch that floating filters are open (hides the search FAB)
    useEffect(() => {
        if (floatingPanelOpen) {
            document.body.dataset.mobileFiltersOpen = ''
        } else {
            delete document.body.dataset.mobileFiltersOpen
        }
        return () => { delete document.body.dataset.mobileFiltersOpen }
    }, [floatingPanelOpen])

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
                                    <ProductFilters floating onApply={() => setFloatingPanelOpen(false)} />
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
