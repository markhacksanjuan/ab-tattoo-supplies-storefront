# Fase 2 — Navegación 100% Dinámica desde Medusa

## Resumen

Eliminar el array hardcodeado `PRODUCT_TYPES` de `lib/data/navigation.js` como fuente
de verdad y reemplazarlo por datos cargados en tiempo real desde la API de Medusa.
Medusa pasa a ser el **único origen de datos** para tipos, categorías, marcas, iconos,
descripciones y agrupaciones visuales.

---

## Índice

1. [Problema actual](#1-problema-actual)
2. [Arquitectura objetivo](#2-arquitectura-objetivo)
3. [Prerequisitos en Medusa Admin](#3-prerequisitos-en-medusa-admin)
4. [Paso 1 — Nueva función API `getNavigationTree()`](#4-paso-1--nueva-función-api-getnavigationtree)
5. [Paso 2 — Crear `NavigationContext`](#5-paso-2--crear-navigationcontext)
6. [Paso 3 — Refactorizar `Header.jsx`](#6-paso-3--refactorizar-headerjsx)
7. [Paso 4 — Refactorizar `ProductFilters.jsx`](#7-paso-4--refactorizar-productfiltersjsx)
8. [Paso 5 — Refactorizar `products/page.jsx`](#8-paso-5--refactorizar-productspagejsx)
9. [Paso 6 — Refactorizar `HomeCategoryGrid.jsx`](#9-paso-6--refactorizar-homecategorygridjsx)
10. [Paso 7 — Refactorizar `Footer.jsx`](#10-paso-7--refactorizar-footerjsx)
11. [Paso 8 — Eliminar `navigation.js`](#11-paso-8--eliminar-navigationjs)
12. [Paso 9 — Cacheo y rendimiento](#12-paso-9--cacheo-y-rendimiento)
13. [Checklist de validación](#13-checklist-de-validación)
14. [Riesgos y rollback](#14-riesgos-y-rollback)

---

## 1. Problema actual

```
navigation.js (hardcoded)         Medusa (base de datos)
┌─────────────────────────┐      ┌─────────────────────────┐
│ handle: 'blancos'       │  ≠   │ handle: 'tintas-blanco' │
│ handle: 'negro-y-grises'│  ≠   │ handle: 'tintas-negro'  │
│ handle: 'sets-de-tintas'│  ≠   │ handle: 'sets-tintas'   │
│ label:  'Blancos'       │  =   │ name:   'Blancos'       │  ← duplicado
└─────────────────────────┘      └─────────────────────────┘
```

**Síntomas:**
- Cualquier cambio de handle/nombre en Medusa Admin rompe el storefront sin warning.
- Añadir una nueva categoría o marca requiere cambiar código y redesplegar.
- Datos duplicados en dos sitios que se desincronizan.

**Componentes afectados (6 archivos):**

| Archivo | Qué importa de `navigation.js` |
|---------|-------------------------------|
| `components/molecules/Header/Header.jsx` | `PRODUCT_TYPES`, `enrichWithApiData` |
| `app/products/page.jsx` | `PRODUCT_TYPES`, `resolveTypeSlug`, `enrichWithApiData` |
| `components/molecules/ProductFilters/ProductFilters.jsx` | `PRODUCT_TYPES`, `resolveTypeSlug`, `getCategoriesForType`, `getBrandsForType`, `enrichWithApiData` |
| `components/molecules/HomeCategoryGrid/HomeCategoryGrid.jsx` | `PRODUCT_TYPES`, `enrichWithApiData` |
| `components/molecules/Footer/Footer.jsx` | `PRODUCT_TYPES` |
| `lib/data/navigation.js` | Fuente (311 líneas — a eliminar) |

---

## 2. Arquitectura objetivo

```
┌──────────────────────────────────────────────────────────────┐
│                   Medusa (única fuente de verdad)             │
│                                                              │
│  Categories (jerárquicas):                                   │
│    Agujas (padre, metadata: {icon, description, rank})       │
│      ├── Round Liner (hijo)                                  │
│      ├── Round Shader (hijo)                                 │
│      └── ...                                                 │
│    Tintas (padre, metadata: {icon, description, rank})       │
│      ├── Tintas Color (hijo)                                 │
│      └── ...                                                 │
│    Material (padre, metadata: {icon, description, rank,      │
│             category_groups: [...]})                          │
│      ├── Diluyentes (hijo, metadata: {group: "Preparación"}) │
│      └── ...                                                 │
│                                                              │
│  Collections (marcas):                                       │
│    Ultra Premium (metadata: {types: ["Agujas"]})             │
│    Dermaglo (metadata: {types: ["Tintas"]})                  │
│    Protón (metadata: {types: ["Material"]})                  │
│                                                              │
│  Product Types: Agujas, Tintas, Material                     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼ API call (1 request, cached)
┌──────────────────────────────────────────────────────────────┐
│            NavigationContext (React Context)                   │
│                                                              │
│  navigationTree = [                                          │
│    {                                                         │
│      slug: 'agujas',      // parent_category.handle          │
│      name: 'Agujas',      // parent_category.name            │
│      typeId: 'ptyp_...',  // matched product type UUID       │
│      icon: 'syringe',     // metadata.icon                   │
│      description: '...',  // metadata.description            │
│      categories: [...],   // category_children               │
│      categoryGroups: null, // or from metadata                │
│      brands: [...],       // collections filtered by meta    │
│    },                                                        │
│    ...                                                       │
│  ]                                                           │
│                                                              │
│  Exports: useNavigation(), resolveType(), getCatsForType()   │
└──────────────────────────────────────────────────────────────┘
         │              │              │            │
    ┌────▼────┐   ┌────▼─────┐  ┌────▼──────┐ ┌──▼──────┐
    │ Header  │   │ Filters  │  │ HomeCat   │ │ Footer  │
    │         │   │          │  │ Grid      │ │         │
    └─────────┘   └──────────┘  └───────────┘ └─────────┘
```

**Principio clave:** Los componentes consumen datos del Context, nunca de un archivo
estático. Si Medusa tarda en responder, se muestra un skeleton. En la práctica, con
cache, el primer render ya tiene datos.

---

## 3. Prerequisitos en Medusa Admin

Antes de tocar código del storefront, configurar la metadata en Medusa Admin.

### 3.1 Categorías padre — añadir metadata

Para cada categoría padre (Agujas, Tintas, Material), editar en Admin >
Product Categories y añadir este JSON en el campo `metadata`:

**Agujas:**
```json
{
  "icon": "syringe",
  "description": "Agujas de tatuaje profesionales de las mejores marcas",
  "rank": 0
}
```

**Tintas:**
```json
{
  "icon": "droplets",
  "description": "Tintas de tatuaje de alta calidad con pigmentos premium",
  "rank": 1
}
```

**Material:**
```json
{
  "icon": "package",
  "description": "Material y accesorios esenciales para tu estudio",
  "rank": 2,
  "category_groups": [
    {
      "groupLabel": "Preparación",
      "handles": ["diluyentes", "desinfectantes", "jabones", "vaselinas", "cremas"]
    },
    {
      "groupLabel": "Stencil y Diseño",
      "handles": ["stencil", "quita-stencil", "rotuladores", "papel-calcos"]
    },
    {
      "groupLabel": "Consumibles",
      "handles": ["desechables", "cups", "plasticos"]
    },
    {
      "groupLabel": "Cuidado y Curación",
      "handles": ["curacion", "cuidados"]
    },
    {
      "groupLabel": "Accesorios",
      "handles": ["accesorios-tatuaje", "accesorios-trabajo", "pieles-sinteticas"]
    }
  ]
}
```

> **Nota:** `category_groups` solo lo tiene Material. Agujas y Tintas no lo necesitan
> porque sus categorías se muestran como lista plana.

### 3.2 Categorías hijas — verificar

Las categorías hijas no necesitan metadata especial. Solo asegurarse de que:
- Cada hija tenga `parent_category_id` apuntando a su padre correcto.
- Los handles sean correctos según `PRODUCT_HIERARCHY.md`.
- `is_active = true` para todas las que deban mostrarse.

### 3.3 Collections (marcas) — añadir metadata de tipo

Para cada collection/marca, añadir `metadata.types` indicando a qué tipo(s) pertenece:

```json
// Ultra Premium (marca de agujas)
{ "types": ["Agujas"] }

// Dermaglo (marca de tintas)
{ "types": ["Tintas"] }

// Protón (marca de material)
{ "types": ["Material"] }
```

> Si una marca vendiera productos de varios tipos, el array tendría múltiples valores:
> `{ "types": ["Agujas", "Tintas"] }`.

### 3.4 Verificación

Antes de continuar, verificar desde la API de Medusa que todo está correcto:

```bash
# Verificar categorías con árbol de hijos
curl -s "${MEDUSA_URL}/store/product-categories?include_descendants_tree=true&fields=+category_children,+description,+metadata" \
  -H "x-publishable-api-key: ${PUBLISHABLE_KEY}" | jq '.product_categories[] | select(.parent_category_id == null) | {name, handle, metadata, children: [.category_children[]? | {name, handle}]}'

# Verificar collections con metadata
curl -s "${MEDUSA_URL}/store/collections?limit=100" \
  -H "x-publishable-api-key: ${PUBLISHABLE_KEY}" | jq '.collections[] | {title, handle, metadata}'
```

---

## 4. Paso 1 — Nueva función API `getNavigationTree()`

**Archivo:** `lib/api/medusa.js`

Añadir una nueva función que construye el árbol de navegación completo con una sola
combinación de llamadas API:

```javascript
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
        getCollections(),
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

        // Get child categories
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
                const colTypes = col.metadata?.types || []
                return colTypes.some(
                    t => t.toLowerCase().trim() === root.name.toLowerCase().trim()
                )
            })
            .map(col => ({
                handle: col.handle,
                label: col.title,
                id: col.id,
            }))

        // Build categoryGroups if metadata defines them (Material)
        let categoryGroups = null
        if (root.metadata?.category_groups) {
            categoryGroups = root.metadata.category_groups.map(group => ({
                groupLabel: group.groupLabel,
                categories: group.handles
                    .map(h => children.find(c => c.handle === h))
                    .filter(Boolean),
            }))
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
```

---

## 5. Paso 2 — Crear `NavigationContext`

**Nuevo archivo:** `lib/context/NavigationContext.jsx`

```jsx
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
```

---

## 6. Paso 3 — Refactorizar `Header.jsx`

**Archivo:** `components/molecules/Header/Header.jsx`

### Cambios:

1. **Eliminar imports** de `navigation.js`:
   ```diff
   - import { PRODUCT_TYPES, enrichWithApiData } from '@/lib/data/navigation'
   - import { getProductTypes } from '@/lib/api/medusa'
   + import { useNavigation } from '@/lib/context/NavigationContext'
   ```

2. **Eliminar el `useEffect` de enriquecimiento** (ya no se necesita):
   ```diff
   - const enrichedRef = useRef(false)
   - useEffect(() => {
   -     if (enrichedRef.current) return
   -     enrichedRef.current = true
   -     enrichWithApiData(getProductTypes)
   - }, [])
   ```

3. **Usar el Context** en lugar del array estático:
   ```diff
   + const { navTree, loading } = useNavigation()
   ```

4. **Reemplazar `PRODUCT_TYPES` por `navTree`** en el JSX:
   ```diff
   - {PRODUCT_TYPES.map((type, index) => (
   + {navTree.map((type, index) => (
       <div key={type.slug} ...>
           <Link href={`/products?type=${type.slug}`} ...>
   -           {type.value}
   +           {type.name}
           </Link>
           ...
       </div>
   ))}
   ```

5. **Ajustar `renderDropdownContent`:**
   - Cambiar `type.value` → `type.name` en textos.
   - La lógica de `categoryGroups` ya viene resuelta del Context.

6. **Opcional — skeleton mientras carga:**
   ```jsx
   {loading ? (
       <nav className={styles.nav}>
           <span className={styles.navSkeleton} />
           <span className={styles.navSkeleton} />
           <span className={styles.navSkeleton} />
       </nav>
   ) : (
       <nav className={styles.nav}>
           {/* ... navTree.map ... */}
       </nav>
   )}
   ```

---

## 7. Paso 4 — Refactorizar `ProductFilters.jsx`

**Archivo:** `components/molecules/ProductFilters/ProductFilters.jsx`

### Cambios:

1. **Eliminar imports** de `navigation.js`:
   ```diff
   - import {
   -     PRODUCT_TYPES,
   -     resolveTypeSlug,
   -     getCategoriesForType,
   -     getBrandsForType,
   -     enrichWithApiData,
   - } from '@/lib/data/navigation'
   + import { useNavigation } from '@/lib/context/NavigationContext'
   ```

2. **Eliminar el `useEffect` de enriquecimiento.**

3. **Usar el Context:**
   ```diff
   + const { navTree, resolveType, getCategoriesForType, getBrandsForType } = useNavigation()
   ```

4. **Reemplazar las referencias:**
   - `PRODUCT_TYPES` → `navTree`
   - `resolveTypeSlug(...)` → `resolveType(...)`
   - `type.value` → `type.name`
   - `getCategoriesForType(...)` → `getCategoriesForType(...)` (mismo nombre, viene del Context)
   - `getBrandsForType(...)` → `getBrandsForType(...)` (mismo nombre)

5. **El filtro de tipos ahora renderiza desde `navTree`:**
   ```diff
   - {PRODUCT_TYPES.map((type) => (
   + {navTree.map((type) => (
       <li key={type.slug}>
           <button ...>
   -           {type.value}
   +           {type.name}
           </button>
       </li>
   ))}
   ```

---

## 8. Paso 5 — Refactorizar `products/page.jsx`

**Archivo:** `app/products/page.jsx`

### Cambios:

1. **Eliminar imports** de `navigation.js`:
   ```diff
   - import { PRODUCT_TYPES, resolveTypeSlug, enrichWithApiData } from '@/lib/data/navigation'
   + import { useNavigation } from '@/lib/context/NavigationContext'
   ```

2. **Usar el Context:**
   ```diff
   + const { navTree, resolveType, loading: navLoading } = useNavigation()
   ```

3. **En la resolución de búsqueda universal**, reemplazar:
   ```diff
   - await enrichWithApiData(getProductTypes)
   - const matchedType = resolveTypeSlug(normalized)
   + const matchedType = resolveType(normalized)
   ```

4. **En la resolución de categoría por nombre** (búsqueda universal):
   ```diff
   - const allNavCats = PRODUCT_TYPES.flatMap(t => t.categories)
   + const allNavCats = navTree.flatMap(t => t.categories)
   ```

5. **En el filtro de tipo:**
   ```diff
   - await enrichWithApiData(getProductTypes)
   - const typeObj = resolveTypeSlug(typeParam)
   + const typeObj = resolveType(typeParam)
   ```

6. **Esperar a que la navegación cargue** antes de resolver filtros:
   ```javascript
   // Al inicio del useCallback de loadProducts:
   if (navLoading) return // will re-run when navTree loads
   ```
   Y añadir `navLoading` y `navTree` a las dependencias del `useCallback`.

---

## 9. Paso 6 — Refactorizar `HomeCategoryGrid.jsx`

**Archivo:** `components/molecules/HomeCategoryGrid/HomeCategoryGrid.jsx`

### Cambios:

```diff
- import { PRODUCT_TYPES, enrichWithApiData } from '@/lib/data/navigation'
- import { getProductTypes } from '@/lib/api/medusa'
+ import { useNavigation } from '@/lib/context/NavigationContext'

  export default function HomeCategoryGrid() {
-     const enrichedRef = useRef(false)
-     useEffect(() => {
-         if (enrichedRef.current) return
-         enrichedRef.current = true
-         enrichWithApiData(getProductTypes)
-     }, [])
+     const { navTree, loading } = useNavigation()
+
+     if (loading) return <section className={styles.categories}><div className={styles.skeleton} /></section>

      return (
          <section className={styles.categories}>
              ...
-             {PRODUCT_TYPES.map((type) => {
+             {navTree.map((type) => {
                  const IconComponent = getIconComponent(type.icon)
                  return (
                      <Link href={`/products?type=${type.slug}`} key={type.slug} ...>
                          <IconComponent size={32} />
-                         <h3>{type.value}</h3>
+                         <h3>{type.name}</h3>
                          ...
                      </Link>
                  )
              })}
          </section>
      )
  }
```

---

## 10. Paso 7 — Refactorizar `Footer.jsx`

**Archivo:** `components/molecules/Footer/Footer.jsx`

### Cambios:

```diff
- import { PRODUCT_TYPES } from '@/lib/data/navigation'
+ 'use client'
+ import { useNavigation } from '@/lib/context/NavigationContext'

  export default function Footer() {
+     const { navTree } = useNavigation()
      return (
          <footer>
              ...
-             {PRODUCT_TYPES.map(type => (
+             {navTree.map(type => (
                  <Link key={type.slug} href={`/products?type=${type.slug}`}>
-                     {type.value}
+                     {type.name}
                  </Link>
              ))}
          </footer>
      )
  }
```

> **Nota:** Footer actualmente es un Server Component. Al usar `useNavigation()` (hook),
> necesita convertirse en Client Component con `'use client'`. Esto es aceptable porque
> el Footer no contiene datos sensibles al SEO que requieran SSR.

---

## 11. Paso 8 — Eliminar `navigation.js`

Una vez todos los componentes usen `NavigationContext`:

1. **Eliminar** `lib/data/navigation.js` por completo.
2. **Buscar** cualquier referencia restante:
   ```bash
   grep -r "navigation" storefront/lib/ storefront/components/ storefront/app/ \
     --include="*.jsx" --include="*.js" -l
   ```
3. **Verificar** que no quede ningún import de `@/lib/data/navigation`.

---

## 12. Paso 9 — Cacheo y rendimiento

### Problema potencial
El Header debe renderizarse rápido. Si la API tarda, el usuario ve un navbar vacío.

### Soluciones (de menor a mayor complejidad):

#### Opción A — Cache en memoria (implementada en el Context)
La variable `_cachedTree` en `NavigationContext.jsx` ya cachea el resultado dentro de
la misma sesión del navegador. Tras la primera carga, todas las navegaciones entre
páginas reutilizan el cache sin llamada API.

**Pros:** Sencillo, sin dependencias externas.
**Contras:** La primera visita siempre requiere API call.

#### Opción B — `localStorage` con TTL
```javascript
const CACHE_KEY = 'ab_nav_tree'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function getCachedTree() {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const { tree, timestamp } = JSON.parse(raw)
        if (Date.now() - timestamp > CACHE_TTL) return null
        return tree
    } catch { return null }
}

function setCachedTree(tree) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            tree,
            timestamp: Date.now(),
        }))
    } catch {}
}
```

**Pros:** Primera visita rápida si el usuario vuelve dentro de 5 min.
**Contras:** Dato potencialmente stale (mitigado por TTL corto).

#### Opción C — Server Component con `fetch` + `revalidate`
Si el Layout se convierte en un Server Component que hace la llamada API con
`{ next: { revalidate: 300 } }`, los datos se cachean a nivel de servidor y se sirven
al cliente sin latencia visible.

```jsx
// app/layout.jsx (Server Component)
import { getNavigationTree } from '@/lib/api/medusa'

export default async function RootLayout({ children }) {
    const navTree = await getNavigationTree()
    return (
        <html lang="es">
            <body>
                <NavigationProvider initialTree={navTree}>
                    {children}
                </NavigationProvider>
            </body>
        </html>
    )
}
```

**Pros:** Renderizado instantáneo, SEO-friendly, mejor UX.
**Contras:** Requiere que `getNavigationTree()` funcione server-side (sin `medusaClient`
del SDK, usar `fetch` directamente). Más complejo.

### Recomendación
Empezar con **Opción A** (cache en memoria). Si se nota un flash en la primera visita,
subir a **Opción B** (localStorage). **Opción C** es la ideal a largo plazo pero
requiere refactorizar `medusa.js` para soportar llamadas server-side.

---

## 13. Checklist de validación

Después de aplicar todos los cambios, verificar cada uno de estos escenarios:

### 13.1 Metadata en Medusa
- [ ] Categoría "Agujas" tiene `metadata.icon = "syringe"`, `metadata.description`, `metadata.rank = 0`
- [ ] Categoría "Tintas" tiene `metadata.icon = "droplets"`, `metadata.description`, `metadata.rank = 1`
- [ ] Categoría "Material" tiene `metadata.icon = "package"`, `metadata.description`, `metadata.rank = 2`, `metadata.category_groups`
- [ ] Todas las subcategorías tienen `parent_category_id` correcto y `is_active = true`
- [ ] Todas las collections tienen `metadata.types` con el tipo correcto

### 13.2 Header / Navbar
- [ ] Los 3 tipos aparecen en el navbar (Agujas, Tintas, Material)
- [ ] El orden es correcto (Agujas → Tintas → Material)
- [ ] Hover en "Agujas" muestra dropdown con: Todas las Agujas, Round Liner, Round Shader, Magnum, Curved Magnum, Long Taper, Otras Agujas, sección Marcas
- [ ] Hover en "Tintas" muestra: Todas las Tintas, Tintas Color, Negro y Grises, Blancos, Sets de Tintas, sección Marcas
- [ ] Hover en "Material" muestra grupos: Preparación, Stencil y Diseño, Consumibles, Cuidado y Curación, Accesorios
- [ ] Click en "Tintas → Blancos" navega a `/products?type=tintas&category=tintas-blanco`
- [ ] La página de productos carga correctamente y muestra título "Tintas — Blancos"
- [ ] El menú móvil funciona igual que el desktop

### 13.3 ProductFilters
- [ ] Sin tipo seleccionado: se muestran los 3 tipos, categorías raíz, todas las marcas
- [ ] Seleccionar "Tintas": se muestran solo las categorías de Tintas y solo las marcas de Tintas
- [ ] Seleccionar "Tintas → Blancos": las marcas se filtran a solo las que tienen productos en Blancos
- [ ] "Ver más" / "Ver menos" funciona cuando hay > 10 items
- [ ] Floating filter panel funciona (se abre, selecciona, aplica)
- [ ] "Borrar todo" limpia todos los filtros

### 13.4 Products page
- [ ] URL `/products` muestra todos los productos
- [ ] URL `/products?type=agujas` filtra por Agujas
- [ ] URL `/products?type=tintas&category=tintas-blanco` filtra por Tintas > Blancos
- [ ] URL `/products?type=tintas&collection=dermaglo` filtra por Tintas > Dermaglo
- [ ] Búsqueda por `?q=radiant` resuelve correctamente la marca
- [ ] Búsqueda por `?q=round liner` resuelve correctamente la categoría
- [ ] Búsqueda universal `?q=azul` filtra client-side
- [ ] "Cargar más productos" funciona con filtros activos

### 13.5 HomeCategoryGrid
- [ ] Se muestran 3 cards (Agujas, Tintas, Material) + card de Marcas
- [ ] Los iconos son correctos (syringe, droplets, package)
- [ ] Las descripciones aparecen
- [ ] Click en cada card navega al tipo correcto

### 13.6 Footer
- [ ] Los 3 tipos aparecen en la sección "Productos"
- [ ] Los links navegan correctamente

### 13.7 Test de cambio dinámico
- [ ] **Añadir nueva categoría** en Medusa Admin (ej: "Cartuchos" bajo "Agujas") → sin redesplegar, la nueva categoría aparece en navbar, filtros, etc. tras recargar la página
- [ ] **Renombrar categoría** en Medusa Admin (ej: "Blancos" → "Tintas Blancas") → el cambio se refleja automáticamente
- [ ] **Añadir nueva marca** en Medusa Admin con metadata `{ "types": ["Tintas"] }` → aparece en el dropdown de Tintas
- [ ] **Desactivar categoría** (`is_active = false`) → desaparece de la navegación

### 13.8 Rendimiento
- [ ] Primera carga: navbar aparece en < 500ms
- [ ] Navegación entre páginas: navbar instantáneo (cache en memoria)
- [ ] No hay FOUC (flash of unstyled content) ni parpadeo visible
- [ ] Console del navegador sin errores ni warnings

### 13.9 Cleanup
- [ ] `lib/data/navigation.js` eliminado
- [ ] `grep -r "navigation.js" storefront/` no devuelve resultados
- [ ] `grep -r "PRODUCT_TYPES" storefront/` no devuelve resultados
- [ ] `grep -r "enrichWithApiData" storefront/` no devuelve resultados
- [ ] Build (`npm run build`) sin errores

---

## 14. Riesgos y rollback

### Riesgos
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| API de Medusa caída → navbar vacío | Baja | Alto | Cache localStorage (Opción B) + fallback estático mínimo |
| Metadata incorrecta/faltante | Media | Medio | Validación en `getNavigationTree()` con `console.warn` para metadata faltante |
| Rendimiento — demasiadas llamadas API | Baja | Bajo | Cache en memoria + deduplicación de fetches |
| Footer como Client Component afecta SEO | Baja | Bajo | Los links del footer no son críticos para SEO; Google renderiza JS |

### Plan de rollback
Si algo va mal, restaurar `navigation.js` desde git:
```bash
git checkout main -- lib/data/navigation.js
```
Y revertir los cambios en los 5 componentes afectados. La Fase 1 (fix de handles) ya
está en su propio commit, así que se preserva independientemente.

---

## Orden de ejecución recomendado

| # | Tarea | Tiempo estimado |
|---|-------|----------------|
| 1 | Configurar metadata en Medusa Admin (§3) | 15 min |
| 2 | Verificar metadata vía API (§3.4) | 5 min |
| 3 | Crear `getNavigationTree()` en medusa.js (§4) | 15 min |
| 4 | Crear `NavigationContext.jsx` (§5) | 15 min |
| 5 | Añadir `NavigationProvider` en `layout.jsx` | 2 min |
| 6 | Refactorizar Header (§6) | 15 min |
| 7 | Refactorizar ProductFilters (§7) | 15 min |
| 8 | Refactorizar products/page.jsx (§8) | 15 min |
| 9 | Refactorizar HomeCategoryGrid (§9) | 5 min |
| 10 | Refactorizar Footer (§10) | 5 min |
| 11 | Eliminar navigation.js (§11) | 5 min |
| 12 | Ejecutar checklist de validación (§13) | 30 min |
| **Total** | | **~2.5 horas** |
