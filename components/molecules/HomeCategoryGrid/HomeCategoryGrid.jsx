'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCategories } from '@/lib/api/medusa'
import { getIconComponent } from '@/lib/utils/iconMap'
import styles from './HomeCategoryGrid.module.css'

export default function HomeCategoryGrid() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function loadCategories() {
            try {
                const allCategories = await getCategories()
                if (cancelled) return

                // Only show parent categories (no parent) on the homepage
                const parentCategories = allCategories.filter(
                    cat => !cat.parent_category_id && !cat.parent_category
                )

                setCategories(parentCategories)
            } catch (error) {
                console.error('Error loading homepage categories:', error)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadCategories()
        return () => { cancelled = true }
    }, [])

    if (loading) {
        return (
            <section className={styles.categories}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Comprar por categoría</h2>
                    <div className={styles.categoryGrid}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={styles.categorySkeleton} />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (categories.length === 0) return null

    return (
        <section className={styles.categories}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Comprar por categoría</h2>
                <div className={styles.categoryGrid}>
                    {categories.map((category) => {
                        const IconComponent = getIconComponent(category.metadata?.icon)
                        return (
                            <Link
                                href={`/products?category=${category.handle}`}
                                key={category.id}
                                className={styles.categoryCard}
                            >
                                <span className={styles.categoryIcon}>
                                    <IconComponent size={32} />
                                </span>
                                <h3 className={styles.categoryTitle}>{category.name}</h3>
                                {category.description && (
                                    <p className={styles.categoryDesc}>{category.description}</p>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
