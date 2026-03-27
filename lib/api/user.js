import axios from 'axios'

const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8000'

const userApi = axios.create({
    baseURL: USER_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
userApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

export async function registerUser(userData) {
    const response = await userApi.post('/api/users/register', userData)
    return response.data
}

export async function loginUser(email, password) {
    const response = await userApi.post('/api/users/login', { email, password })
    return response.data
}

export async function loginWithGoogle(googleToken) {
    const response = await userApi.post('/api/auth/google', { token: googleToken })
    return response.data
}

export async function getCurrentUser() {
    const response = await userApi.get('/api/users/me')
    return response.data
}

export async function updateUserProfile(updates) {
    const response = await userApi.put('/api/users/me', updates)
    return response.data
}

// ============================================
// ADDRESS MANAGEMENT
// ============================================

export async function getAddresses() {
    const response = await userApi.get('/api/users/me/addresses')
    return response.data
}

export async function setBillingAddress(address) {
    const response = await userApi.put('/api/users/me/billing-address', address)
    return response.data
}

export async function deleteBillingAddress() {
    const response = await userApi.delete('/api/users/me/billing-address')
    return response.data
}

export async function addShippingAddress(address) {
    const response = await userApi.post('/api/users/me/shipping-addresses', address)
    return response.data
}

export async function updateShippingAddress(addressId, address) {
    const response = await userApi.put(`/api/users/me/shipping-addresses/${addressId}`, address)
    return response.data
}

export async function deleteShippingAddress(addressId) {
    const response = await userApi.delete(`/api/users/me/shipping-addresses/${addressId}`)
    return response.data
}

export async function setDefaultShippingAddress(addressId) {
    const response = await userApi.put(`/api/users/me/shipping-addresses/${addressId}/default`)
    return response.data
}

// ============================================
// CONTACT
// ============================================

export async function sendContactMessage({ name, email, subject, message }) {
    const response = await userApi.post('/api/contact', { name, email, subject, message })
    return response.data
}

export default userApi
