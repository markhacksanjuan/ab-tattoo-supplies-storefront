import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Brand */}
                <div className={styles.brand}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>AB</span>
                        <span className={styles.logoAccent}>TATTOO</span>
                    </Link>
                    <p className={styles.tagline}>
                        Professional Tattoo Supplies
                    </p>
                </div>

                {/* Links */}
                <div className={styles.links}>
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Products</h4>
                        <Link href="/products?category=inks" className={styles.link}>Inks</Link>
                        <Link href="/products?category=needles" className={styles.link}>Needles</Link>
                        <Link href="/products?category=machines" className={styles.link}>Machines</Link>
                        <Link href="/products?category=supplies" className={styles.link}>Supplies</Link>
                    </div>
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Account</h4>
                        <Link href="/login" className={styles.link}>Login</Link>
                        <Link href="/register" className={styles.link}>Register</Link>
                        <Link href="/account" className={styles.link}>My Account</Link>
                        <Link href="/account/orders" className={styles.link}>Orders</Link>
                    </div>
                    <div className={styles.column}>
                        <h4 className={styles.columnTitle}>Support</h4>
                        <Link href="/contact" className={styles.link}>Contact</Link>
                        <Link href="/shipping" className={styles.link}>Shipping</Link>
                        <Link href="/returns" className={styles.link}>Returns</Link>
                        <Link href="/faq" className={styles.link}>FAQ</Link>
                    </div>
                </div>

                {/* Bottom */}
                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} AB Tattoo Supplies. All rights reserved.
                    </p>
                    <p className={styles.pro}>
                        For Professional Use Only
                    </p>
                </div>
            </div>
        </footer>
    )
}
