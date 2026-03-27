'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCollections, getCategories, getProductTypes } from '@/lib/api/medusa'
import styles from './ProductFilters.module.css'

export default function ProductFilters({ onFiltersChange }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [collections, setCollections] = useState([])
    const [categories, setCategories] = useState([])
    const [productTypes, setProductTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtersError, setFiltersError] = useState(false)
    
    // Get current filter values from URL
    const currentCollection = searchParams.get('collection') || ''
    const currentCategory = searchParams.get('category') || ''
    const currentType = searchParams.get('type') || ''

    useEffect(() => {
        loadFilters()
    }, [])

    const loadFilters = async () => {
        setLoading(true)
        setFiltersError(false)
        try {
            const [collectionsData, categoriesData, typesData] = await Promise.all([
                getCollections().catch(() => []),
                getCategories().catch(() => []),
                getProductTypes().catch(() => [])
            ])
            
            setCollections(collectionsData || [])
            setCategories(categoriesData || [])
            setProductTypes(typesData || [])
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
        
        // Navigate to new URL with updated params
        router.push(`/products?${params.toString()}`)
        
        // Notify parent component
        if (onFiltersChange) {
            onFiltersChange({
                collection: key === 'collection' ? value : currentCollection,
                category: key === 'category' ? value : currentCategory,
                type: key === 'type' ? value : currentType
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
    const hasFilters = (collections?.length > 0) || (categories?.length > 0) || (productTypes?.length > 0)

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

            {/* Collections Filter */}
            {collections?.length > 0 && (
                <div className={styles.filterGroup}>
                    <h4 className={styles.filterTitle}>Colecciones</h4>
                    <ul className={styles.filterList}>
                        <li>
                            <button
                                className={`${styles.filterItem} ${!currentCollection ? styles.active : ''}`}
                                onClick={() => updateFilters('collection', '')}
                            >
                                Todas las colecciones
                            </button>
                        </li>
                        {collections.map((collection) => (
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

            {/* Categories Filter */}
            {categories?.length > 0 && (
                <div className={styles.filterGroup}>
                    <h4 className={styles.filterTitle}>Categorías</h4>
                    <ul className={styles.filterList}>
                        <li>
                            <button
                                className={`${styles.filterItem} ${!currentCategory ? styles.active : ''}`}
                                onClick={() => updateFilters('category', '')}
                            >
                                Todas las categorías
                            </button>
                        </li>
                        {categories.map((category) => (
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

            {/* Product Types Filter */}
            {productTypes?.length > 0 && (
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
                        {productTypes.map((type) => (
                            <li key={type.id}>
                                <button
                                    className={`${styles.filterItem} ${currentType === type.id ? styles.active : ''}`}
                                    onClick={() => updateFilters('type', type.id)}
                                >
                                    {type.value}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Empty state */}
            {!hasFilters && (
                <div className={styles.empty}>
                    <p>No hay filtros disponibles aún.</p>
                    <p className={styles.hint}>
                        Agrega colecciones, categorías o tipos de productos en el panel de administración de Medusa.
                    </p>
                </div>
            )}
        </aside>
    )
}
