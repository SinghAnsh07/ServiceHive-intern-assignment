import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`;

// Configure axios to send cookies
axios.defaults.withCredentials = true;

// Types
interface User {
    _id: string;
    name: string;
    email: string;
    role: 'client' | 'freelancer';
}

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'client' | 'freelancer';
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

// Register user
export const register = createAsyncThunk<User, RegisterData, { rejectValue: string }>(
    'auth/register',
    async (userData: RegisterData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

// Login user
export const login = createAsyncThunk<User, LoginData, { rejectValue: string }>(
    'auth/login',
    async (userData: LoginData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, userData);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Logout user
export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

// Get current user
export const getMe = createAsyncThunk<User, void, { rejectValue: string }>(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/me`);
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get user');
        }
    }
);

const initialState: AuthState = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            // Get Me
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(getMe.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
