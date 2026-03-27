import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import { Heading, Text } from '@/components/atoms/Typography/Typography'
import Card from '@/components/atoms/Card/Card'
import styles from './page.module.css'

export const metadata = {
    title: 'Devoluciones - AB Tattoo Supplies',
    description: 'Política de devoluciones, derecho de desistimiento y proceso de devolución en AB Tattoo Supplies.',
}

export default function ReturnsPage() {
    return (
        <main className={styles.main}>
            <Header />
            <div className={styles.container}>
                <div className={styles.header}>
                    <Heading level={1}>Política de Devoluciones</Heading>
                    <Text color="muted">
                        Información completa sobre nuestras políticas de devolución, 
                        cambios y reembolsos.
                    </Text>
                </div>

                <div className={styles.sections}>
                    {/* Derecho de desistimiento */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Derecho de desistimiento</Heading>
                            <Text color="muted">
                                De conformidad con la legislación vigente en la Unión Europea, 
                                dispones de un plazo de <strong>14 días naturales</strong> desde la recepción 
                                del producto para ejercer tu derecho de desistimiento, sin necesidad 
                                de justificar tu decisión.
                            </Text>
                            <Text color="muted">
                                Para ejercer este derecho, deberás comunicárnoslo por escrito antes 
                                de que finalice el plazo, enviando un email a{' '}
                                <a href="mailto:info@abtattoo.com" className={styles.link}>info@abtattoo.com</a>{' '}
                                indicando tu número de pedido.
                            </Text>
                        </div>
                    </Card>

                    {/* Condiciones de devolución */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Condiciones de devolución</Heading>
                            <Text color="muted">
                                Para que una devolución sea aceptada, los productos deben cumplir 
                                las siguientes condiciones:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        El producto debe estar <strong>sin usar, sin abrir y en su embalaje original</strong>.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Debe incluir todos los accesorios, manuales y documentación original.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        El embalaje no debe presentar daños significativos que impidan su reventa.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Debe adjuntarse el comprobante de compra o número de pedido.
                                    </Text>
                                </li>
                            </ul>
                        </div>
                    </Card>

                    {/* Proceso paso a paso */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Proceso de devolución</Heading>
                            <Text color="muted">
                                Sigue estos pasos para realizar una devolución:
                            </Text>
                            <div className={styles.steps}>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>1</div>
                                    <div className={styles.stepContent}>
                                        <Text><strong>Contacta con nosotros</strong></Text>
                                        <Text size="small" color="muted">
                                            Envía un email a info@abtattoo.com con tu número de pedido, 
                                            el producto que deseas devolver y el motivo.
                                        </Text>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>2</div>
                                    <div className={styles.stepContent}>
                                        <Text><strong>Recibe la autorización</strong></Text>
                                        <Text size="small" color="muted">
                                            Te confirmaremos la devolución y te enviaremos las instrucciones 
                                            de envío junto con la dirección de devolución.
                                        </Text>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>3</div>
                                    <div className={styles.stepContent}>
                                        <Text><strong>Envía el producto</strong></Text>
                                        <Text size="small" color="muted">
                                            Embala el producto de forma segura y envíalo a la dirección indicada. 
                                            Los gastos de envío de devolución corren a cargo del cliente, 
                                            salvo que el producto sea defectuoso o el envío haya sido incorrecto.
                                        </Text>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepNumber}>4</div>
                                    <div className={styles.stepContent}>
                                        <Text><strong>Recibe tu reembolso</strong></Text>
                                        <Text size="small" color="muted">
                                            Una vez recibido y verificado el estado del producto, 
                                            procesaremos el reembolso en un plazo máximo de 14 días.
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Reembolsos */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Plazos de reembolso</Heading>
                            <Text color="muted">
                                El reembolso se realizará utilizando el <strong>mismo método de pago</strong> que 
                                empleaste en la compra original:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        <strong>Tarjeta de crédito/débito:</strong> El reembolso puede tardar 
                                        entre 5 y 10 días laborables en reflejarse en tu cuenta, dependiendo 
                                        de tu entidad bancaria.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Otros métodos:</strong> El plazo variará según el proveedor 
                                        de pago utilizado.
                                    </Text>
                                </li>
                            </ul>
                            <Text color="muted">
                                El importe del reembolso incluirá el precio del producto. Los gastos de envío 
                                originales solo se reembolsarán si la devolución se debe a un error nuestro 
                                o a un producto defectuoso.
                            </Text>
                        </div>
                    </Card>

                    {/* Excepciones */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Excepciones y exclusiones</Heading>
                            <Text color="muted">
                                Por motivos de higiene y seguridad, <strong>no se admiten devoluciones</strong> en 
                                los siguientes casos:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        Productos que hayan sido abiertos, usados o cuyo precinto de seguridad 
                                        haya sido roto (tintas, agujas, cartuchos, grips desechables).
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Productos personalizados o hechos a medida.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Productos cuyo estado no permita su reventa en condiciones óptimas.
                                    </Text>
                                </li>
                            </ul>
                            <div className={styles.highlight}>
                                <Text size="small" color="muted">
                                    <strong>⚠️ Importante:</strong> Al tratarse de suministros profesionales 
                                    para tatuaje, muchos de nuestros productos son artículos de un solo uso 
                                    o están sujetos a normativas sanitarias estrictas. Si tienes dudas 
                                    sobre si un producto es devolvible, consulta con nosotros antes de realizar 
                                    tu compra.
                                </Text>
                            </div>
                        </div>
                    </Card>

                    {/* Productos defectuosos */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>Productos defectuosos</Heading>
                            <Text color="muted">
                                Si recibes un producto defectuoso o que no se corresponde con lo que 
                                pediste, contacta con nosotros inmediatamente. En estos casos:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        Los gastos de envío de devolución corren por nuestra cuenta.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Podrás elegir entre un reembolso completo o el envío de un producto 
                                        de sustitución.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        Te pediremos fotografías del producto defectuoso para agilizar 
                                        el proceso.
                                    </Text>
                                </li>
                            </ul>
                        </div>
                    </Card>

                    {/* Contacto */}
                    <Card variant="outlined" padding="large">
                        <div className={styles.section}>
                            <Heading level={3}>¿Necesitas ayuda?</Heading>
                            <Text color="muted">
                                Si tienes alguna duda sobre nuestra política de devoluciones o necesitas 
                                iniciar un proceso de devolución, no dudes en contactarnos:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        📧 Email: <a href="mailto:info@abtattoo.com" className={styles.link}>info@abtattoo.com</a>
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        🕐 Horario: Lunes a Viernes, 9:00 - 18:00 (CET)
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
