/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            // Local development
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
                pathname: '/uploads/**',
            },
            // DO Spaces CDN (production)
            {
                protocol: 'https',
                hostname: '*.digitaloceanspaces.com',
            },
            // Unsplash (placeholder images)
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            // DO App Platform (production Medusa backend)
            {
                protocol: 'https',
                hostname: '*.ondigitalocean.app',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
        NEXT_PUBLIC_USER_API_URL: process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8000',
        NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY || '',
    },
};

module.exports = nextConfig;
