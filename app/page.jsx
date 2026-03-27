import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Button from '@/components/atoms/Button/Button'
import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
    const categories = [
        {
            id: 'inks',
            title: 'Inks',
            description: 'Premium tattoo inks from top brands',
            icon: '🎨'
        },
        {
            id: 'needles',
            title: 'Needles',
            description: 'Precision needles for every style',
            icon: '💉'
        },
        {
            id: 'machines',
            title: 'Machines',
            description: 'Professional tattoo machines',
            icon: '⚡'
        },
        {
            id: 'supplies',
            title: 'Supplies',
            description: 'Essential studio supplies',
            icon: '🧴'
        },
    ]

    return (
        <main className={styles.main}>
            <Header />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Professional<br />
                        <span className={styles.heroAccent}>Tattoo Supplies</span>
                    </h1>
                    <p className={styles.heroText}>
                        Equipo y suministros de primera calidad para tatuadores profesionales.
                        Calidad en la que puedes confiar, resultados que hablan por sí mismos.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/products">
                            <Button variant="primary" size="large">
                                Comprar ahora
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" size="large">
                                Únete como profesional
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className={styles.heroDecoration} />
            </section>

            {/* Categories */}
            <section className={styles.categories}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Comprar por categoría</h2>
                    <div className={styles.categoryGrid}>
                        {categories.map((category) => (
                            <Link
                                href={`/products?category=${category.id}`}
                                key={category.id}
                                className={styles.categoryCard}
                            >
                                <span className={styles.categoryIcon}>{category.icon}</span>
                                <h3 className={styles.categoryTitle}>{category.title}</h3>
                                <p className={styles.categoryDesc}>{category.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <div className={styles.featureGrid}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🏆</span>
                            <h4 className={styles.featureTitle}>Calidad Profesional</h4>
                            <p className={styles.featureText}>Solo marcas premium confiables por profesionales en todo el mundo</p>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🚚</span>
                            <h4 className={styles.featureTitle}>Envío Rápido</h4>
                            <p className={styles.featureText}>Entrega exprés para mantener tu estudio abastecido</p>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>💬</span>
                            <h4 className={styles.featureTitle}>Soporte Experto</h4>
                            <p className={styles.featureText}>Soporte dedicado de profesionales de la industria</p>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}>🔒</span>
                            <h4 className={styles.featureTitle}>Pedidos Seguros</h4>
                            <p className={styles.featureText}>Pagos protegidos y embalaje discreto</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <div className={styles.container}>
                    <h2 className={styles.ctaTitle}>¿Listo para elevar tu arte?</h2>
                    <p className={styles.ctaText}>
                        Únete a miles de artistas del tatuaje profesionales que confían en AB-Tattoo para sus suministros.
                    </p>
                    <Link href="/register">
                        <Button variant="primary" size="large">
                            Crear cuenta profesional
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    )
}
