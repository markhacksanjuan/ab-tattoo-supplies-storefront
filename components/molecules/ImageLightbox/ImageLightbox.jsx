'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './ImageLightbox.module.css'

// ── Helpers ──────────────────────────────────────────

/** Distance between two touch points */
function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX
    const dy = t1.clientY - t2.clientY
    return Math.sqrt(dx * dx + dy * dy)
}

/** Midpoint between two touch points */
function getTouchCenter(t1, t2) {
    return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
    }
}

/** Clamp a value between min and max */
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
}

const MIN_SCALE = 1
const MAX_SCALE = 4

/**
 * Fullscreen lightbox with pinch-to-zoom, double-tap zoom, pan & swipe.
 * Uses createPortal to render at document.body level.
 */
export default function ImageLightbox({ images, currentIndex, onClose, onIndexChange }) {
    const totalImages = images.length

    // ── Zoom / pan state ────────────────────────────
    const [scale, setScale] = useState(1)
    const [translate, setTranslate] = useState({ x: 0, y: 0 })
    const isZoomed = scale > 1.05

    // Refs for gesture tracking
    const pinchStartDist = useRef(0)
    const pinchStartScale = useRef(1)
    const panStart = useRef({ x: 0, y: 0 })
    const translateStart = useRef({ x: 0, y: 0 })
    const isPanning = useRef(false)
    const lastTap = useRef(0)
    const swipeStartX = useRef(null)
    const swipeStartY = useRef(null)
    const contentRef = useRef(null)
    const imgRef = useRef(null)

    // Reset zoom whenever we change image
    useEffect(() => {
        setScale(1)
        setTranslate({ x: 0, y: 0 })
    }, [currentIndex])

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

    // ── Constrain translation so image doesn't leave viewport ──
    const constrainTranslate = useCallback((tx, ty, s) => {
        if (s <= 1) return { x: 0, y: 0 }
        const img = imgRef.current
        if (!img) return { x: tx, y: ty }
        const rect = img.getBoundingClientRect()
        const imgW = rect.width / s  // original rendered size
        const imgH = rect.height / s
        const maxX = (imgW * (s - 1)) / 2
        const maxY = (imgH * (s - 1)) / 2
        return {
            x: clamp(tx, -maxX, maxX),
            y: clamp(ty, -maxY, maxY),
        }
    }, [])

    // ── Touch handlers ──────────────────────────────
    const handleTouchStart = useCallback((e) => {
        // Double-tap detection
        const now = Date.now()
        if (e.touches.length === 1) {
            if (now - lastTap.current < 300) {
                // Double tap → toggle zoom
                e.preventDefault()
                if (isZoomed) {
                    setScale(1)
                    setTranslate({ x: 0, y: 0 })
                } else {
                    // Zoom into the tapped point
                    const touch = e.touches[0]
                    const img = imgRef.current
                    if (img) {
                        const rect = img.getBoundingClientRect()
                        const cx = rect.left + rect.width / 2
                        const cy = rect.top + rect.height / 2
                        const newScale = 2.5
                        const tx = (cx - touch.clientX) * (newScale - 1) / newScale
                        const ty = (cy - touch.clientY) * (newScale - 1) / newScale
                        setScale(newScale)
                        setTranslate(constrainTranslate(tx, ty, newScale))
                    } else {
                        setScale(2.5)
                    }
                }
                lastTap.current = 0
                return
            }
            lastTap.current = now
        }

        if (e.touches.length === 2) {
            // Pinch start
            e.preventDefault()
            pinchStartDist.current = getTouchDistance(e.touches[0], e.touches[1])
            pinchStartScale.current = scale
            isPanning.current = false
        } else if (e.touches.length === 1) {
            if (isZoomed) {
                // Pan start
                isPanning.current = true
                panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                translateStart.current = { ...translate }
            } else {
                // Swipe start (not zoomed)
                swipeStartX.current = e.touches[0].clientX
                swipeStartY.current = e.touches[0].clientY
            }
        }
    }, [isZoomed, scale, translate, constrainTranslate])

    const handleTouchMove = useCallback((e) => {
        if (e.touches.length === 2) {
            // Pinch move
            e.preventDefault()
            const dist = getTouchDistance(e.touches[0], e.touches[1])
            const newScale = clamp(
                pinchStartScale.current * (dist / pinchStartDist.current),
                MIN_SCALE,
                MAX_SCALE
            )
            setScale(newScale)

            // Also adjust translate to keep the pinch center stable
            if (newScale <= 1) {
                setTranslate({ x: 0, y: 0 })
            } else {
                setTranslate(prev => constrainTranslate(prev.x, prev.y, newScale))
            }
        } else if (e.touches.length === 1 && isPanning.current && isZoomed) {
            // Pan move
            e.preventDefault()
            const dx = e.touches[0].clientX - panStart.current.x
            const dy = e.touches[0].clientY - panStart.current.y
            const newTx = translateStart.current.x + dx
            const newTy = translateStart.current.y + dy
            setTranslate(constrainTranslate(newTx, newTy, scale))
        }
    }, [isZoomed, scale, constrainTranslate])

    const handleTouchEnd = useCallback((e) => {
        if (e.touches.length < 2) {
            // Pinch ended — snap to 1 if close
            if (scale < 1.1) {
                setScale(1)
                setTranslate({ x: 0, y: 0 })
            }
        }

        if (e.touches.length === 0) {
            isPanning.current = false

            // Swipe detection (only when not zoomed)
            if (!isZoomed && swipeStartX.current !== null) {
                const deltaX = e.changedTouches[0].clientX - swipeStartX.current
                const deltaY = e.changedTouches[0].clientY - swipeStartY.current
                if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX < 0) goToNext()
                    else goToPrev()
                }
            }
            swipeStartX.current = null
            swipeStartY.current = null
        }
    }, [scale, isZoomed, goToNext, goToPrev])

    // ── Overlay click to close (only when not zoomed) ──
    const handleOverlayClick = useCallback(() => {
        if (isZoomed) {
            // Tap while zoomed → reset zoom
            setScale(1)
            setTranslate({ x: 0, y: 0 })
        } else {
            onClose()
        }
    }, [isZoomed, onClose])

    const currentImage = images[currentIndex]

    const imageStyle = {
        transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
        transition: isPanning.current ? 'none' : 'transform 0.2s ease',
    }

    return createPortal(
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div
                ref={contentRef}
                className={`${styles.content} ${isZoomed ? styles.contentZoomed : ''}`}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <img
                    ref={imgRef}
                    src={currentImage?.url}
                    alt={currentImage?.label || ''}
                    className={styles.image}
                    style={imageStyle}
                    draggable={false}
                />
            </div>

            {/* Close button */}
            <button className={styles.closeBtn} onClick={(e) => { e.stopPropagation(); onClose() }} aria-label="Cerrar">
                <X size={24} />
            </button>

            {/* Navigation arrows — hidden while zoomed */}
            {totalImages > 1 && !isZoomed && (
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
