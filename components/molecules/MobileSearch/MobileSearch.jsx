'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { SEARCH_MIN_LENGTH } from '@/lib/config'
import styles from './MobileSearch.module.css'

/**
 * Mobile-only floating search button + fullscreen glass modal.
 * Import this component only on pages where search makes sense
 * (Home, Products listing, Brands).
 */
export default function MobileSearch() {
    const [open, setOpen] = useState(false)
    const inputRef = useRef(null)

    // Autofocus input when modal opens
    useEffect(() => {
        if (open && inputRef.current) {
            // Small delay to let the animation start
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open])

    // Lock body scroll while modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    // Close on Escape
    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    const handleSubmit = (e) => {
        e.preventDefault()
        const q = inputRef.current?.value?.trim()
        if (q && q.length >= SEARCH_MIN_LENGTH) {
            setOpen(false)
            window.location.href = `/products?q=${encodeURIComponent(q)}`
        }
    }

    return (
        <>
            {/* Floating search button — visible only on mobile */}
            <button
                className={styles.floatingBtn}
                onClick={() => setOpen(true)}
                aria-label="Buscar productos"
            >
                <Search size={18} strokeWidth={2.5} />
            </button>

            {/* Fullscreen glass modal */}
            {open && (
                <div className={styles.overlay} onClick={() => setOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar búsqueda"
                        >
                            <X size={22} />
                        </button>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputWrapper}>
                                <Search size={20} className={styles.inputIcon} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="¿Qué estás buscando?"
                                    className={styles.input}
                                    autoComplete="off"
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn}>
                                Buscar
                            </button>
                        </form>

                        <p className={styles.hint}>
                            Busca por nombre, marca o tipo de producto
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
