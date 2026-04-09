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
        const requestedLimit = params.limit || 100
        const requestedOffset = params.offset || 0

        // NOTE: Medusa v2 Store API does NOT support type_id as a query
        // filter (it silently ignores it). When type filtering is needed we
        // must fetch ALL products from the server, filter client-side, and
        // then paginate the filtered set ourselves.
        const clientTypeFilter = params.type_id
            ? (Array.isArray(params.type_id) ? params.type_id : [params.type_id])
            : null

        const queryParams = {
            // When type filtering is active we need the full catalogue so
            // the client-side filter works correctly. Otherwise use the
            // caller's requested limit/offset for server-side pagination.
            limit: clientTypeFilter ? 1000 : requestedLimit,
            offset: clientTypeFilter ? 0 : requestedOffset,
            // ── Optimised field set for product listings ──────────────
            // ProductCard only needs: variant prices (for display), variant
            // thumbnail/metadata/images (for image carousel), and variant id
            // (for addToCart).  All scalar fields are included by *variants.
            // We intentionally OMIT:
            //   • *variants.options  – option selector is only on detail page
            //   • *options / *options.values – same reason
            // This avoids fetching N×M variant-option objects per product
            // (e.g. 50 variants × 2 options = 100 objects), which adds up
            // fast when listing 20+ products.
            // NOTE: *variants already includes inventory_quantity and all
            // other scalar columns, so *variants.inventory_quantity was
            // always redundant.
            fields: '*variants,*variants.prices,*variants.images,+type,+collection,+categories,+tags,+images',
        }

        // Universal search needs option data to match values like "Orange",
        // "Blue", size names, etc.  We add +options,+options.values only
        // when searching so normal listing performance is unaffected.
        if (params._universalSearch) {
            queryParams.fields += ',+options,+options.values'
        }

        // Full-text search
        if (params.q) {
            queryParams.q = params.q
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

        const { products, count, offset, limit } = await medusaClient.store.product.list(queryParams)

        // Client-side type filtering + manual pagination
        let filteredProducts = products || []
        let totalCount
        if (clientTypeFilter && clientTypeFilter.length > 0) {
            filteredProducts = filteredProducts.filter(
                product => product.type && clientTypeFilter.includes(product.type.id)
            )
            // Total count is the full filtered set
            totalCount = filteredProducts.length
            // Apply the originally requested pagination on the filtered set
            filteredProducts = filteredProducts.slice(
                requestedOffset,
                requestedOffset + requestedLimit
            )
        } else {
            totalCount = count ?? filteredProducts.length
        }
        
        return { 
            products: filteredProducts, 
            count: totalCount, 
            offset: clientTypeFilter ? requestedOffset : (offset || 0), 
            limit: clientTypeFilter ? requestedLimit : (limit || 0) 
        }
    } catch (error) {
        console.error('Error fetching products:', error)
        return { products: [], count: 0, offset: 0, limit: 0 }
    }
}

export async function getProduct(id) {
    // ── Strategy ─────────────────────────────────────────────────────
    // First try the custom lightweight endpoint which uses query.graph()
    // to fetch only the variant/option fields the storefront needs.
    // This avoids the OOM caused by *variants serialising every column
    // (sku, barcode, ean, hs_code, dimensions, …) on products with
    // many variants.
    // Falls back to the standard Store API if the lightweight endpoint
    // is unavailable (e.g. during local dev before backend redeploy).
    try {
        const res = await fetch(
            `${MEDUSA_BACKEND_URL}/store/products/${id}/lightweight`,
            {
                headers: {
                    'x-publishable-api-key': PUBLISHABLE_KEY,
                },
                next: { revalidate: 0 },
            }
        )
        if (res.ok) {
            const data = await res.json()
            if (data.product) return data.product
        }
        // If 404 or other non-OK → fall through to standard API
    } catch (_) {
        // Lightweight endpoint not available → fall through
    }

    // ── Fallback: standard Store API ──────────────────────────────────
    try {
        const { product } = await medusaClient.store.product.retrieve(id, {
            fields: '*variants,*variants.prices,*variants.options,*variants.inventory_quantity,*variants.images,*options,*options.values,+type,+collection,+categories,+tags,+images'
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
            fields: '+category_children,+description,+metadata'
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
            limit: 100,
            fields: '+metadata'
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
// RANKED ENDPOINTS (ordered by product count)
// ============================================

/**
 * Fetch collections (brands) ranked by number of published products.
 * Falls back to the standard getCollections() if the ranked endpoint
 * is not deployed yet.
 * @param {Object} [params] - Optional filters
 * @param {string} [params.type_id] - Filter by product type ID
 * @param {string} [params.category_id] - Filter by category ID
 * @returns {Promise<Array<{id: string, title: string, handle: string, product_count: number}>>}
 */
export async function getRankedCollections(params = {}) {
    try {
        const qs = new URLSearchParams()
        if (params.type_id) qs.set('type_id', params.type_id)
        if (params.category_id) qs.set('category_id', params.category_id)
        const queryStr = qs.toString()

        const res = await fetch(
            `${MEDUSA_BACKEND_URL}/store/collections/ranked${queryStr ? `?${queryStr}` : ''}`,
            {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
                next: { revalidate: 300 },
            }
        )
        if (res.ok) {
            const data = await res.json()
            return data.collections || []
        }
        // Endpoint not deployed yet — fall through to standard API
        console.warn('[medusa] Ranked collections endpoint unavailable, falling back to standard')
        return await getCollections()
    } catch (error) {
        console.error('Error fetching ranked collections:', error)
        return await getCollections()
    }
}

/**
 * Fetch categories ranked by number of published products.
 * Falls back to the standard getCategories() if the ranked endpoint
 * is not deployed yet.
 * @param {Object} [params] - Optional filters
 * @param {string} [params.type_id] - Filter by product type ID
 * @param {boolean} [params.parent_only] - Only root categories
 * @returns {Promise<Array<{id: string, name: string, handle: string, parent_category_id: string|null, product_count: number}>>}
 */
export async function getRankedCategories(params = {}) {
    try {
        const qs = new URLSearchParams()
        if (params.type_id) qs.set('type_id', params.type_id)
        if (params.parent_only) qs.set('parent_only', 'true')
        const queryStr = qs.toString()

        const res = await fetch(
            `${MEDUSA_BACKEND_URL}/store/categories/ranked${queryStr ? `?${queryStr}` : ''}`,
            {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
                next: { revalidate: 300 },
            }
        )
        if (res.ok) {
            const data = await res.json()
            return data.categories || []
        }
        console.warn('[medusa] Ranked categories endpoint unavailable, falling back to standard')
        return await getCategories()
    } catch (error) {
        console.error('Error fetching ranked categories:', error)
        return await getCategories()
    }
}

/**
 * Fetch product types ranked by number of published products.
 * Falls back to the standard getProductTypes() if the ranked endpoint
 * is not deployed yet.
 * @returns {Promise<Array<{id: string, value: string, product_count: number}>>}
 */
export async function getRankedProductTypes() {
    try {
        const res = await fetch(
            `${MEDUSA_BACKEND_URL}/store/product-types/ranked`,
            {
                headers: { 'x-publishable-api-key': PUBLISHABLE_KEY },
                next: { revalidate: 300 },
            }
        )
        if (res.ok) {
            const data = await res.json()
            return data.product_types || []
        }
        console.warn('[medusa] Ranked product types endpoint unavailable, falling back to standard')
        return await getProductTypes()
    } catch (error) {
        console.error('Error fetching ranked product types:', error)
        return await getProductTypes()
    }
}

// ============================================
// TIPOS DE PRODUCTO
// ============================================

/**
 * Fetches product types from the Medusa API.
 *
 * Medusa v2 has no direct Store API endpoint for product types, so this
 * workaround fetches products and deduplicates their type field.
 *
 * TODO: Replace with a custom endpoint when this workaround becomes a
 * bottleneck. See: backend/medusa/src/api/store/product-types/route.ts
 *
 * @returns {Promise<Array<{id: string, value: string}>>}
 */
export async function getProductTypes() {
    try {
        // Fetch enough products to cover all types (increased from 100)
        const { products } = await medusaClient.store.product.list({ 
            limit: 1000,
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

        const types = Array.from(typesMap.values())

        // Warn if expected types are missing (early detection of data issues)
        const expectedTypes = ['agujas', 'tintas', 'material']
        for (const expected of expectedTypes) {
            const found = types.some(
                t => t.value?.toLowerCase().trim() === expected
            )
            if (!found) {
                console.warn(
                    `[medusa] Expected product type "${expected}" not found. ` +
                    `This may mean no products have this type assigned, or there are ` +
                    `more products than the fetch limit.`
                )
            }
        }
        
        return types
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

export async function createCart(data = {}) {
    try {
        const { cart } = await medusaClient.store.cart.create(data)
        return cart
    } catch (error) {
        console.error('Error creating cart:', error)
        return null
    }
}

export async function getCart(cartId) {
    try {
        const { cart } = await medusaClient.store.cart.retrieve(cartId, {
            fields: '+payment_collection.payment_sessions',
        })
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
        await medusaClient.store.cart.deleteLineItem(cartId, lineItemId)
        // Refetch the cart — deleteLineItem may not return the full cart in Medusa v2
        const { cart } = await medusaClient.store.cart.retrieve(cartId)
        return cart
    } catch (error) {
        console.error('Error removing line item:', error)
        return null
    }
}

export async function updateCart(cartId, data) {
    try {
        const { cart } = await medusaClient.store.cart.update(cartId, data)
        return cart
    } catch (error) {
        console.error('Error updating cart:', error)
        return null
    }
}

export async function addShippingMethod(cartId, optionId, data = {}) {
    try {
        const { cart } = await medusaClient.store.cart.addShippingMethod(cartId, {
            option_id: optionId,
            ...data
        })
        return cart
    } catch (error) {
        console.error('Error adding shipping method:', error)
        return null
    }
}

export async function completeCart(cartId) {
    try {
        const result = await medusaClient.store.cart.complete(cartId)
        return result
    } catch (error) {
        console.error('Error completing cart:', error)
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
// REGIÓN POR DEFECTO
// ============================================

export async function getDefaultRegion() {
    try {
        const regions = await getRegions()
        // Preferir región EUR (España/Europa)
        const eurRegion = regions.find(r => r.currency_code === 'eur')
        return eurRegion || regions[0] || null
    } catch (error) {
        console.error('Error getting default region:', error)
        return null
    }
}

// ============================================
// ENVÍO
// ============================================

export async function getShippingOptions(cartId) {
    try {
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/shipping-options?cart_id=${cartId}`, {
            headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': PUBLISHABLE_KEY,
            },
        })
        if (!response.ok) return []
        const data = await response.json()
        return data.shipping_options || []
    } catch (error) {
        console.error('Error fetching shipping options:', error)
        return []
    }
}

// ============================================
// PAGO
// ============================================

/**
 * Creates a PaymentCollection for a cart.
 * In Medusa v2, this must be done explicitly before creating payment sessions.
 * POST /store/payment-collections  { cart_id }
 */
export async function createPaymentCollection(cartId) {
    try {
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/payment-collections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ cart_id: cartId }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to create payment collection:', errorText)
            return null
        }

        const data = await response.json()
        return data.payment_collection
    } catch (error) {
        console.error('Error creating payment collection:', error)
        return null
    }
}

/**
 * Initializes a Stripe payment session on the cart.
 * Ensures a PaymentCollection exists (creates one if needed),
 * then creates a PaymentSession inside it.
 *
 * If a valid session for the same provider already exists (with a
 * client_secret), it is returned directly instead of creating a duplicate.
 */
export async function initializePaymentSession(cartId, providerId = 'pp_stripe_stripe') {
    try {
        // 1. Check if cart already has a payment collection
        const cart = await getCart(cartId)
        let pcId = cart?.payment_collection?.id

        // 1b. Check for an existing session we can reuse
        const existingSessions = cart?.payment_collection?.payment_sessions || []
        const existingSession = existingSessions.find(
            s => s.provider_id === providerId && s.data?.client_secret
        )
        if (existingSession) {
            console.log('[Stripe] Reusing existing payment session with client_secret')
            return existingSession
        }

        // 2. If no payment collection, create one
        if (!pcId) {
            const paymentCollection = await createPaymentCollection(cartId)
            pcId = paymentCollection?.id
        }

        if (!pcId) {
            console.error('[Stripe] Could not create or find payment collection for cart')
            return null
        }

        // 3. Create a payment session in the collection
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/payment-collections/${pcId}/payment-sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ provider_id: providerId }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[Stripe] Failed to initialize payment session:', response.status, errorText)
            return null
        }

        const data = await response.json()

        // Handle all possible Medusa v2 response structures:
        // 1. { payment_collection: { payment_sessions: [...] } }  (wrapped)
        // 2. { payment_sessions: [...] }  (unwrapped collection)
        // 3. { payment_session: { ... } }  (single session)
        const pc = data.payment_collection || data
        const session = pc.payment_sessions?.[0] || data.payment_session || null

        console.log('[Stripe] Payment session initialized:', {
            hasPaymentCollection: !!data.payment_collection,
            hasPaymentSessions: !!pc.payment_sessions,
            sessionsCount: pc.payment_sessions?.length,
            hasPaymentSession: !!data.payment_session,
            clientSecret: session?.data?.client_secret ? 'found' : 'NOT FOUND',
            responseKeys: Object.keys(data),
        })

        return session
    } catch (error) {
        console.error('[Stripe] Error initializing payment session:', error)
        return null
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
    }).format(amount)
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
    
    // Collect ALL values for this option from product.options (if available)
    // or from all variants (fallback)
    const allValues = new Map()

    // Prefer product-level option.values (Medusa v2 returns these when
    // *options.values is requested in the fields param)
    if (option.values && option.values.length > 0) {
        option.values.forEach(val => {
            allValues.set(val.value, {
                id: val.id,
                value: val.value,
                available: false,  // will be updated below
                inStock: false,    // true if at least one compatible variant has stock
            })
        })
    } else {
        // Fallback: extract from all variants
        product.variants.forEach(variant => {
            const variantOption = variant.options?.find(opt => opt.option_id === option.id)
            if (variantOption && !allValues.has(variantOption.value)) {
                allValues.set(variantOption.value, {
                    id: variantOption.id,
                    value: variantOption.value,
                    available: false,
                    inStock: false,
                })
            }
        })
    }

    // Determine which values are available given the OTHER selected options
    const otherOptions = Object.entries(selectedOptions).filter(
        ([optionId]) => optionId !== option.id
    )
    
    const compatibleVariants = product.variants.filter(variant => {
        if (!variant.options) return false
        return otherOptions.every(([optionId, value]) =>
            variant.options.some(
                vo => vo.option_id === optionId && vo.value === value
            )
        )
    })
    
    compatibleVariants.forEach(variant => {
        const variantOption = variant.options?.find(opt => opt.option_id === option.id)
        if (variantOption && allValues.has(variantOption.value)) {
            const entry = allValues.get(variantOption.value)
            entry.available = true
            // A value is in stock if at least one compatible variant has stock
            const variantHasStock = !variant.manage_inventory ||
                (variant.inventory_quantity != null && variant.inventory_quantity > 0)
            if (variantHasStock) {
                entry.inStock = true
            }
        }
    })
    
    return Array.from(allValues.values())
}

/**
 * Given a product and a partial set of desired options, find the first variant
 * that matches as many of those options as possible.
 * Used when the user selects an "unavailable" option value to auto-adjust
 * the other options to a valid combination.
 *
 * @param {object} product - The product with variants/options
 * @param {object} desiredOptions - Map of optionId → value
 * @param {string|null} changedOptionId - The option the user just changed.
 *   This option is prioritised in the fallback search so that the auto-
 *   correction adjusts the OTHER options, not the one the user picked.
 */
export function findBestVariant(product, desiredOptions = {}, changedOptionId = null) {
    if (!product?.variants) return null

    // Try exact match first
    const exact = product.variants.find(variant =>
        variant.options && Object.entries(desiredOptions).every(([optId, val]) =>
            variant.options.some(vo => vo.option_id === optId && vo.value === val)
        )
    )
    if (exact) return exact

    // Fallback: find the first variant that contains the value the user
    // just chose (changedOptionId). This ensures the user's explicit
    // selection is honoured while the other options auto-correct.
    const priorityOptId = changedOptionId || (() => {
        const entries = Object.entries(desiredOptions)
        return entries.length ? entries[entries.length - 1][0] : null
    })()

    if (priorityOptId && desiredOptions[priorityOptId] !== undefined) {
        const priorityVal = desiredOptions[priorityOptId]
        const partial = product.variants.find(variant =>
            variant.options?.some(vo => vo.option_id === priorityOptId && vo.value === priorityVal)
        )
        if (partial) return partial
    }

    return product.variants[0] || null
}

// ============================================
// NAVIGATION TREE
// ============================================

/**
 * Builds the full navigation tree from Medusa data.
 * Returns an array of "type objects" equivalent to the old PRODUCT_TYPES,
 * but entirely driven by the database.
 *
 * Data sources:
 * - Parent categories (is_active, no parent) → navigation types
 * - Category children → subcategories per type
 * - Collections with metadata.types → brands per type
 * - Product types → typeId (UUID) per type
 *
 * @returns {Promise<Array>} Navigation tree
 */
export async function getNavigationTree() {
    const [categories, collections, productTypes] = await Promise.all([
        getCategories(),          // already fetches with include_descendants_tree
        getCollections(),         // now includes +metadata
        getProductTypes(),
    ])

    // 1. Find root categories (no parent) — these are the "types"
    const rootCategories = categories
        .filter(cat => !cat.parent_category_id && !cat.parent_category)
        .sort((a, b) => {
            const rankA = a.metadata?.rank ?? 999
            const rankB = b.metadata?.rank ?? 999
            return rankA - rankB
        })

    // 2. Build the tree
    return rootCategories.map(root => {
        // Match a product type by name (case-insensitive)
        const matchedType = productTypes.find(
            t => t.value?.toLowerCase().trim() === root.name.toLowerCase().trim()
        )

        // Get child categories (direct children only — may be groups or leaves)
        const children = (root.category_children || [])
            .filter(c => c.is_active !== false)
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
            .map(c => ({
                handle: c.handle,
                label: c.name,
                id: c.id,
            }))

        // Get brands for this type from collection metadata
        const typeBrands = collections
            .filter(col => {
                let colTypes = col.metadata?.types
                if (!colTypes) return false
                // metadata values are stored as JSON strings in Medusa
                if (typeof colTypes === 'string') {
                    try { colTypes = JSON.parse(colTypes) } catch { return false }
                }
                if (!Array.isArray(colTypes)) return false
                return colTypes.some(
                    t => t.toLowerCase().trim() === root.name.toLowerCase().trim()
                )
            })
            .map(col => ({
                handle: col.handle,
                label: col.title,
                id: col.id,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es'))

        // Build categoryGroups if metadata defines them (Material)
        let categoryGroups = null
        let rawGroups = root.metadata?.category_groups
        if (rawGroups) {
            // Parse if stored as JSON string
            if (typeof rawGroups === 'string') {
                try { rawGroups = JSON.parse(rawGroups) } catch { rawGroups = null }
            }
            if (Array.isArray(rawGroups)) {
                categoryGroups = rawGroups.map(group => ({
                    groupLabel: group.groupLabel,
                    categories: group.handles
                        .map(h => children.find(c => c.handle === h))
                        .filter(Boolean),
                }))
            }
        }

        return {
            slug: root.handle,
            name: root.name,
            typeId: matchedType?.id || null,
            icon: root.metadata?.icon || 'package',
            description: root.metadata?.description || '',
            categories: children,
            categoryGroups,
            brands: typeBrands,
        }
    })
}
