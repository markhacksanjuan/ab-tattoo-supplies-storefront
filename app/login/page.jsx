'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import Input from '@/components/atoms/Input/Input'
import Button from '@/components/atoms/Button/Button'
import GoogleButton from '@/components/atoms/GoogleButton/GoogleButton'
import styles from './page.module.css'

export default function LoginPage() {
    const router = useRouter()
    const { login, error } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setFormError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setFormError('')

        try {
            await login(formData.email, formData.password)
            router.push('/account')
        } catch (err) {
            setFormError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = () => {
        router.push('/account')
    }

    const handleGoogleError = (message) => {
        setFormError(message)
    }

    return (
        <main className={styles.main}>
            <Header />

            <div className={styles.container}>
                <div className={styles.formWrapper}>
                    <h1 className={styles.title}>Bienvenido de nuevo</h1>
                    <p className={styles.subtitle}>Inicia sesión en tu cuenta profesional</p>

                    {/* Google Sign-In */}
                    <div className={styles.socialAuth}>
                        <GoogleButton
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            text="iniciar_sesión_con"
                        />
                    </div>

                    <div className={styles.divider}>
                        <span>o continúa con el correo electrónico</span>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {(formError || error) && (
                            <div className={styles.error}>
                                {formError || error}
                            </div>
                        )}

                        <Input
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="password"
                            name="password"
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>
                            ¿No tienes una cuenta?{' '}
                            <Link href="/register" className={styles.link}>
                                Crear Cuenta Profesional
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
