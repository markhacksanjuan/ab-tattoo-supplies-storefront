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

export async function getCurrentUser() {
    const response = await userApi.get('/api/users/me')
    return response.data
}

export async function updateUserProfile(updates) {
    const response = await userApi.put('/api/users/me', updates)
    return response.data
}

export default userApi
