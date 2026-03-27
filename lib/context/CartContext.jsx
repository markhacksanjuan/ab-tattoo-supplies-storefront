'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { getVariantPrice } from '@/lib/api/medusa'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Load cart from localStorage
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart', e)
            }
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // Save cart to localStorage
        if (!loading) {
            localStorage.setItem('cart', JSON.stringify(items))
        }
    }, [items, loading])

    const addToCart = (product, variant = null, quantity = 1) => {
        // Si no se especifica variante, usar la primera disponible
        const selectedVariant = variant || product.variants?.[0]
        
        if (!selectedVariant) {
            console.error('No variant available for product:', product.id)
            return
        }

        setItems(prev => {
            // Buscar por variant_id para Medusa v2
            const existingIndex = prev.findIndex(item => item.variant_id === selectedVariant.id)
            
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity
                }
                return updated
            }
            
            // Obtener precio de la variante
            const price = getVariantPrice(selectedVariant)
            
            return [...prev, {
                id: product.id,
                variant_id: selectedVariant.id,
                title: product.title,
                thumbnail: product.thumbnail,
                variant_title: selectedVariant.title,
                variant: selectedVariant,
                price: price,
                quantity
            }]
        })
    }

    const removeFromCart = (variantId) => {
        setItems(prev => prev.filter(item => item.variant_id !== variantId))
    }

    const updateQuantity = (variantId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(variantId)
            return
        }
        setItems(prev => prev.map(item =>
            item.variant_id === variantId ? { ...item, quantity } : item
        ))
    }

    const clearCart = () => {
        setItems([])
    }

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const cartTotal = items.reduce((sum, item) => {
        const price = item.price?.amount || 0
        return sum + (price * item.quantity)
    }, 0)

    return (
        <CartContext.Provider value={{
            items,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
