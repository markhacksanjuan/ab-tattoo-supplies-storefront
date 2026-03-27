'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import styles from './GoogleButton.module.css'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

export default function GoogleButton({ onSuccess, onError, text = 'signin_with' }) {
    const buttonRef = useRef(null)
    const { loginWithGoogle } = useAuth()

    useEffect(() => {
        // Wait for Google script to load
        const initializeGoogle = () => {
            if (window.google && buttonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                })

                window.google.accounts.id.renderButton(
                    buttonRef.current,
                    {
                        type: 'standard',
                        theme: 'filled_black',
                        size: 'large',
                        text: text,
                        shape: 'rectangular',
                        width: '100%',
                    }
                )
            }
        }

        // Check if already loaded
        if (window.google) {
            initializeGoogle()
        } else {
            // Wait for script to load
            const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle)
                    initializeGoogle()
                }
            }, 100)

            // Cleanup after 10 seconds
            setTimeout(() => clearInterval(checkGoogle), 10000)
        }
    }, [])

    const handleCredentialResponse = async (response) => {
        try {
            const user = await loginWithGoogle(response.credential)
            if (onSuccess) {
                onSuccess(user)
            }
        } catch (error) {
            if (onError) {
                onError(error.message)
            }
        }
    }

    // Fallback button if Google script doesn't load
    if (!GOOGLE_CLIENT_ID) {
        return (
            <div className={styles.fallback}>
                <p className={styles.fallbackText}>
                    Registro con Google no disponible
                </p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div ref={buttonRef} className={styles.googleButton} />
        </div>
    )
}
