import styles from './Button.module.css'

export default function Button({
    children,
    variant = 'primary',
    size = 'medium',
    type = 'button',
    onClick,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) {
    const classNames = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        className
    ].filter(Boolean).join(' ')

    return (
        <button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}
