import {
    Palette,
    Syringe,
    Droplets,
    Zap,
    Shield,
    Heart,
    Star,
    Package,
    Scissors,
    Pen,
    PenTool,
    Brush,
    Pipette,
    FlaskConical,
    Stethoscope,
    Bandage,
    Lamp,
    Layers,
    Box,
    ShoppingBag,
    Tag,
} from 'lucide-react'

/**
 * Maps icon name strings (stored in Medusa category metadata)
 * to Lucide React icon components.
 *
 * To use a new icon:
 * 1. Import it from lucide-react above
 * 2. Add it to this map with a lowercase key
 * 3. Set metadata.icon = "key" on the Medusa category
 */
const ICON_MAP = {
    palette: Palette,
    syringe: Syringe,
    droplets: Droplets,
    zap: Zap,
    shield: Shield,
    heart: Heart,
    star: Star,
    package: Package,
    scissors: Scissors,
    pen: Pen,
    pentool: PenTool,
    brush: Brush,
    pipette: Pipette,
    flask: FlaskConical,
    stethoscope: Stethoscope,
    bandage: Bandage,
    lamp: Lamp,
    layers: Layers,
    box: Box,
    shoppingbag: ShoppingBag,
    tag: Tag,
}

// Default icon when no match is found
const DEFAULT_ICON = Package

/**
 * Get a Lucide icon component from a string name.
 * @param {string} iconName - The icon name stored in category metadata
 * @returns {import('react').ComponentType} The Lucide icon component
 */
export function getIconComponent(iconName) {
    if (!iconName) return DEFAULT_ICON
    return ICON_MAP[iconName.toLowerCase()] || DEFAULT_ICON
}
