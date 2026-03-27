import Header from '@/components/molecules/Header/Header'
import Footer from '@/components/molecules/Footer/Footer'
import { Heading, Text } from '@/components/atoms/Typography/Typography'
import styles from './page.module.css'

export const metadata = {
    title: 'Aviso Legal, Privacidad y Cookies - AB Tattoo Supplies',
    description: 'Aviso legal, política de privacidad (RGPD) y política de cookies de AB Tattoo Supplies.',
}

export default function LegalPage() {
    return (
        <main className={styles.main}>
            <Header />
            <div className={styles.pageLayout}>
                {/* Sidebar Navigation */}
                <nav className={styles.sidebar}>
                    <div className={styles.sidebarContent}>
                        <span className={styles.sidebarTitle}>Contenido</span>
                        <a href="#aviso-legal" className={styles.sidebarLink}>Aviso Legal</a>
                        <a href="#privacidad" className={styles.sidebarLink}>Política de Privacidad</a>
                        <a href="#cookies" className={styles.sidebarLink}>Política de Cookies</a>
                    </div>
                </nav>

                {/* Main Content */}
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Heading level={1}>Información Legal</Heading>
                        <Text color="muted">
                            Aviso legal, política de privacidad y política de cookies de AB Tattoo Supplies.
                        </Text>
                    </div>

                    {/* ===================== AVISO LEGAL ===================== */}
                    <section id="aviso-legal" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Heading level={2}>Aviso Legal</Heading>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Datos identificativos</Heading>
                            <Text color="muted">
                                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, 
                                de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), 
                                se informa al usuario de los datos del titular de esta web:
                            </Text>
                            <div className={styles.dataTable}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Denominación social</span>
                                    <span className={styles.dataValue}>[PLACEHOLDER: Nombre de la empresa]</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>CIF / NIF</span>
                                    <span className={styles.dataValue}>[PLACEHOLDER: CIF/NIF]</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Domicilio social</span>
                                    <span className={styles.dataValue}>[PLACEHOLDER: Dirección fiscal completa]</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Email</span>
                                    <span className={styles.dataValue}>info@abtattoo.com</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Actividad</span>
                                    <span className={styles.dataValue}>Venta de suministros profesionales para tatuaje</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Objeto</Heading>
                            <Text color="muted">
                                El presente sitio web tiene como finalidad la venta online de suministros 
                                profesionales para tatuaje, dirigido exclusivamente a tatuadores profesionales. 
                                El acceso y uso de este sitio web atribuye la condición de usuario e implica 
                                la aceptación plena de todas las condiciones incluidas en este Aviso Legal.
                            </Text>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Propiedad intelectual e industrial</Heading>
                            <Text color="muted">
                                Todos los contenidos del sitio web (textos, fotografías, gráficos, imágenes, 
                                tecnología, software, diseño gráfico, código fuente, etc.) son propiedad 
                                intelectual de AB Tattoo Supplies o de sus proveedores de contenido, 
                                quedando prohibida su reproducción, distribución, comunicación pública, 
                                transformación o cualquier otra actividad sin autorización expresa.
                            </Text>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Responsabilidad</Heading>
                            <Text color="muted">
                                AB Tattoo Supplies no se hace responsable de los daños y perjuicios de 
                                cualquier naturaleza que pudieran derivarse del uso inadecuado de los 
                                productos vendidos a través de este sitio web. Los productos ofrecidos 
                                son de uso exclusivamente profesional y deben ser utilizados por personas 
                                con la formación y habilitación adecuadas.
                            </Text>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Legislación aplicable y jurisdicción</Heading>
                            <Text color="muted">
                                Las presentes condiciones se rigen por la legislación española. Para 
                                cualquier controversia que pudiera derivarse del acceso o uso de este 
                                sitio web, las partes se someten a los Juzgados y Tribunales del domicilio 
                                del usuario, siempre que este sea consumidor. En caso contrario, se 
                                someterán a los Juzgados y Tribunales de [PLACEHOLDER: ciudad].
                            </Text>
                        </div>
                    </section>

                    <div className={styles.divider} />

                    {/* ===================== PRIVACIDAD ===================== */}
                    <section id="privacidad" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Heading level={2}>Política de Privacidad</Heading>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Responsable del tratamiento</Heading>
                            <div className={styles.dataTable}>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Responsable</span>
                                    <span className={styles.dataValue}>[PLACEHOLDER: Nombre del responsable]</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>CIF / NIF</span>
                                    <span className={styles.dataValue}>[PLACEHOLDER: CIF/NIF]</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Dirección</span>
                                    <span className={styles.dataValue}>[PLACEHOLDER: Dirección]</span>
                                </div>
                                <div className={styles.dataRow}>
                                    <span className={styles.dataLabel}>Email de contacto</span>
                                    <span className={styles.dataValue}>info@abtattoo.com</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Finalidad del tratamiento</Heading>
                            <Text color="muted">
                                Los datos personales que nos facilites se tratarán con las siguientes finalidades:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        <strong>Gestión de la relación comercial:</strong> tramitar pedidos, 
                                        envíos, facturación y atención al cliente.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Gestión de la cuenta de usuario:</strong> registro, 
                                        autenticación y mantenimiento de tu cuenta.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Atención a consultas:</strong> responder a las comunicaciones 
                                        recibidas a través del formulario de contacto.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Cumplimiento de obligaciones legales:</strong> cumplir con 
                                        las obligaciones fiscales, mercantiles y de consumo aplicables.
                                    </Text>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Base legal del tratamiento</Heading>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        <strong>Ejecución de un contrato:</strong> el tratamiento es necesario 
                                        para la tramitación de pedidos y la prestación de los servicios solicitados 
                                        (art. 6.1.b RGPD).
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Consentimiento:</strong> para el envío del formulario de contacto 
                                        (art. 6.1.a RGPD).
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Obligación legal:</strong> para el cumplimiento de obligaciones 
                                        fiscales y mercantiles (art. 6.1.c RGPD).
                                    </Text>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Destinatarios de los datos</Heading>
                            <Text color="muted">
                                Tus datos podrán ser comunicados a los siguientes destinatarios:
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        <strong>Stripe, Inc.</strong> — Procesamiento de pagos. Stripe actúa 
                                        como encargado del tratamiento y cumple con el RGPD.{' '}
                                        <a href="https://stripe.com/es/privacy" className={styles.link} target="_blank" rel="noopener noreferrer">
                                            Política de privacidad de Stripe
                                        </a>.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Google LLC</strong> — Autenticación mediante Google Sign-In 
                                        (solo si utilizas esta opción de inicio de sesión).{' '}
                                        <a href="https://policies.google.com/privacy" className={styles.link} target="_blank" rel="noopener noreferrer">
                                            Política de privacidad de Google
                                        </a>.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Proveedores de transporte</strong> — Para la gestión y entrega 
                                        de los envíos (nombre, dirección y teléfono de entrega).
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Administraciones públicas</strong> — Cuando sea requerido 
                                        por ley (Agencia Tributaria, etc.).
                                    </Text>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Plazo de conservación</Heading>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        <strong>Datos de clientes:</strong> mientras se mantenga la relación 
                                        comercial y, posteriormente, durante los plazos legales de conservación 
                                        (hasta 6 años por obligaciones fiscales y mercantiles).
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Formulario de contacto:</strong> durante el tiempo necesario 
                                        para atender la consulta, con un máximo de 12 meses.
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <strong>Cuenta de usuario:</strong> mientras la cuenta permanezca activa. 
                                        Puedes solicitar la eliminación en cualquier momento.
                                    </Text>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Derechos del interesado</Heading>
                            <Text color="muted">
                                De conformidad con el RGPD, tienes derecho a:
                            </Text>
                            <ul className={styles.list}>
                                <li><Text color="muted"><strong>Acceso:</strong> conocer qué datos personales tratamos sobre ti.</Text></li>
                                <li><Text color="muted"><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</Text></li>
                                <li><Text color="muted"><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</Text></li>
                                <li><Text color="muted"><strong>Oposición:</strong> oponerte al tratamiento de tus datos.</Text></li>
                                <li><Text color="muted"><strong>Limitación:</strong> solicitar la limitación del tratamiento en determinadas circunstancias.</Text></li>
                                <li><Text color="muted"><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.</Text></li>
                            </ul>
                            <Text color="muted">
                                Para ejercer cualquiera de estos derechos, envía un email a{' '}
                                <a href="mailto:info@abtattoo.com" className={styles.link}>info@abtattoo.com</a>{' '}
                                indicando tu nombre, email registrado y el derecho que deseas ejercer.
                            </Text>
                            <Text color="muted">
                                Asimismo, tienes derecho a presentar una reclamación ante la{' '}
                                <a href="https://www.aepd.es" className={styles.link} target="_blank" rel="noopener noreferrer">
                                    Agencia Española de Protección de Datos (AEPD)
                                </a>{' '}
                                si consideras que el tratamiento de tus datos no es adecuado.
                            </Text>
                        </div>
                    </section>

                    <div className={styles.divider} />

                    {/* ===================== COOKIES ===================== */}
                    <section id="cookies" className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Heading level={2}>Política de Cookies</Heading>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>¿Qué son las cookies?</Heading>
                            <Text color="muted">
                                Las cookies son pequeños archivos de texto que los sitios web almacenan 
                                en tu navegador cuando los visitas. Se utilizan para recordar tus 
                                preferencias, mejorar la experiencia de navegación y garantizar el 
                                funcionamiento correcto de determinadas funcionalidades.
                            </Text>
                            <Text color="muted">
                                Además de las cookies, este sitio web utiliza tecnologías de almacenamiento 
                                local del navegador (localStorage) para funcionalidades esenciales como 
                                la sesión de usuario y el carrito de compra.
                            </Text>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Cookies y tecnologías utilizadas</Heading>
                            <Text color="muted">
                                A continuación, se detallan todas las cookies y tecnologías de almacenamiento 
                                que utiliza este sitio web:
                            </Text>

                            {/* Cookies propias / localStorage */}
                            <div className={styles.cookieCategory}>
                                <Heading level={5}>Almacenamiento local (técnico / necesario)</Heading>
                                <Text size="small" color="muted">
                                    Estas tecnologías son estrictamente necesarias para el funcionamiento 
                                    de la web. No requieren consentimiento.
                                </Text>
                                <div className={styles.cookieTable}>
                                    <div className={styles.cookieTableHeader}>
                                        <span>Nombre</span>
                                        <span>Tipo</span>
                                        <span>Duración</span>
                                        <span>Finalidad</span>
                                    </div>
                                    <div className={styles.cookieTableRow}>
                                        <span className={styles.cookieName}>auth_token</span>
                                        <span>localStorage</span>
                                        <span>Persistente</span>
                                        <span>Mantener la sesión del usuario autenticado. Se elimina al cerrar sesión.</span>
                                    </div>
                                    <div className={styles.cookieTableRow}>
                                        <span className={styles.cookieName}>cart_id</span>
                                        <span>localStorage</span>
                                        <span>Persistente</span>
                                        <span>Persistir el carrito de compra entre visitas para no perder los productos añadidos.</span>
                                    </div>
                                    <div className={styles.cookieTableRow}>
                                        <span className={styles.cookieName}>cookie_consent</span>
                                        <span>localStorage</span>
                                        <span>Persistente</span>
                                        <span>Recordar la preferencia del usuario sobre el consentimiento de cookies.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cookies de Stripe */}
                            <div className={styles.cookieCategory}>
                                <Heading level={5}>Cookies de Stripe (pago / necesarias)</Heading>
                                <Text size="small" color="muted">
                                    Stripe es nuestro proveedor de pagos. Estas cookies son necesarias 
                                    para procesar pagos de forma segura y prevenir el fraude. Se cargan 
                                    durante el proceso de checkout.
                                </Text>
                                <div className={styles.cookieTable}>
                                    <div className={styles.cookieTableHeader}>
                                        <span>Nombre</span>
                                        <span>Proveedor</span>
                                        <span>Duración</span>
                                        <span>Finalidad</span>
                                    </div>
                                    <div className={styles.cookieTableRow}>
                                        <span className={styles.cookieName}>__stripe_mid</span>
                                        <span>Stripe</span>
                                        <span>1 año</span>
                                        <span>Identificador de dispositivo para prevención de fraude en pagos.</span>
                                    </div>
                                    <div className={styles.cookieTableRow}>
                                        <span className={styles.cookieName}>__stripe_sid</span>
                                        <span>Stripe</span>
                                        <span>Sesión</span>
                                        <span>Identificador de sesión de Stripe para el procesamiento seguro del pago.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cookies de Google */}
                            <div className={styles.cookieCategory}>
                                <Heading level={5}>Cookies de Google (autenticación / funcionales)</Heading>
                                <Text size="small" color="muted">
                                    Estas cookies se establecen cuando utilizas la opción de inicio de sesión 
                                    con Google. Solo se cargan si interactúas con el botón de Google Sign-In.
                                </Text>
                                <div className={styles.cookieTable}>
                                    <div className={styles.cookieTableHeader}>
                                        <span>Nombre</span>
                                        <span>Proveedor</span>
                                        <span>Duración</span>
                                        <span>Finalidad</span>
                                    </div>
                                    <div className={styles.cookieTableRow}>
                                        <span className={styles.cookieName}>g_csrf_token</span>
                                        <span>Google</span>
                                        <span>Sesión</span>
                                        <span>Token de protección contra ataques CSRF durante el inicio de sesión con Google.</span>
                                    </div>
                                    <div className={styles.cookieTableRow}>
                                        <span className={styles.cookieName}>g_state</span>
                                        <span>Google</span>
                                        <span>Persistente</span>
                                        <span>Almacena el estado de la sesión de Google Sign-In.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>¿Cómo gestionar las cookies?</Heading>
                            <Text color="muted">
                                Al acceder a nuestro sitio web por primera vez, se te mostrará un banner 
                                informativo donde podrás aceptar todas las cookies o aceptar solo las 
                                necesarias.
                            </Text>
                            <Text color="muted">
                                Además, puedes configurar tu navegador para bloquear o eliminar cookies 
                                en cualquier momento. Ten en cuenta que bloquear las cookies necesarias 
                                puede afectar al funcionamiento del sitio web, especialmente al proceso 
                                de pago y al inicio de sesión.
                            </Text>
                            <ul className={styles.list}>
                                <li>
                                    <Text color="muted">
                                        <a href="https://support.google.com/chrome/answer/95647" className={styles.link} target="_blank" rel="noopener noreferrer">
                                            Google Chrome
                                        </a>
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" className={styles.link} target="_blank" rel="noopener noreferrer">
                                            Mozilla Firefox
                                        </a>
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" className={styles.link} target="_blank" rel="noopener noreferrer">
                                            Safari
                                        </a>
                                    </Text>
                                </li>
                                <li>
                                    <Text color="muted">
                                        <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className={styles.link} target="_blank" rel="noopener noreferrer">
                                            Microsoft Edge
                                        </a>
                                    </Text>
                                </li>
                            </ul>
                        </div>

                        <div className={styles.block}>
                            <Heading level={4}>Actualización de esta política</Heading>
                            <Text color="muted">
                                Esta política de cookies puede ser actualizada periódicamente para 
                                reflejar cambios en las cookies utilizadas o por motivos legales. 
                                Te recomendamos revisarla regularmente.
                            </Text>
                            <Text size="small" color="muted">
                                Última actualización: Marzo 2026.
                            </Text>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    )
}
