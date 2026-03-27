import styles from './Input.module.css'

export default function Input({
    type = 'text',
    label,
    name,
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className={`${styles.inputWrapper} ${className}`}>
            {label && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`${styles.input} ${error ? styles.error : ''}`}
                {...props}
            />
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    )
}
