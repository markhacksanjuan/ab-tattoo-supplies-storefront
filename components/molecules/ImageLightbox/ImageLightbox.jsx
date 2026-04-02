'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ImageLightbox.module.css'

/**
 * Fullscreen lightbox overlay for product image gallery.
 * Uses createPortal to render at document.body level, avoiding
 * stacking-context issues with sticky/fixed parent elements.
 *
 * @param {{ images: { url: string, label: string }[], currentIndex: number, onClose: () => void, onIndexChange: (i: number) => void }} props
 */
export default function ImageLightbox({ images, currentIndex, onClose, onIndexChange }) {
    const totalImages = images.length

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') goToPrev()
            if (e.key === 'ArrowRight') goToNext()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    })

    // Lock body scroll while open
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [])

    const goToPrev = useCallback(() => {
        onIndexChange(((currentIndex - 1) + totalImages) % totalImages)
    }, [currentIndex, totalImages, onIndexChange])

    const goToNext = useCallback(() => {
        onIndexChange((currentIndex + 1) % totalImages)
    }, [currentIndex, totalImages, onIndexChange])

    // Touch swipe support
    const touchStartX = useRef(null)
    const touchStartY = useRef(null)

    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX
        touchStartY.current = e.touches[0].clientY
    }, [])

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null) return
        const deltaX = e.changedTouches[0].clientX - touchStartX.current
        const deltaY = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) goToNext()
            else goToPrev()
        }
        touchStartX.current = null
        touchStartY.current = null
    }, [goToNext, goToPrev])

    const currentImage = images[currentIndex]

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.content}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    src={currentImage?.url}
                    alt={currentImage?.label || ''}
                    className={styles.image}
                    draggable={false}
                />
            </div>

            {/* Close button */}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                <X size={24} />
            </button>

            {/* Navigation arrows */}
            {totalImages > 1 && (
                <>
                    <button
                        className={`${styles.navBtn} ${styles.navBtnLeft}`}
                        onClick={(e) => { e.stopPropagation(); goToPrev() }}
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        className={`${styles.navBtn} ${styles.navBtnRight}`}
                        onClick={(e) => { e.stopPropagation(); goToNext() }}
                        aria-label="Imagen siguiente"
                    >
                        <ChevronRight size={28} />
                    </button>

                    {/* Image counter */}
                    <div className={styles.counter}>
                        {currentIndex + 1} / {totalImages}
                    </div>
                </>
            )}
        </div>,
        document.body
    )
}
