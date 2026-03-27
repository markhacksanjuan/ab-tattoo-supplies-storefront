import styles from './Badge.module.css'

export default function Badge({
    children,
    variant = 'default',
    size = 'medium',
    className = '',
    ...props
}) {
    const classNames = [
        styles.badge,
        styles[variant],
        styles[size],
        className
    ].filter(Boolean).join(' ')

    return (
        <span className={classNames} {...props}>
            {children}
        </span>
    )
}
