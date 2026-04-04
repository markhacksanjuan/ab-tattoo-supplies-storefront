'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCollections, getCategories, getProductTypes, getProducts } from '@/lib/api/medusa'
import {
    PRODUCT_TYPES,
    resolveTypeSlug,
    getCategoriesForType,
    getBrandsForType,
    enrichWithApiData,
} from '@/lib/data/navigation'
import styles from './ProductFilters.module.css'

/**
 * Helper: gendered Spanish label for "view all" within a type.
 * "Agujas" → "Ver todas las Agujas"
 * "Tintas" → "Ver todas las Tintas"
 * "Material" → "Ver todo el Material"
 */
function getViewAllLabel(typeName) {
    const lower = typeName.toLowerCase()
    if (lower.endsWith('as')) return `Ver todas las ${typeName}`
    if (lower.endsWith('s')) return `Ver todos los ${typeName}`
    return `Ver todo el ${typeName}`
}

export default function ProductFilters({ onFiltersChange, onApply, floating = false, disableAutoOpen = false }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [collections, setCollections] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtersError, setFiltersError] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const enrichedRef = useRef(false)
    
    // Get current filter values from URL
    const currentCollection = searchParams.get('collection') || ''
    const currentCategory = searchParams.get('category') || ''
    const currentType = searchParams.get('type') || ''

    // Pending state for floating mode (selections applied only when "Aplicar" is clicked)
    const [pendingType, setPendingType] = useState(currentType)
    const [pendingCategory, setPendingCategory] = useState(currentCategory)
    const [pendingCollection, setPendingCollection] = useState(currentCollection)

    // Effective values: pending state in floating mode, URL state in sidebar mode
    const effectiveType = floating ? pendingType : currentType
    const effectiveCategory = floating ? pendingCategory : currentCategory
    const effectiveCollection = floating ? pendingCollection : currentCollection

    // Signal to MobileSearch that mobile filters are open (hides the search FAB)
    // — only for sidebar instance; floating panel manages this in page.jsx
    useEffect(() => {
        if (floating) return
        if (mobileOpen) {
            document.body.dataset.mobileFiltersOpen = ''
        } else {
            delete document.body.dataset.mobileFiltersOpen
        }
        return () => { if (!floating) delete document.body.dataset.mobileFiltersOpen }
    }, [mobileOpen, floating])

    // Auto-open filters on mobile when a type is selected (to show categories)
    // — disabled for floating instance and when floating panel is active
    useEffect(() => {
        if (floating || disableAutoOpen) return
        if (currentType && !currentCategory) {
            setMobileOpen(true)
        }
    }, [currentType, floating, disableAutoOpen])

    useEffect(() => {
        loadFilters()
    }, [])

    // Enrich type IDs in background
    useEffect(() => {
        if (enrichedRef.current) return
        enrichedRef.current = true
        enrichWithApiData(getProductTypes)
    }, [])

    const loadFilters = async () => {
        setLoading(true)
        setFiltersError(false)
        try {
            const [collectionsData, categoriesData] = await Promise.all([
                getCollections().catch(() => []),
                getCategories().catch(() => []),
            ])
            
            setCollections(collectionsData || [])
            setCategories(categoriesData || [])
        } catch (error) {
            console.error('Error loading filters:', error)
            setFiltersError(true)
        } finally {
            setLoading(false)
        }
    }

    // Fetch brands (collections) available for the currently selected category
    const [categoryBrandHandles, setCategoryBrandHandles] = useState(null)

    useEffect(() => {
        if (!effectiveCategory) {
            setCategoryBrandHandles(null)
            return
        }

        const cat = categories.find(c => c.handle === effectiveCategory)
        if (!cat) return

        let cancelled = false
        const fetchBrands = async () => {
            try {
                const params = { limit: 500, category_id: [cat.id] }
                const activeTypeObj = resolveTypeSlug(effectiveType)
                if (activeTypeObj?.typeId) {
                    params.type_id = [activeTypeObj.typeId]
                }
                const { products } = await getProducts(params)
                if (cancelled) return

                const handles = [...new Set(
                    products
                        .filter(p => p.collection?.handle)
                        .map(p => p.collection.handle)
                )]
                setCategoryBrandHandles(handles)
            } catch (error) {
                console.error('Error fetching brands for category:', error)
                if (!cancelled) setCategoryBrandHandles(null)
            }
        }

        fetchBrands()
        return () => { cancelled = true }
    }, [effectiveCategory, effectiveType, categories])

    const updateFilters = (key, value) => {
        if (floating) {
            // Floating mode: accumulate selections in pending state
            if (key === 'type') {
                setPendingType(value)
                setPendingCategory('')
                setPendingCollection('')
            } else if (key === 'category') {
                setPendingCategory(value)
            } else if (key === 'collection') {
                setPendingCollection(value)
            }
            return
        }

        // Sidebar mode: apply immediately to URL
        const params = new URLSearchParams(searchParams.toString())
        
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // When changing type, clear category and collection (they belong to the old type)
        if (key === 'type') {
            params.delete('category')
            params.delete('collection')
        }
        
        router.push(`/products?${params.toString()}`)
        
        if (onFiltersChange) {
            onFiltersChange({
                collection: key === 'collection' ? value : (key === 'type' ? '' : currentCollection),
                category: key === 'category' ? value : (key === 'type' ? '' : currentCategory),
                type: key === 'type' ? value : currentType,
            }, key)
        }
    }

    /** Apply pending filters to URL and close the floating panel */
    const applyFilters = () => {
        const params = new URLSearchParams()
        if (pendingType) params.set('type', pendingType)
        if (pendingCategory) params.set('category', pendingCategory)
        if (pendingCollection) params.set('collection', pendingCollection)
        // Preserve search query if present
        const q = searchParams.get('q')
        if (q) params.set('q', q)

        const qs = params.toString()
        router.push(qs ? `/products?${qs}` : '/products')
        if (onApply) onApply()
    }

    const clearAllFilters = () => {
        if (floating) {
            setPendingType('')
            setPendingCategory('')
            setPendingCollection('')
            return
        }
        router.push('/products')
        if (onFiltersChange) {
            onFiltersChange({ collection: '', category: '', type: '' })
        }
    }

    const hasActiveFilters = effectiveCollection || effectiveCategory || effectiveType

    // Determine which categories and collections to show based on active type
    const activeType = resolveTypeSlug(effectiveType)
    const allowedCategoryHandles = activeType ? getCategoriesForType(effectiveType) : null
    const allowedBrandHandles = activeType ? getBrandsForType(effectiveType) : null

    // Filter API data to only show relevant items
    const filteredCategories = allowedCategoryHandles
        ? categories.filter(cat => allowedCategoryHandles.includes(cat.handle))
        : categories.filter(cat => !cat.parent_category_id && !cat.parent_category)

    // Filter brands: first by type, then by category if one is selected
    let filteredCollections = allowedBrandHandles
        ? collections.filter(col => allowedBrandHandles.includes(col.handle))
        : collections

    // When a category is selected, narrow to only brands with products in that category
    if (categoryBrandHandles !== null) {
        filteredCollections = filteredCollections.filter(col => categoryBrandHandles.includes(col.handle))
    }

    const activeFilterCount = [effectiveType, effectiveCategory, effectiveCollection].filter(Boolean).length

    if (loading) {
        return (
            <aside className={styles.filters}>
                <div className={styles.loading}>
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                    <div className={styles.skeleton} />
                </div>
            </aside>
        )
    }

    return (
        <aside className={`${styles.filters} ${floating ? styles.filtersFloating : ''}`}>
            {/* Mobile toggle button — hidden when floating */}
            {!floating && (
            <button
                className={styles.mobileToggle}
                onClick={() => setMobileOpen(prev => !prev)}
                aria-expanded={mobileOpen}
            >
                <span className={styles.mobileToggleLabel}>
                    <svg className={styles.filterIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="8" y1="12" x2="20" y2="12" />
                        <line x1="12" y1="18" x2="20" y2="18" />
                    </svg>
                    Filtros
                    {activeFilterCount > 0 && (
                        <span className={styles.badge}>{activeFilterCount}</span>
                    )}
                </span>
                <svg
                    className={`${styles.chevron} ${mobileOpen ? styles.chevronOpen : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            )}

            <div className={`${styles.filterBody} ${(mobileOpen || floating) ? styles.filterBodyOpen : ''}`}>
            <div className={styles.filterBodyInner}>
            <div className={styles.header}>
                <h3 className={styles.title}>Filtros</h3>
                {hasActiveFilters && (
                    <button 
                        className={styles.clearButton}
                        onClick={clearAllFilters}
                    >
                        Borrar todo
                    </button>
                )}
            </div>

            {/* Product Types Filter — always shown, uses slugs */}
            <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Tipo de Producto</h4>
                <ul className={styles.filterList}>
                    <li>
                        <button
                            className={`${styles.filterItem} ${!effectiveType ? styles.active : ''}`}
                            onClick={() => updateFilters('type', '')}
                        >
                            Todos los tipos
                        </button>
                    </li>
                    {PRODUCT_TYPES.map((type) => (
                        <li key={type.slug}>
                            <button
                                className={`${styles.filterItem} ${effectiveType === type.slug ? styles.active : ''}`}
                                onClick={() => updateFilters('type', type.slug)}
                            >
                                {type.value}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Categories Filter — only shown when a type is selected */}
            {activeType && filteredCategories.length > 0 && (
                <div className={styles.filterGroup}>
                    <h4 className={styles.filterTitle}>
                        {`Categorías de ${activeType.value}`}
                    </h4>
                    <ul className={styles.filterList}>
                        <li>
                            <button
                                className={`${styles.filterItem} ${!effectiveCategory ? styles.active : ''}`}
                                onClick={() => updateFilters('category', '')}
                            >
                                {getViewAllLabel(activeType.value)}
                            </button>
                        </li>
                        {filteredCategories.map((category) => (
                            <li key={category.id}>
                                <button
                                    className={`${styles.filterItem} ${effectiveCategory === category.handle ? styles.active : ''}`}
                                    onClick={() => updateFilters('category', category.handle)}
                                >
                                    {category.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Collections/Brands Filter — contextual to active type */}
            {filteredCollections.length > 0 && (
                <div className={styles.filterGroup}>
                    <h4 className={styles.filterTitle}>
                        {activeType ? `Marcas de ${activeType.value}` : 'Marcas'}
                    </h4>
                    <ul className={styles.filterList}>
                        <li>
                            <button
                                className={`${styles.filterItem} ${!effectiveCollection ? styles.active : ''}`}
                                onClick={() => updateFilters('collection', '')}
                            >
                                Todas las marcas
                            </button>
                        </li>
                        {filteredCollections.map((collection) => (
                            <li key={collection.id}>
                                <button
                                    className={`${styles.filterItem} ${effectiveCollection === collection.handle ? styles.active : ''}`}
                                    onClick={() => updateFilters('collection', collection.handle)}
                                >
                                    {collection.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {/* Apply button — only in floating mode */}
            {floating && (
                <button className={styles.applyButton} onClick={applyFilters}>
                    Aplicar filtros
                    {activeFilterCount > 0 && (
                        <span className={styles.applyBadge}>{activeFilterCount}</span>
                    )}
                </button>
            )}
            </div>{/* end filterBodyInner */}
            </div>{/* end filterBody */}
        </aside>
    )
}
