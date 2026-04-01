/**
 * Navigation hierarchy: Types → Categories → Collections (Brands)
 *
 * This is the SINGLE SOURCE OF TRUTH for the storefront navigation structure.
 * It mirrors the hierarchy defined in stock/PRODUCT_HIERARCHY.md.
 *
 * All slugs are lowercase. All comparisons must go through resolveTypeSlug()
 * to prevent case-sensitivity bugs. NO component should do its own .toLowerCase()
 * comparison on types — always use the helpers exported here.
 *
 * The `typeId` field starts as null and gets populated at runtime by
 * enrichWithApiData() which matches type.value (case-insensitive) against
 * Medusa's product types to obtain the real UUIDs.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export const PRODUCT_TYPES = [
    {
        slug: 'agujas',
        value: 'Agujas',         // Exact Medusa type.value (display name)
        typeId: null,            // Populated at runtime from Medusa API
        icon: 'syringe',
        description: 'Agujas de tatuaje profesionales de las mejores marcas',
        categories: [
            { handle: 'round-liner', label: 'Round Liner' },
            { handle: 'round-shader', label: 'Round Shader' },
            { handle: 'magnum', label: 'Magnum' },
            { handle: 'curved-magnum', label: 'Curved Magnum' },
            { handle: 'long-taper', label: 'Long Taper' },
            { handle: 'otras-agujas', label: 'Otras Agujas' },
        ],
        brands: [
            { handle: 'ultra-premium', label: 'Ultra Premium' },
            { handle: 'ultimate', label: 'Ultimate' },
            { handle: 'dragonhawk', label: 'Dragonhawk' },
            { handle: 'critical-plus', label: 'Critical+' },
            { handle: 'kwadron', label: 'Kwadron' },
            { handle: 'revo', label: 'Revo' },
            { handle: 'elite', label: 'Elite' },
        ],
    },
    {
        slug: 'tintas',
        value: 'Tintas',
        typeId: null,
        icon: 'droplets',
        description: 'Tintas de tatuaje de alta calidad con pigmentos premium',
        categories: [
            { handle: 'tintas-color', label: 'Tintas Color' },
            { handle: 'negro-y-grises', label: 'Negro y Grises' },
            { handle: 'blancos', label: 'Blancos' },
            { handle: 'sets-de-tintas', label: 'Sets de Tintas' },
        ],
        brands: [
            { handle: 'dermaglo', label: 'Dermaglo' },
            { handle: 'star-brite-colors', label: 'Star Brite Colors' },
            { handle: 'radiant', label: 'Radiant' },
            { handle: 'solid-ink', label: 'Solid Ink' },
            { handle: 'dynamic', label: 'Dynamic' },
            { handle: 'easy-glow', label: 'Easy Glow' },
            { handle: 'vice-vicious', label: 'Vice Vicious' },
            { handle: 'eternal', label: 'Eternal' },
            { handle: 'horitomo', label: 'Horitomo' },
            { handle: 'chris-garver', label: 'Chris Garver' },
            { handle: 'victor-chill', label: 'Victor Chill' },
        ],
    },
    {
        slug: 'material',
        value: 'Material',
        typeId: null,
        icon: 'package',
        description: 'Material y accesorios esenciales para tu estudio',
        // Visual groups for dropdown/menu display (categories are still flat in Medusa)
        categoryGroups: [
            {
                groupLabel: 'Preparación',
                categories: [
                    { handle: 'diluyentes', label: 'Diluyentes' },
                    { handle: 'desinfectantes', label: 'Desinfectantes' },
                    { handle: 'jabones', label: 'Jabones' },
                    { handle: 'vaselinas', label: 'Vaselinas' },
                    { handle: 'cremas', label: 'Cremas' },
                ],
            },
            {
                groupLabel: 'Stencil y Diseño',
                categories: [
                    { handle: 'stencil', label: 'Stencil' },
                    { handle: 'quita-stencil', label: 'Quita Stencil' },
                    { handle: 'rotuladores', label: 'Rotuladores' },
                    { handle: 'papel-calcos', label: 'Papel y Calcos' },
                ],
            },
            {
                groupLabel: 'Consumibles',
                categories: [
                    { handle: 'desechables', label: 'Desechables' },
                    { handle: 'cups', label: 'Cups' },
                    { handle: 'plasticos', label: 'Plásticos y Envases' },
                ],
            },
            {
                groupLabel: 'Cuidado y Curación',
                categories: [
                    { handle: 'curacion', label: 'Curación' },
                    { handle: 'cuidados', label: 'Cuidados' },
                ],
            },
            {
                groupLabel: 'Accesorios',
                categories: [
                    { handle: 'accesorios-tatuaje', label: 'Accesorios Tatuaje' },
                    { handle: 'accesorios-trabajo', label: 'Accesorios de Trabajo' },
                    { handle: 'pieles-sinteticas', label: 'Pieles Sintéticas' },
                ],
            },
        ],
        // Flat list (union of all groups) — used for filtering and non-grouped displays
        get categories() {
            return this.categoryGroups.flatMap(g => g.categories)
        },
        brands: [
            { handle: 'proton', label: 'Protón' },
            { handle: 'biotatum', label: 'Biotatum' },
            { handle: 'tattooshop', label: 'TattooShop' },
            { handle: 'cosco', label: 'Cosco' },
            { handle: 'stencil-stuff', label: 'Stencil Stuff' },
        ],
    },
]

// ============================================
// AGGREGATED BRAND LIST
// ============================================

/**
 * Returns a deduplicated list of ALL brands across every product type.
 * Each entry includes { handle, label, types[] } so the UI can show
 * which types a brand covers.
 *
 * @returns {{ handle: string, label: string, types: string[] }[]}
 */
export function getAllBrands() {
    const map = new Map()
    for (const type of PRODUCT_TYPES) {
        for (const brand of type.brands) {
            if (map.has(brand.handle)) {
                map.get(brand.handle).types.push(type.value)
            } else {
                map.set(brand.handle, {
                    handle: brand.handle,
                    label: brand.label,
                    types: [type.value],
                })
            }
        }
    }
    // Sort alphabetically by label
    return Array.from(map.values()).sort((a, b) =>
        a.label.localeCompare(b.label, 'es')
    )
}

// ============================================
// LOOKUP HELPERS
// ============================================

/**
 * Resolves any type input (slug, value, UUID, mixed-case) to the matching
 * type object from PRODUCT_TYPES. This is the ONLY function that should be
 * used for type matching — no component should roll its own comparison.
 *
 * @param {string} input - slug ("agujas"), value ("Agujas"), or UUID
 * @returns {object|null} The matched type object, or null
 */
export function resolveTypeSlug(input) {
    if (!input) return null
    const normalized = input.toLowerCase().trim()

    // 1. Match by slug (most common — from URLs)
    const bySlug = PRODUCT_TYPES.find(t => t.slug === normalized)
    if (bySlug) return bySlug

    // 2. Match by value (from Medusa API responses)
    const byValue = PRODUCT_TYPES.find(t => t.value.toLowerCase() === normalized)
    if (byValue) return byValue

    // 3. Match by typeId (UUID — from Medusa internal IDs)
    const byId = PRODUCT_TYPES.find(t => t.typeId && t.typeId === input)
    if (byId) return byId

    return null
}

/**
 * Get the Medusa UUID for a type slug. Returns null if not yet enriched.
 * @param {string} slug - The type slug (e.g. "agujas")
 * @returns {string|null} The Medusa type UUID
 */
export function getTypeId(slug) {
    const type = resolveTypeSlug(slug)
    return type?.typeId || null
}

/**
 * Get all category handles that belong to a given type slug.
 * @param {string} typeSlug - e.g. "agujas"
 * @returns {string[]} Array of category handles
 */
export function getCategoriesForType(typeSlug) {
    const type = resolveTypeSlug(typeSlug)
    if (!type) return []
    return type.categories.map(c => c.handle)
}

/**
 * Get all brand/collection handles that belong to a given type slug.
 * @param {string} typeSlug - e.g. "agujas"
 * @returns {string[]} Array of collection handles
 */
export function getBrandsForType(typeSlug) {
    const type = resolveTypeSlug(typeSlug)
    if (!type) return []
    return type.brands.map(b => b.handle)
}

/**
 * Given a category handle, find which type it belongs to.
 * @param {string} categoryHandle - e.g. "round-liner"
 * @returns {object|null} The parent type object
 */
export function getTypeForCategory(categoryHandle) {
    if (!categoryHandle) return null
    const normalized = categoryHandle.toLowerCase().trim()
    return PRODUCT_TYPES.find(t =>
        t.categories.some(c => c.handle === normalized)
    ) || null
}

/**
 * Given a collection/brand handle, find which type it belongs to.
 * @param {string} brandHandle - e.g. "ultra-premium"
 * @returns {object|null} The parent type object
 */
export function getTypeForBrand(brandHandle) {
    if (!brandHandle) return null
    const normalized = brandHandle.toLowerCase().trim()
    return PRODUCT_TYPES.find(t =>
        t.brands.some(b => b.handle === normalized)
    ) || null
}

// ============================================
// RUNTIME ENRICHMENT
// ============================================

// Internal flag to avoid duplicate enrichment
let _enriched = false

/**
 * Enrich PRODUCT_TYPES with real Medusa UUIDs from the API.
 * This mutates PRODUCT_TYPES in-place (setting typeId).
 * Safe to call multiple times — only runs once.
 *
 * @param {Function} getProductTypesFn - The getProductTypes() function from medusa.js
 * @returns {Promise<boolean>} true if enrichment succeeded
 */
export async function enrichWithApiData(getProductTypesFn) {
    if (_enriched) return true

    try {
        const apiTypes = await getProductTypesFn()
        if (!apiTypes || apiTypes.length === 0) {
            console.warn('[navigation] No product types returned from API')
            return false
        }

        for (const type of PRODUCT_TYPES) {
            const match = apiTypes.find(
                t => t.value?.toLowerCase().trim() === type.value.toLowerCase().trim()
            )
            if (match) {
                type.typeId = match.id
            } else {
                console.warn(
                    `[navigation] Type "${type.value}" not found in Medusa API. ` +
                    `Ensure a product type with this exact value exists in the admin.`
                )
            }
        }

        _enriched = true
        return true
    } catch (error) {
        console.error('[navigation] Error enriching types from API:', error)
        return false
    }
}

/**
 * Reset enrichment state (for testing or forced re-fetch).
 */
export function resetEnrichment() {
    _enriched = false
    PRODUCT_TYPES.forEach(t => { t.typeId = null })
}
