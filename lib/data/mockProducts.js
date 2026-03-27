// Mock products for development and testing
export const mockProducts = [
    {
        id: 'prod_ink_black_01',
        title: 'Eternal Ink - Triple Black',
        description: 'Premium black ink for lining and shading. High pigment concentration for bold, lasting results.',
        thumbnail: 'https://images.unsplash.com/photo-1598371839696-5c5bb06a5200?w=400&h=400&fit=crop',
        handle: 'eternal-ink-triple-black',
        isNew: true,
        variants: [{
            id: 'var_ink_black_01',
            title: '1oz Bottle',
            prices: [{ amount: 1500, currency_code: 'EUR' }],
            inventory_quantity: 50
        }],
        collection: { title: 'Black Inks' },
        tags: [{ value: 'ink' }, { value: 'black' }]
    },
    {
        id: 'prod_ink_color_01',
        title: 'Intenze - Color Set 10 Pack',
        description: 'Professional color ink set with 10 vibrant colors. Perfect for traditional and neo-traditional styles.',
        thumbnail: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop',
        handle: 'intenze-color-set',
        isNew: false,
        variants: [{
            id: 'var_ink_color_01',
            title: '10 x 1oz Bottles',
            prices: [{ amount: 12500, currency_code: 'EUR' }],
            inventory_quantity: 25
        }],
        collection: { title: 'Color Inks' },
        tags: [{ value: 'ink' }, { value: 'color' }]
    },
    {
        id: 'prod_needles_liner_01',
        title: 'Cheyenne Craft Liner - 0.30mm',
        description: 'Premium liner cartridges for precise lines. Compatible with all Cheyenne machines.',
        thumbnail: 'https://images.unsplash.com/photo-1562575214-da9fcf59b907?w=400&h=400&fit=crop',
        handle: 'cheyenne-craft-liner',
        isNew: false,
        variants: [{
            id: 'var_needles_liner_01',
            title: 'Box of 20',
            prices: [{ amount: 3500, currency_code: 'EUR' }],
            inventory_quantity: 100
        }],
        collection: { title: 'Needle Cartridges' },
        tags: [{ value: 'needles' }, { value: 'liner' }]
    },
    {
        id: 'prod_needles_shader_01',
        title: 'Kwadron Mag Shader - 0.35mm',
        description: 'Professional magnum shader cartridges for smooth gradients and fills.',
        thumbnail: 'https://images.unsplash.com/photo-1590246815117-ed77980f3fc7?w=400&h=400&fit=crop',
        handle: 'kwadron-mag-shader',
        isNew: true,
        variants: [{
            id: 'var_needles_shader_01',
            title: 'Box of 20',
            prices: [{ amount: 3800, currency_code: 'EUR' }],
            inventory_quantity: 80
        }],
        collection: { title: 'Needle Cartridges' },
        tags: [{ value: 'needles' }, { value: 'shader' }]
    },
    {
        id: 'prod_machine_pen_01',
        title: 'Cheyenne Sol Nova Unlimited',
        description: 'Professional pen-style tattoo machine. Adjustable stroke length, whisper quiet operation.',
        thumbnail: 'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=400&h=400&fit=crop',
        handle: 'cheyenne-sol-nova',
        isNew: true,
        variants: [{
            id: 'var_machine_pen_01',
            title: 'Black Edition',
            prices: [{ amount: 65000, currency_code: 'EUR' }],
            inventory_quantity: 10
        }],
        collection: { title: 'Pen Machines' },
        tags: [{ value: 'machines' }, { value: 'pen' }]
    },
    {
        id: 'prod_machine_rotary_01',
        title: 'FK Irons Spektra Xion',
        description: 'Premium rotary machine with adjustable give. Perfect for all styles and techniques.',
        thumbnail: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop',
        handle: 'fk-irons-spektra-xion',
        isNew: false,
        variants: [{
            id: 'var_machine_rotary_01',
            title: 'Standard',
            prices: [{ amount: 55000, currency_code: 'EUR' }],
            inventory_quantity: 8
        }],
        collection: { title: 'Rotary Machines' },
        tags: [{ value: 'machines' }, { value: 'rotary' }]
    },
    {
        id: 'prod_supply_butter_01',
        title: 'Hustle Butter Deluxe',
        description: 'Premium tattoo aftercare butter. Vegan, organic ingredients for optimal healing.',
        thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
        handle: 'hustle-butter-deluxe',
        isNew: false,
        variants: [{
            id: 'var_supply_butter_01',
            title: '5oz Tub',
            prices: [{ amount: 2500, currency_code: 'EUR' }],
            inventory_quantity: 200
        }],
        collection: { title: 'Aftercare' },
        tags: [{ value: 'supplies' }, { value: 'aftercare' }]
    },
    {
        id: 'prod_supply_gloves_01',
        title: 'Unigloves Black Pearl Nitrile',
        description: 'Professional grade black nitrile gloves. Powder-free, textured fingertips.',
        thumbnail: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=400&fit=crop',
        handle: 'unigloves-black-pearl',
        isNew: false,
        variants: [{
            id: 'var_supply_gloves_01',
            title: 'Box of 100 (M)',
            prices: [{ amount: 1800, currency_code: 'EUR' }],
            inventory_quantity: 150
        }],
        collection: { title: 'Safety' },
        tags: [{ value: 'supplies' }, { value: 'safety' }]
    }
]

export function getMockProducts(category = null) {
    if (!category) return mockProducts

    const categoryMap = {
        'inks': ['ink', 'black', 'color'],
        'needles': ['needles', 'liner', 'shader'],
        'machines': ['machines', 'pen', 'rotary'],
        'supplies': ['supplies', 'aftercare', 'safety']
    }

    const tags = categoryMap[category] || []
    return mockProducts.filter(product =>
        product.tags.some(tag => tags.includes(tag.value))
    )
}

export function getMockProduct(id) {
    return mockProducts.find(product => product.id === id) || null
}
