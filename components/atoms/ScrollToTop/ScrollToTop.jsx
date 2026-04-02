'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronUp } from 'lucide-react'
import { SCROLL_TOP_THRESHOLD, SCROLL_TOP_DEBOUNCE_MS } from '@/lib/config'
import styles from './ScrollToTop.module.css'

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false)
    const lastScrollY = useRef(0)
    const debounceTimer = useRef(null)

    const handleScroll = useCallback(() => {
        const currentY = window.scrollY
        const scrollingUp = currentY < lastScrollY.current
        const farEnough = currentY > SCROLL_TOP_THRESHOLD

        if (scrollingUp && farEnough) {
            // Debounce — avoid flicker on micro-gestures
            if (!visible) {
                clearTimeout(debounceTimer.current)
                debounceTimer.current = setTimeout(() => setVisible(true), SCROLL_TOP_DEBOUNCE_MS)
            }
        } else {
            clearTimeout(debounceTimer.current)
            if (visible) setVisible(false)
        }

        lastScrollY.current = currentY
    }, [visible])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(debounceTimer.current)
        }
    }, [handleScroll])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setVisible(false)
    }

    return (
        <button
            className={`${styles.button} ${visible ? styles.visible : ''}`}
            onClick={scrollToTop}
            aria-label="Volver arriba"
        >
            <ChevronUp size={22} strokeWidth={2.5} />
        </button>
    )
}
