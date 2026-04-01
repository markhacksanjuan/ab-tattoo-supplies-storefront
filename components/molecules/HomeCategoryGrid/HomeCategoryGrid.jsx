'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { PRODUCT_TYPES, enrichWithApiData } from '@/lib/data/navigation'
import { getProductTypes } from '@/lib/api/medusa'
import { getIconComponent } from '@/lib/utils/iconMap'
import styles from './HomeCategoryGrid.module.css'

export default function HomeCategoryGrid() {
    const enrichedRef = useRef(false)

    // Enrich type IDs in background — no state, no re-render
    useEffect(() => {
        if (enrichedRef.current) return
        enrichedRef.current = true
        enrichWithApiData(getProductTypes)
    }, [])

    return (
        <section className={styles.categories}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Comprar por tipo</h2>
                <div className={styles.categoryGrid}>
                    {PRODUCT_TYPES.map((type) => {
                        const IconComponent = getIconComponent(type.icon)
                        return (
                            <Link
                                href={`/products?type=${type.slug}`}
                                key={type.slug}
                                className={styles.categoryCard}
                            >
                                <span className={styles.categoryIcon}>
                                    <IconComponent size={32} />
                                </span>
                                <h3 className={styles.categoryTitle}>{type.value}</h3>
                                {type.description && (
                                    <p className={styles.categoryDesc}>{type.description}</p>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
