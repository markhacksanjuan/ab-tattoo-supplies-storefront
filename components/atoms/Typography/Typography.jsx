import styles from './Typography.module.css'

export function Heading({
    level = 1,
    children,
    className = '',
    gold = false,
    ...props
}) {
    const Tag = `h${level}`
    const classNames = [
        styles.heading,
        styles[`h${level}`],
        gold ? styles.gold : '',
        className
    ].filter(Boolean).join(' ')

    return (
        <Tag className={classNames} {...props}>
            {children}
        </Tag>
    )
}

export function Text({
    variant = 'body',
    children,
    className = '',
    muted = false,
    ...props
}) {
    const classNames = [
        styles.text,
        styles[variant],
        muted ? styles.muted : '',
        className
    ].filter(Boolean).join(' ')

    return (
        <p className={classNames} {...props}>
            {children}
        </p>
    )
}
