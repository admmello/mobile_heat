import React, { createContext, useContext, useState, useEffect } from "react"
import * as AuthSession from 'expo-auth-session'
import AsyncStorage from "@react-native-async-storage/async-storage"

import { api } from "../services/api"


const CLIENT_ID = '37d1d9008069415d0d94'
const SCOPE = 'read:user'
const USER_STORAGE = '@mobile-heat:user'
const TOKEN_STORAGE = '@mobile-heat:token'

type User = {
    id: string
    avatar_url: string
    name: string
    login: string
}

type AuthcontextData = {
    user: User | null
    isSignIn: boolean
    signIn: () => Promise<void>
    signOut: () => Promise<void>
}

type AuthProviderProps = {
    children: React.ReactNode
}

type AuthResponse = {
    token: string
    user: User
}

type AuthorizationResponse = {
    params: {
        code?: string
        error?: string
    },
    type?: string
}

export const AuthContext = createContext({} as AuthcontextData)

function AuthProvider({ children }: AuthProviderProps) {
    const [isSignIn, setIsSignIn] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    async function signIn() {
        try {

            setIsSignIn(true)
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`
            const authSessionResponse = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse

            if (authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied') {
                const authResponse = await api.post('/authenticate', { code: authSessionResponse.params.code })
                const { token, user } = authResponse.data as AuthResponse

                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
                await AsyncStorage.setItem(TOKEN_STORAGE, token)

                setUser(user)
            }

            setIsSignIn(true)
        } catch (error) {
            console.log(error)
        } finally {
            setIsSignIn(false)
        }
    }

    async function signOut() {
        setUser(null)
        await AsyncStorage.removeItem(USER_STORAGE)
        await AsyncStorage.removeItem(TOKEN_STORAGE)
    }

    useEffect(() => {
        async function loadUserStorageData() {
            const useStorage = await AsyncStorage.getItem(USER_STORAGE)
            const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE)

            if (useStorage && tokenStorage) {
                api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage}`
                setUser(JSON.parse(useStorage))
            }
            setIsSignIn(false)
        }

        loadUserStorageData()
    }, [])

    return (
        <AuthContext.Provider
            value={{ signIn, signOut, user, isSignIn }}
        >
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() {
    const context = useContext(AuthContext)

    return context
}

export { AuthProvider, useAuth, }