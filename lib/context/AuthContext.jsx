'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        checkAuth()
        loadGoogleScript()
    }, [])

    const loadGoogleScript = () => {
        // Load Google Sign-In script
        if (typeof window !== 'undefined' && !window.google) {
            const script = document.createElement('script')
            script.src = 'https://accounts.google.com/gsi/client'
            script.async = true
            script.defer = true
            document.body.appendChild(script)
        }
    }

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const response = await axios.get(`${USER_API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUser(response.data)
        } catch (err) {
            localStorage.removeItem('auth_token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        setError(null)
        try {
            const response = await axios.post(`${USER_API_URL}/api/users/login`, {
                email,
                password
            })
            const { access_token, user: userData } = response.data
            localStorage.setItem('auth_token', access_token)
            setUser(userData)
            return userData
        } catch (err) {
            const message = err.response?.data?.detail || 'Login failed'
            setError(message)
            throw new Error(message)
        }
    }

    const loginWithGoogle = async (googleToken) => {
        setError(null)
        try {
            const response = await axios.post(`${USER_API_URL}/api/auth/google`, {
                token: googleToken
            })
            const { access_token, user: userData } = response.data
            localStorage.setItem('auth_token', access_token)
            setUser(userData)
            return userData
        } catch (err) {
            const message = err.response?.data?.detail || 'Google login failed'
            setError(message)
            throw new Error(message)
        }
    }

    const register = async (userData) => {
        setError(null)
        try {
            const response = await axios.post(`${USER_API_URL}/api/users/register`, userData)
            const { access_token, user: newUser } = response.data
            localStorage.setItem('auth_token', access_token)
            setUser(newUser)
            return newUser
        } catch (err) {
            const message = err.response?.data?.detail || 'Registration failed'
            setError(message)
            throw new Error(message)
        }
    }

    const logout = () => {
        localStorage.removeItem('auth_token')
        setUser(null)
    }

    const updateProfile = async (updates) => {
        const token = localStorage.getItem('auth_token')
        try {
            const response = await axios.put(`${USER_API_URL}/api/users/me`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUser(response.data)
            return response.data
        } catch (err) {
            const message = err.response?.data?.detail || 'Update failed'
            setError(message)
            throw new Error(message)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            loginWithGoogle,
            register,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
