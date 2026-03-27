import Medusa from '@medusajs/js-sdk'

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

// Crear cliente de Medusa v2
export const medusaClient = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    publishableKey: PUBLISHABLE_KEY,
})

// ============================================
// PRODUCTOS
// ============================================

export async function getProducts(params = {}) {
    try {
        const queryParams = {
            limit: params.limit || 100,
            offset: params.offset || 0,
            fields: '*variants,*variants.prices,*variants.options,*variants.inventory_quantity,*options,*options.values,+type,+collection,+categories,+tags,+images',
        }

        // Filtros de Medusa v2
        if (params.collection_id) {
            queryParams.collection_id = Array.isArray(params.collection_id) 
                ? params.collection_id 
                : [params.collection_id]
        }

        if (params.category_id) {
            queryParams.category_id = Array.isArray(params.category_id) 
                ? params.category_id 
                : [params.category_id]
        }

        if (params.type_id) {
            queryParams.type_id = Array.isArray(params.type_id) 
                ? params.type_id 
                : [params.type_id]
        }

        const { products, count, offset, limit } = await medusaClient.store.product.list(queryParams)
        
        return { 
            products: products || [], 
            count: count || 0, 
            offset: offset || 0, 
            limit: limit || 0 
        }
    } catch (error) {
        console.error('Error fetching products:', error)
        return { products: [], count: 0, offset: 0, limit: 0 }
    }
}

export async function getProduct(id) {
    try {
        const { product } = await medusaClient.store.product.retrieve(id, {
            fields: '*variants,*variants.prices,*variants.options,*variants.inventory_quantity,*options,*options.values,+type,+collection,+categories,+tags,+images'
        })
        return product
    } catch (error) {
        console.error('Error fetching product:', error)
        return null
    }
}

// ============================================
// CATEGORÍAS
// ============================================

export async function getCategories() {
    try {
        const { product_categories } = await medusaClient.store.category.list({
            include_descendants_tree: true,
            fields: '+category_children'
        })
        return product_categories || []
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}

export async function getCategory(handle) {
    try {
        const { product_categories } = await medusaClient.store.category.list({
            handle: handle,
            fields: '+category_children'
        })
        return product_categories?.[0] || null
    } catch (error) {
        console.error('Error fetching category:', error)
        return null
    }
}

export async function getCategoryById(id) {
    try {
        const { product_category } = await medusaClient.store.category.retrieve(id, {
            fields: '+category_children'
        })
        return product_category
    } catch (error) {
        console.error('Error fetching category by id:', error)
        return null
    }
}

// ============================================
// COLECCIONES
// ============================================

export async function getCollections() {
    try {
        const { collections } = await medusaClient.store.collection.list({
            limit: 100
        })
        return collections || []
    } catch (error) {
        console.error('Error fetching collections:', error)
        return []
    }
}

export async function getCollection(handle) {
    try {
        const { collections } = await medusaClient.store.collection.list({
            handle: handle
        })
        return collections?.[0] || null
    } catch (error) {
        console.error('Error fetching collection:', error)
        return null
    }
}

export async function getCollectionById(id) {
    try {
        const { collection } = await medusaClient.store.collection.retrieve(id)
        return collection
    } catch (error) {
        console.error('Error fetching collection by id:', error)
        return null
    }
}

// ============================================
// TIPOS DE PRODUCTO
// ============================================

export async function getProductTypes() {
    try {
        // En Medusa v2, los tipos se obtienen de los productos
        // ya que no hay un endpoint directo de tipos para el store
        const { products } = await medusaClient.store.product.list({ 
            limit: 100,
            fields: '+type'
        })
        
        const typesMap = new Map()
        
        products?.forEach(product => {
            if (product.type) {
                typesMap.set(product.type.id, {
                    id: product.type.id,
                    value: product.type.value
                })
            }
        })
        
        return Array.from(typesMap.values())
    } catch (error) {
        console.error('Error fetching product types:', error)
        return []
    }
}

// ============================================
// PRODUCTOS POR FILTRO
// ============================================

export async function getProductsByCollection(collectionId, params = {}) {
    try {
        return await getProducts({
            ...params,
            collection_id: [collectionId]
        })
    } catch (error) {
        console.error('Error fetching products by collection:', error)
        return { products: [], count: 0, offset: 0, limit: 0 }
    }
}

export async function getProductsByCategory(categoryId, params = {}) {
    try {
        return await getProducts({
            ...params,
            category_id: [categoryId]
        })
    } catch (error) {
        console.error('Error fetching products by category:', error)
        return { products: [], count: 0, offset: 0, limit: 0 }
    }
}

export async function getProductsByType(typeId, params = {}) {
    try {
        return await getProducts({
            ...params,
            type_id: [typeId]
        })
    } catch (error) {
        console.error('Error fetching products by type:', error)
        return { products: [], count: 0, offset: 0, limit: 0 }
    }
}

// ============================================
// CARRITO
// ============================================

export async function createCart() {
    try {
        const { cart } = await medusaClient.store.cart.create({})
        return cart
    } catch (error) {
        console.error('Error creating cart:', error)
        return null
    }
}

export async function getCart(cartId) {
    try {
        const { cart } = await medusaClient.store.cart.retrieve(cartId)
        return cart
    } catch (error) {
        console.error('Error retrieving cart:', error)
        return null
    }
}

export async function addLineItem(cartId, variantId, quantity) {
    try {
        const { cart } = await medusaClient.store.cart.createLineItem(cartId, {
            variant_id: variantId,
            quantity
        })
        return cart
    } catch (error) {
        console.error('Error adding line item:', error)
        return null
    }
}

export async function updateLineItem(cartId, lineItemId, quantity) {
    try {
        const { cart } = await medusaClient.store.cart.updateLineItem(cartId, lineItemId, {
            quantity
        })
        return cart
    } catch (error) {
        console.error('Error updating line item:', error)
        return null
    }
}

export async function removeLineItem(cartId, lineItemId) {
    try {
        const { cart } = await medusaClient.store.cart.deleteLineItem(cartId, lineItemId)
        return cart
    } catch (error) {
        console.error('Error removing line item:', error)
        return null
    }
}

// ============================================
// REGIONES
// ============================================

export async function getRegions() {
    try {
        const { regions } = await medusaClient.store.region.list()
        return regions || []
    } catch (error) {
        console.error('Error fetching regions:', error)
        return []
    }
}

// ============================================
// HELPERS PARA VARIANTES Y PRECIOS
// ============================================

/**
 * Obtiene el precio más bajo de un producto
 * En Medusa v2, los precios están en variant.prices
 */
export function getProductPrice(product) {
    if (!product?.variants?.length) return null
    
    let lowestPrice = null
    
    for (const variant of product.variants) {
        if (variant.prices?.length) {
            for (const price of variant.prices) {
                if (!lowestPrice || price.amount < lowestPrice.amount) {
                    lowestPrice = price
                }
            }
        }
    }
    
    return lowestPrice
}

/**
 * Obtiene el precio de una variante específica
 */
export function getVariantPrice(variant, currencyCode = 'eur') {
    if (!variant?.prices?.length) return null
    
    // Buscar precio en la moneda especificada
    const price = variant.prices.find(p => 
        p.currency_code?.toLowerCase() === currencyCode.toLowerCase()
    )
    
    return price || variant.prices[0] || null
}

/**
 * Formatea un precio para mostrar
 */
export function formatPrice(amount, currencyCode = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount / 100)
}

/**
 * Encuentra la variante que coincide con las opciones seleccionadas
 */
export function findVariantByOptions(product, selectedOptions) {
    if (!product?.variants || !selectedOptions) return null
    
    return product.variants.find(variant => {
        if (!variant.options) return false
        
        return Object.entries(selectedOptions).every(([optionId, value]) => {
            return variant.options.some(
                variantOption => variantOption.option_id === optionId && variantOption.value === value
            )
        })
    })
}

/**
 * Obtiene los valores disponibles para una opción
 * considerando las otras opciones seleccionadas
 */
export function getAvailableOptionValues(product, option, selectedOptions = {}) {
    if (!product?.variants) return []
    
    // Filtrar por otras opciones seleccionadas
    const otherOptions = Object.entries(selectedOptions).filter(
        ([optionId]) => optionId !== option.id
    )
    
    const compatibleVariants = product.variants.filter(variant => {
        if (!variant.options) return false
        
        return otherOptions.every(([optionId, value]) => {
            return variant.options.some(
                variantOption => variantOption.option_id === optionId && variantOption.value === value
            )
        })
    })
    
    const availableValues = new Map()
    
    compatibleVariants.forEach(variant => {
        const variantOption = variant.options?.find(opt => opt.option_id === option.id)
        if (variantOption && !availableValues.has(variantOption.value)) {
            availableValues.set(variantOption.value, {
                id: variantOption.id,
                value: variantOption.value
            })
        }
    })
    
    return Array.from(availableValues.values())
}
