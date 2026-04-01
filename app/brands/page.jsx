'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import { getCollections } from '@/lib/api/medusa'
import { Tag } from 'lucide-react'
import styles from './page.module.css'

export default function BrandsPage() {
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadBrands() {
            try {
                const collections = await getCollections()
                // Sort alphabetically by title
                const sorted = collections.sort((a, b) =>
                    (a.title || '').localeCompare(b.title || '', 'es')
                )
                setBrands(sorted)
            } catch (err) {
                console.error('Error loading brands:', err)
            } finally {
                setLoading(false)
            }
        }
        loadBrands()
    }, [])

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Todas las Marcas</h1>
                    <p className={styles.subtitle}>
                        Encuentra directamente los productos de tu marca favorita
                    </p>
                </div>

                {loading ? (
                    <div className={styles.grid}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={styles.skeleton} />
                        ))}
                    </div>
                ) : brands.length === 0 ? (
                    <p className={styles.empty}>No se encontraron marcas.</p>
                ) : (
                    <div className={styles.grid}>
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/products?collection=${brand.handle}`}
                                className={styles.brandCard}
                            >
                                <span className={styles.brandIcon}>
                                    <Tag size={28} />
                                </span>
                                <h3 className={styles.brandName}>{brand.title}</h3>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}
