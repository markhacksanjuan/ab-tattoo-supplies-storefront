'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCollections, getCategories, getProductTypes } from '@/lib/api/medusa'
import {
    PRODUCT_TYPES,
    resolveTypeSlug,
    getCategoriesForType,
    getBrandsForType,
    enrichWithApiData,
} from '@/lib/data/navigation'
import styles from './ProductFilters.module.css'

export default function ProductFilters({ onFiltersChange }) {
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

    const updateFilters = (key, value) => {
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
            })
        }
    }

    const clearAllFilters = () => {
        router.push('/products')
        if (onFiltersChange) {
            onFiltersChange({ collection: '', category: '', type: '' })
        }
    }

    const hasActiveFilters = currentCollection || currentCategory || currentType

    // Determine which categories and collections to show based on active type
    const activeType = resolveTypeSlug(currentType)
    const allowedCategoryHandles = activeType ? getCategoriesForType(currentType) : null
    const allowedBrandHandles = activeType ? getBrandsForType(currentType) : null

    // Filter API data to only show relevant items
    const filteredCategories = allowedCategoryHandles
        ? categories.filter(cat => allowedCategoryHandles.includes(cat.handle))
        : categories.filter(cat => !cat.parent_category_id && !cat.parent_category)

    const filteredCollections = allowedBrandHandles
        ? collections.filter(col => allowedBrandHandles.includes(col.handle))
        : collections

    const activeFilterCount = [currentType, currentCategory, currentCollection].filter(Boolean).length

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
        <aside className={styles.filters}>
            {/* Mobile toggle button */}
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

            <div className={`${styles.filterBody} ${mobileOpen ? styles.filterBodyOpen : ''}`}>
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
                            className={`${styles.filterItem} ${!currentType ? styles.active : ''}`}
                            onClick={() => updateFilters('type', '')}
                        >
                            Todos los tipos
                        </button>
                    </li>
                    {PRODUCT_TYPES.map((type) => (
                        <li key={type.slug}>
                            <button
                                className={`${styles.filterItem} ${currentType === type.slug ? styles.active : ''}`}
                                onClick={() => updateFilters('type', type.slug)}
                            >
                                {type.value}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Categories Filter — contextual to active type */}
            {filteredCategories.length > 0 && (
                <div className={styles.filterGroup}>
                    <h4 className={styles.filterTitle}>
                        {activeType ? `Categorías de ${activeType.value}` : 'Categorías'}
                    </h4>
                    <ul className={styles.filterList}>
                        <li>
                            <button
                                className={`${styles.filterItem} ${!currentCategory ? styles.active : ''}`}
                                onClick={() => updateFilters('category', '')}
                            >
                                Todas las categorías
                            </button>
                        </li>
                        {filteredCategories.map((category) => (
                            <li key={category.id}>
                                <button
                                    className={`${styles.filterItem} ${currentCategory === category.handle ? styles.active : ''}`}
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
                                className={`${styles.filterItem} ${!currentCollection ? styles.active : ''}`}
                                onClick={() => updateFilters('collection', '')}
                            >
                                Todas las marcas
                            </button>
                        </li>
                        {filteredCollections.map((collection) => (
                            <li key={collection.id}>
                                <button
                                    className={`${styles.filterItem} ${currentCollection === collection.handle ? styles.active : ''}`}
                                    onClick={() => updateFilters('collection', collection.handle)}
                                >
                                    {collection.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </div>{/* end filterBodyInner */}
            </div>{/* end filterBody */}
        </aside>
    )
}
