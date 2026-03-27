'use client'

import { useState } from 'react'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import { Heading, Text } from '@/components/atoms/Typography/Typography'
import Input from '@/components/atoms/Input/Input'
import Button from '@/components/atoms/Button/Button'
import Card from '@/components/atoms/Card/Card'
import { sendContactMessage } from '@/lib/api/user'
import styles from './page.module.css'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState('idle') // idle | sending | sent | error
    const [errorMsg, setErrorMsg] = useState('')

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('sending')
        setErrorMsg('')

        try {
            await sendContactMessage(formData)
            setStatus('sent')
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (err) {
            setStatus('error')
            setErrorMsg('No se pudo enviar el mensaje. Por favor, inténtalo de nuevo más tarde.')
        }
    }

    return (
        <main className={styles.main}>
            <Header />
            <div className={styles.container}>
                <div className={styles.header}>
                    <Heading level={1}>Contacto</Heading>
                    <Text color="muted">
                        ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Rellena el formulario 
                        y te responderemos lo antes posible.
                    </Text>
                </div>

                <div className={styles.content}>
                    {/* Contact Form */}
                    <Card variant="outlined" padding="large" className={styles.formCard}>
                        {status === 'sent' ? (
                            <div className={styles.successMessage}>
                                <div className={styles.successIcon}>✓</div>
                                <Heading level={3}>Mensaje enviado</Heading>
                                <Text color="muted">
                                    Hemos recibido tu mensaje. Te responderemos en un plazo de 24-48 horas laborables.
                                </Text>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setStatus('idle')}
                                    style={{ marginTop: 'var(--spacing-lg)' }}
                                >
                                    Enviar otro mensaje
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formRow}>
                                    <Input
                                        label="Nombre"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Tu nombre completo"
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="tu@email.com"
                                        required
                                    />
                                </div>
                                <Input
                                    label="Asunto"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="¿En qué podemos ayudarte?"
                                    required
                                />
                                <div className={styles.textareaGroup}>
                                    <label className={styles.textareaLabel}>Mensaje</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Escribe tu mensaje aquí..."
                                        className={styles.textarea}
                                        rows={6}
                                        required
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className={styles.errorMessage}>
                                        <Text color="muted">{errorMsg}</Text>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    disabled={status === 'sending'}
                                >
                                    {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
                                </Button>
                            </form>
                        )}
                    </Card>

                    {/* Contact Info Sidebar */}
                    <div className={styles.sidebar}>
                        <Card variant="outlined" padding="large">
                            <div className={styles.infoBlock}>
                                <div className={styles.infoIcon}>✉</div>
                                <Heading level={5}>Email</Heading>
                                <Text color="muted">
                                    <a href="mailto:info@abtattoo.com" className={styles.infoLink}>
                                        info@abtattoo.com
                                    </a>
                                </Text>
                            </div>
                        </Card>

                        <Card variant="outlined" padding="large">
                            <div className={styles.infoBlock}>
                                <div className={styles.infoIcon}>🕐</div>
                                <Heading level={5}>Horario de atención</Heading>
                                <Text color="muted">Lunes a Viernes</Text>
                                <Text color="muted">9:00 - 18:00 (CET)</Text>
                            </div>
                        </Card>

                        <Card variant="outlined" padding="large">
                            <div className={styles.infoBlock}>
                                <div className={styles.infoIcon}>⏱</div>
                                <Heading level={5}>Tiempo de respuesta</Heading>
                                <Text color="muted">
                                    Respondemos en un plazo máximo de 24-48 horas laborables.
                                </Text>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    )
}
