'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getNavigationTree } from '@/lib/api/medusa'

const NavigationContext = createContext(null)

// In-memory cache — survives across component mounts within the same
// page session, eliminating redundant API calls.
let _cachedTree = null
let _fetchPromise = null

export function NavigationProvider({ children }) {
    const [navTree, setNavTree] = useState(_cachedTree || [])
    const [loading, setLoading] = useState(!_cachedTree)

    useEffect(() => {
        if (_cachedTree) {
            setNavTree(_cachedTree)
            setLoading(false)
            return
        }

        // Deduplicate concurrent fetches
        if (!_fetchPromise) {
            _fetchPromise = getNavigationTree()
                .then(tree => {
                    _cachedTree = tree
                    return tree
                })
                .catch(err => {
                    console.error('[NavigationContext] Failed to load nav tree:', err)
                    return []
                })
                .finally(() => { _fetchPromise = null })
        }

        _fetchPromise.then(tree => {
            setNavTree(tree)
            setLoading(false)
        })
    }, [])

    // ── Lookup helpers (equivalents of the old navigation.js exports) ──

    const resolveType = useCallback((input) => {
        if (!input) return null
        const normalized = input.toLowerCase().trim()
        return navTree.find(t =>
            t.slug === normalized ||
            t.name.toLowerCase() === normalized ||
            (t.typeId && t.typeId === input)
        ) || null
    }, [navTree])

    const getTypeId = useCallback((slug) => {
        return resolveType(slug)?.typeId || null
    }, [resolveType])

    const getCategoriesForType = useCallback((typeSlug) => {
        const type = resolveType(typeSlug)
        if (!type) return []
        return type.categories.map(c => c.handle)
    }, [resolveType])

    const getBrandsForType = useCallback((typeSlug) => {
        const type = resolveType(typeSlug)
        if (!type) return []
        return type.brands.map(b => b.handle)
    }, [resolveType])

    const getTypeForCategory = useCallback((categoryHandle) => {
        if (!categoryHandle) return null
        const normalized = categoryHandle.toLowerCase().trim()
        return navTree.find(t =>
            t.categories.some(c => c.handle === normalized)
        ) || null
    }, [navTree])

    const getTypeForBrand = useCallback((brandHandle) => {
        if (!brandHandle) return null
        const normalized = brandHandle.toLowerCase().trim()
        return navTree.find(t =>
            t.brands.some(b => b.handle === normalized)
        ) || null
    }, [navTree])

    const getAllBrands = useCallback(() => {
        const map = new Map()
        for (const type of navTree) {
            for (const brand of type.brands) {
                if (map.has(brand.handle)) {
                    map.get(brand.handle).types.push(type.name)
                } else {
                    map.set(brand.handle, {
                        handle: brand.handle,
                        label: brand.label,
                        types: [type.name],
                    })
                }
            }
        }
        return Array.from(map.values()).sort((a, b) =>
            a.label.localeCompare(b.label, 'es')
        )
    }, [navTree])

    const value = {
        navTree,
        loading,
        resolveType,
        getTypeId,
        getCategoriesForType,
        getBrandsForType,
        getTypeForCategory,
        getTypeForBrand,
        getAllBrands,
    }

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    )
}

/**
 * Hook to consume navigation data.
 * All components that previously imported from navigation.js should use this.
 */
export function useNavigation() {
    const context = useContext(NavigationContext)
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider')
    }
    return context
}
