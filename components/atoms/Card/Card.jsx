import styles from './Card.module.css'

export default function Card({
    children,
    variant = 'default',
    padding = 'medium',
    hoverable = false,
    className = '',
    onClick,
    ...props
}) {
    const classNames = [
        styles.card,
        styles[variant],
        styles[`padding-${padding}`],
        hoverable ? styles.hoverable : '',
        className
    ].filter(Boolean).join(' ')

    return (
        <div
            className={classNames}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    )
}
