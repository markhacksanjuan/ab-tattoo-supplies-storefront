'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
    createCart as createCartApi,
    getCart as getCartApi,
    addLineItem,
    updateLineItem,
    removeLineItem,
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

        // Optimistic update: reflect change in UI immediately
        setCart(prev => {
            if (!prev) return prev
            const newItems = [...(prev.items || [])]
            const existingIdx = newItems.findIndex(item => item.variant_id === selectedVariant.id)

            if (existingIdx >= 0) {
                newItems[existingIdx] = {
                    ...newItems[existingIdx],
                    quantity: newItems[existingIdx].quantity + quantity,
                }
            } else {
                const variantPrice = selectedVariant.prices?.[0]?.amount ||
                    selectedVariant.calculated_price?.calculated_amount || 0
                newItems.push({
                    id: `_optimistic_${Date.now()}`,
                    variant_id: selectedVariant.id,
                    title: product.title,
                    subtitle: selectedVariant.title,
                    variant_title: selectedVariant.title,
                    thumbnail: product.thumbnail,
                    unit_price: variantPrice,
                    quantity,
                })
            }
            const newItemTotal = newItems.reduce((sum, i) => sum + (i.unit_price || 0) * i.quantity, 0)
            return { ...prev, items: newItems, item_total: newItemTotal }
        })

        // Sync with server in background
        const updatedCart = await addLineItem(currentCart.id, selectedVariant.id, quantity)
        if (updatedCart) {
            setCart(updatedCart)
        }
    }, [cart])

    const removeFromCart = useCallback(async (lineItemId) => {
        if (!cart?.id) return

        // Optimistic update
        setCart(prev => {
            if (!prev) return prev
            const newItems = prev.items.filter(item => item.id !== lineItemId)
            const newItemTotal = newItems.reduce((sum, i) => sum + (i.unit_price || 0) * i.quantity, 0)
            return { ...prev, items: newItems, item_total: newItemTotal }
        })

        // Sync with server
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

        // Optimistic update
        setCart(prev => {
            if (!prev) return prev
            const newItems = prev.items.map(item =>
                item.id === lineItemId ? { ...item, quantity } : item
            )
            const newItemTotal = newItems.reduce((sum, i) => sum + (i.unit_price || 0) * i.quantity, 0)
            return { ...prev, items: newItems, item_total: newItemTotal }
        })

        // Sync with server in background
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
