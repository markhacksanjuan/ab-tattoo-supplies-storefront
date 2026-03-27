'use client'

import { useState } from 'react'
import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import { Heading, Text } from '@/components/atoms/Typography/Typography'
import styles from './page.module.css'

const FAQ_DATA = [
    {
        category: 'Pedidos',
        questions: [
            {
                q: '¿Cómo puedo realizar un pedido?',
                a: 'Navega por nuestro catálogo, añade los productos que desees al carrito y completa el proceso de compra. Necesitarás crear una cuenta o iniciar sesión para finalizar tu pedido.'
            },
            {
                q: '¿Puedo modificar o cancelar un pedido ya realizado?',
                a: 'Si tu pedido aún no ha sido procesado, puedes contactarnos lo antes posible a info@abtattoo.com para solicitar la modificación o cancelación. Una vez que el pedido ha sido enviado, deberás esperar a recibirlo y seguir el proceso de devolución.'
            },
            {
                q: '¿Qué métodos de pago aceptáis?',
                a: 'Aceptamos pagos con tarjeta de crédito y débito (Visa, Mastercard, American Express) a través de nuestra pasarela de pago segura Stripe. Todos los pagos se procesan de forma cifrada y segura.'
            },
            {
                q: '¿Es seguro comprar en AB Tattoo?',
                a: 'Sí. Utilizamos Stripe como pasarela de pago, que cumple con los estándares PCI DSS de seguridad. Tus datos bancarios nunca se almacenan en nuestros servidores.'
            },
        ]
    },
    {
        category: 'Envío',
        questions: [
            {
                q: '¿Cuánto tarda en llegar mi pedido?',
                a: 'Los pedidos a España peninsular se entregan en 24-48 horas laborables. Baleares en 48-72 horas. Canarias, Ceuta y Melilla en 5-7 días laborables. Envíos a la UE en 5-10 días laborables.'
            },
            {
                q: '¿Cuánto cuesta el envío?',
                a: 'El envío a España peninsular cuesta 4,95 €. El envío es gratuito en pedidos superiores a 79 €. Consulta nuestra página de Envío para ver todas las tarifas por zona.'
            },
            {
                q: '¿Puedo hacer seguimiento de mi pedido?',
                a: 'Sí. Una vez que tu pedido sea enviado, recibirás un email con el número de seguimiento. También puedes consultar el estado desde tu cuenta en la sección "Mis Pedidos".'
            },
            {
                q: '¿Hacéis envíos internacionales?',
                a: 'Sí, realizamos envíos a países de la Unión Europea. Para envíos fuera de la UE, contacta con nosotros para consultar disponibilidad y tarifas.'
            },
        ]
    },
    {
        category: 'Devoluciones',
        questions: [
            {
                q: '¿Puedo devolver un producto?',
                a: 'Sí, dispones de 14 días naturales desde la recepción del producto para ejercer tu derecho de desistimiento. El producto debe estar sin usar, sin abrir y en su embalaje original.'
            },
            {
                q: '¿Cuánto tarda el reembolso?',
                a: 'Una vez recibido y verificado el producto devuelto, el reembolso se procesa en un máximo de 14 días. Dependiendo de tu entidad bancaria, puede tardar entre 5 y 10 días adicionales en reflejarse.'
            },
            {
                q: '¿Puedo devolver tintas o agujas abiertas?',
                a: 'No. Por motivos de higiene y seguridad sanitaria, no se admiten devoluciones de productos que hayan sido abiertos o cuyo precinto haya sido roto. Esto aplica especialmente a tintas, agujas, cartuchos y material desechable.'
            },
        ]
    },
    {
        category: 'Productos',
        questions: [
            {
                q: '¿Los productos son solo para profesionales?',
                a: 'Sí. AB Tattoo Supplies es una tienda dirigida exclusivamente a tatuadores profesionales. Nuestros productos son suministros profesionales de tatuaje y deben ser utilizados por personas con la formación y licencia adecuadas.'
            },
            {
                q: '¿Los productos tienen garantía?',
                a: 'Las máquinas y equipos electrónicos tienen una garantía de 2 años conforme a la legislación europea. Los consumibles (tintas, agujas, etc.) no están cubiertos por garantía una vez abiertos.'
            },
            {
                q: '¿Las tintas cumplen con la normativa europea?',
                a: 'Sí. Todas nuestras tintas cumplen con el Reglamento REACH de la Unión Europea y la normativa ResAP(2008)1 sobre requisitos y criterios para la seguridad de los tatuajes y el maquillaje permanente.'
            },
        ]
    },
    {
        category: 'Cuenta',
        questions: [
            {
                q: '¿Necesito una cuenta para comprar?',
                a: 'Sí, es necesario registrarse para realizar pedidos. Esto nos permite verificar que eres un profesional del tatuaje y te permite acceder al historial de pedidos, gestionar direcciones y agilizar futuras compras.'
            },
            {
                q: '¿Puedo iniciar sesión con Google?',
                a: 'Sí, ofrecemos la opción de inicio de sesión rápido con Google. También puedes registrarte con tu email y contraseña.'
            },
            {
                q: '¿Cómo puedo cambiar mis datos personales?',
                a: 'Accede a tu cuenta desde "Mi Cuenta" en el menú y podrás actualizar tus datos personales, dirección de facturación y direcciones de envío.'
            },
        ]
    },
]

export default function FaqPage() {
    const [openItems, setOpenItems] = useState({})

    const toggleItem = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <main className={styles.main}>
            <Header />
            <div className={styles.container}>
                <div className={styles.header}>
                    <Heading level={1}>Preguntas Frecuentes</Heading>
                    <Text color="muted">
                        Encuentra respuestas a las preguntas más comunes sobre pedidos, 
                        envíos, devoluciones y más.
                    </Text>
                </div>

                <div className={styles.categories}>
                    {FAQ_DATA.map((category, catIndex) => (
                        <div key={catIndex} className={styles.category}>
                            <Heading level={3}>{category.category}</Heading>
                            <div className={styles.questions}>
                                {category.questions.map((item, qIndex) => {
                                    const key = `${catIndex}-${qIndex}`
                                    const isOpen = openItems[key]
                                    return (
                                        <div 
                                            key={qIndex} 
                                            className={`${styles.questionItem} ${isOpen ? styles.open : ''}`}
                                        >
                                            <button
                                                className={styles.questionButton}
                                                onClick={() => toggleItem(catIndex, qIndex)}
                                                aria-expanded={isOpen}
                                            >
                                                <span className={styles.questionText}>{item.q}</span>
                                                <span className={styles.questionIcon}>
                                                    {isOpen ? '−' : '+'}
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div className={styles.answer}>
                                                    <Text color="muted">{item.a}</Text>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className={styles.contactCta}>
                    <Heading level={4}>¿No encuentras lo que buscas?</Heading>
                    <Text color="muted">
                        Si no has encontrado respuesta a tu pregunta, no dudes en contactarnos. 
                        Estaremos encantados de ayudarte.
                    </Text>
                    <a href="/contact" className={styles.ctaLink}>
                        Ir a Contacto →
                    </a>
                </div>
            </div>
            <Footer />
        </main>
    )
}
