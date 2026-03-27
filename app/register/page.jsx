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

export default function RegisterPage() {
    const router = useRouter()
    const { register, error } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        studio_name: '',
        tattoo_license: '',
        phone: '',
        city: '',
        country: ''
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
            await register(formData)
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
                    <h1 className={styles.title}>Crear Cuenta Profesional</h1>
                    <p className={styles.subtitle}>Únete a nuestra red de artistas tatuadores profesionales</p>

                    {/* Google Sign-Up */}
                    <div className={styles.socialAuth}>
                        <GoogleButton
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            text="registrarse_con"
                        />
                    </div>

                    <div className={styles.divider}>
                        <span>o regístrate con el correo electrónico</span>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {(formError || error) && (
                            <div className={styles.error}>
                                {formError || error}
                            </div>
                        )}

                        <Input
                            type="text"
                            name="studio_name"
                            label="Nombre del Estudio"
                            placeholder="Tu estudio de tatuajes"
                            value={formData.studio_name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="email"
                            name="email"
                            label="Correo Electrónico"
                            placeholder="tu@correo.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="password"
                            name="password"
                            label="Contraseña"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="text"
                            name="tattoo_license"
                            label="Licencia de Tatuaje (Opcional)"
                            placeholder="Número de licencia profesional"
                            value={formData.tattoo_license}
                            onChange={handleChange}
                        />

                        <div className={styles.row}>
                            <Input
                                type="tel"
                                name="phone"
                                label="Teléfono"
                                placeholder="+34 600 000 000"
                                value={formData.phone}
                                onChange={handleChange}
                            />

                            <Input
                                type="text"
                                name="city"
                                label="Ciudad"
                                placeholder="Tu ciudad"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Creando Cuenta...' : 'Crear Cuenta Profesional'}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className={styles.link}>
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
