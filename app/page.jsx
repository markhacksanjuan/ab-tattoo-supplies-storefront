import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import HomeCategoryGrid from '@/components/molecules/HomeCategoryGrid/HomeCategoryGrid'
import Button from '@/components/atoms/Button/Button'
import Link from 'next/link'
import { Trophy, Truck, MessageCircle, ShieldCheck } from 'lucide-react'
import styles from './page.module.css'

export default function Home() {
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
            <HomeCategoryGrid />

            {/* Features */}
            <section className={styles.features}>
                <div className={styles.container}>
                    <div className={styles.featureGrid}>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}><Trophy size={28} /></span>
                            <h4 className={styles.featureTitle}>Calidad Profesional</h4>
                            <p className={styles.featureText}>Solo marcas premium confiables por profesionales en todo el mundo</p>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}><Truck size={28} /></span>
                            <h4 className={styles.featureTitle}>Envío Rápido</h4>
                            <p className={styles.featureText}>Entrega exprés para mantener tu estudio abastecido</p>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}><MessageCircle size={28} /></span>
                            <h4 className={styles.featureTitle}>Soporte Experto</h4>
                            <p className={styles.featureText}>Soporte dedicado de profesionales de la industria</p>
                        </div>
                        <div className={styles.feature}>
                            <span className={styles.featureIcon}><ShieldCheck size={28} /></span>
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
