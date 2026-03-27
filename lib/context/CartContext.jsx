'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
    createCart as createCartApi,
    getCart as getCartApi,
    addLineItem,
    updateLineItem,
    removeLineItem,
    updateCart as updateCartApi,
    getDefaultRegion,
} from '@/lib/api/medusa'
import { useAuth } from '@/lib/context/AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    // Initialize cart on mount
    useEffect(() => {
        initializeCart()
    }, [])

    // Associate cart with customer when user logs in (has medusa_customer_id)
    useEffect(() => {
        if (cart?.id && user?.medusa_customer_id && !cart.customer_id) {
            updateCartApi(cart.id, { customer_id: user.medusa_customer_id })
                .then(updatedCart => {
                    if (updatedCart) setCart(updatedCart)
                })
        }
    }, [user?.medusa_customer_id, cart?.id])

    const initializeCart = async () => {
        setLoading(true)
        try {
            const savedCartId = localStorage.getItem('cart_id')

            if (savedCartId) {
                const existingCart = await getCartApi(savedCartId)
                // Only reuse cart if it hasn't been completed
                if (existingCart && existingCart.completed_at === null) {
                    setCart(existingCart)
                    setLoading(false)
                    return
                }
            }

            // Create new cart with default region (EUR/España)
            await createNewCart()
        } catch (error) {
            console.error('Error initializing cart:', error)
        } finally {
            setLoading(false)
        }
    }

    const createNewCart = async () => {
        const region = await getDefaultRegion()
        if (!region) {
            console.error('No regions found in Medusa. Create a region in the Medusa admin panel (Settings → Regions).')
            return null
        }
        const newCart = await createCartApi({
            region_id: region.id,
        })
        if (newCart) {
            localStorage.setItem('cart_id', newCart.id)
            setCart(newCart)
        }
        return newCart
    }

    const addToCart = useCallback(async (product, variant = null, quantity = 1) => {
        const selectedVariant = variant || product.variants?.[0]
        if (!selectedVariant) {
            console.error('No variant available for product:', product.id)
            return
        }

        let currentCart = cart
        if (!currentCart?.id) {
            currentCart = await createNewCart()
            if (!currentCart) {
                console.error('Failed to create cart')
                return
            }
        }

        const updatedCart = await addLineItem(currentCart.id, selectedVariant.id, quantity)
        if (updatedCart) {
            setCart(updatedCart)
        }
    }, [cart])

    const removeFromCart = useCallback(async (lineItemId) => {
        if (!cart?.id) return
        const updatedCart = await removeLineItem(cart.id, lineItemId)
        if (updatedCart) {
            setCart(updatedCart)
        }
    }, [cart?.id])

    const updateQuantity = useCallback(async (lineItemId, quantity) => {
        if (!cart?.id) return
        if (quantity <= 0) {
            return removeFromCart(lineItemId)
        }
        const updatedCart = await updateLineItem(cart.id, lineItemId, quantity)
        if (updatedCart) {
            setCart(updatedCart)
        }
    }, [cart?.id, removeFromCart])

    const clearCart = useCallback(async () => {
        await createNewCart()
    }, [])

    const refreshCart = useCallback(async () => {
        if (!cart?.id) return
        const updated = await getCartApi(cart.id)
        if (updated) setCart(updated)
    }, [cart?.id])

    const items = cart?.items || []
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const cartTotal = cart?.item_total || items.reduce((sum, item) => sum + (item.unit_price || 0) * item.quantity, 0)

    return (
        <CartContext.Provider value={{
            cart,
            items,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            refreshCart,
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
