import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import { Heading, Text } from '@/components/atoms/Typography/Typography'
import Card from '@/components/atoms/Card/Card'
import styles from './page.module.css'

export const metadata = {
    title: 'Envío - AB Tattoo Supplies',
    description: 'Información sobre envíos, plazos de entrega, costes y zonas de envío de AB Tattoo Supplies.',
}

export default function ShippingPage() {
    return (
        <main className={styles.main}>
            <Header />
            <div className={styles.container}>
                <div className={styles.header}>
                    <Heading level={1}>Política de Envío</Heading>
                    <Text color="muted">
                        Toda la información sobre nuestros envíos, plazos de entrega y proveedores de transporte.
                    </Text>
                </div>

                <div className={styles.sections}>
                    {/* Zonas de envío */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Zonas de envío</Heading>
                            <Text color="muted">
                                Realizamos envíos a toda España peninsular, Baleares, Canarias, Ceuta y Melilla. 
                                También enviamos a países de la Unión Europea.
                            </Text>
                            <div className={styles.table}>
                                <div className={styles.tableHeader}>
                                    <span>Zona</span>
                                    <span>Plazo estimado</span>
                                    <span>Coste</span>
                                </div>
                                <div className={styles.tableRow}>
                                    <span>España peninsular</span>
                                    <span>24-48 horas</span>
                                    <span>4,95 €</span>
                                </div>
                                <div className={styles.tableRow}>
                                    <span>Baleares</span>
                                    <span>48-72 horas</span>
                                    <span>6,95 €</span>
                                </div>
                                <div className={styles.tableRow}>
                                    <span>Canarias, Ceuta y Melilla</span>
                                    <span>5-7 días laborables</span>
                                    <span>9,95 €</span>
                                </div>
                                <div className={styles.tableRow}>
                                    <span>Unión Europea</span>
                                    <span>5-10 días laborables</span>
                                    <span>12,95 €</span>
                                </div>
                            </div>
                            <div className={styles.highlight}>
                                <Text>
                                    <strong>🚚 Envío gratuito en pedidos superiores a 79 €</strong> para España peninsular.
                                </Text>
                            </div>
                            <Text size="small" color="muted">
                                [PLACEHOLDER: Actualizar zonas, plazos y tarifas con datos reales del proveedor de transporte]
                            </Text>
                        </div>
                    </Card>

                    {/* Proveedores de transporte */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Proveedores de transporte</Heading>
                            <Text color="muted">
                                Trabajamos con los principales proveedores de transporte para garantizar 
                                que tus pedidos lleguen de forma rápida y segura.
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        <strong>SEUR / GLS</strong> — Envíos estándar a España peninsular y Baleares.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Correos Express</strong> — Envíos a Canarias, Ceuta y Melilla.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>DHL / UPS</strong> — Envíos internacionales a la Unión Europea.
                                    </Text>
                                </li>
                            </ul>
                            <Text size="small" color="muted">
                                [PLACEHOLDER: Confirmar proveedores de transporte reales]
                            </Text>
                        </div>
                    </Card>

                    {/* Seguimiento */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Seguimiento de pedidos</Heading>
                            <Text color="muted">
                                Una vez que tu pedido haya sido enviado, recibirás un email con el número 
                                de seguimiento. Podrás consultar el estado de tu envío en todo momento 
                                desde tu cuenta o directamente en la web del transportista.
                            </Text>
                            <Text color="muted">
                                Si no has recibido el email de seguimiento en las siguientes 24 horas 
                                desde la confirmación del pedido, por favor revisa tu carpeta de spam 
                                o contacta con nosotros en{' '}
                                <a href="mailto:info@abtattoo.com" className={styles.link}>info@abtattoo.com</a>.
                            </Text>
                        </div>
                    </Card>

                    {/* Preparación */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Preparación del pedido</Heading>
                            <Text color="muted">
                                Los pedidos realizados antes de las <strong>14:00h (CET)</strong> de lunes a viernes 
                                se preparan y envían el mismo día. Los pedidos realizados después de esa hora 
                                o en fines de semana y festivos se procesarán el siguiente día laborable.
                            </Text>
                        </div>
                    </Card>

                    {/* Embalaje */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Embalaje y protección</Heading>
                            <Text color="muted">
                                Todos nuestros productos se embalan cuidadosamente para garantizar que 
                                lleguen en perfecto estado. Los artículos frágiles (tintas, botellas) 
                                se protegen con materiales de relleno adicionales.
                            </Text>
                            <Text color="muted">
                                El embalaje es discreto, sin indicaciones del contenido en el exterior del paquete.
                            </Text>
                        </div>
                    </Card>

                    {/* Incidencias */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Incidencias en el envío</Heading>
                            <Text color="muted">
                                Si tu pedido llega dañado, incompleto o no lo recibes dentro del plazo 
                                estimado, por favor contacta con nosotros lo antes posible:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        Email: <a href="mailto:info@abtattoo.com" className={styles.link}>info@abtattoo.com</a>
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Indicando tu número de pedido y una descripción del problema.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Si el paquete está dañado, incluye fotografías del estado del embalaje y del producto.
                                    </Text>
                                </li>
                            </ul>
                        </div>
                    </Card>
                </div>
            </div>
            <Footer />
        </main>
    )
}
