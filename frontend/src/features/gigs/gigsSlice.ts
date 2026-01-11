import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/gigs';

axios.defaults.withCredentials = true;

// Get all gigs
export const getGigs = createAsyncThunk(
    'gigs/getAll',
    async (search: string | undefined, { rejectWithValue }) => {
        try {
            const url = search ? `${API_URL}?search=${search}` : API_URL;
            const response = await axios.get(url);
            return response.data.gigs;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch gigs');
        }
    }
);

// Get single gig
export const getGig = createAsyncThunk(
    'gigs/getOne',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data.gig;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch gig');
        }
    }
);

// Create gig
export const createGig = createAsyncThunk(
    'gigs/create',
    async (gigData: { title: string; description: string; budget: number; category: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_URL, gigData);
            return response.data.gig;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create gig');
        }
    }
);

// Get my gigs
export const getMyGigs = createAsyncThunk(
    'gigs/getMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/my-gigs`);
            return response.data.gigs;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your gigs');
        }
    }
);

interface Gig {
    _id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    ownerId: {
        _id: string;
        name: string;
        email: string;
    };
    freelancerId?: string;
    createdAt: string;
}

interface GigsState {
    gigs: Gig[];
    myGigs: Gig[];
    currentGig: Gig | null;
    isLoading: boolean;
    error: any;
}

const initialState: GigsState = {
    gigs: [],
    myGigs: [],
    currentGig: null,
    isLoading: false,
    error: null,
};

const gigsSlice = createSlice({
    name: 'gigs',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentGig: (state) => {
            state.currentGig = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all gigs
            .addCase(getGigs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getGigs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.gigs = action.payload;
            })
            .addCase(getGigs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get single gig
            .addCase(getGig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getGig.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentGig = action.payload;
            })
            .addCase(getGig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create gig
            .addCase(createGig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createGig.fulfilled, (state, action) => {
                state.isLoading = false;
                state.gigs.unshift(action.payload);
                state.myGigs.unshift(action.payload);
            })
            .addCase(createGig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get my gigs
            .addCase(getMyGigs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMyGigs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myGigs = action.payload;
            })
            .addCase(getMyGigs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearCurrentGig } = gigsSlice.actions;
export default gigsSlice.reducer;
