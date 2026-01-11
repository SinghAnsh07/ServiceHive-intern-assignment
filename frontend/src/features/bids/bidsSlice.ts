import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bids';

axios.defaults.withCredentials = true;

// Create bid
export const createBid = createAsyncThunk(
    'bids/create',
    async (bidData: { gigId: string; message: string; price: number }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_URL, bidData);
            return response.data.bid;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create bid');
        }
    }
);

// Get bids for a gig (owner only)
export const getBidsForGig = createAsyncThunk(
    'bids/getForGig',
    async (gigId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/${gigId}`);
            return response.data.bids;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bids');
        }
    }
);

// Get my bids
export const getMyBids = createAsyncThunk(
    'bids/getMy',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/my-bids`);
            return response.data.bids;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your bids');
        }
    }
);

// Hire a freelancer
export const hireBid = createAsyncThunk(
    'bids/hire',
    async (bidId: string, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_URL}/${bidId}/hire`);
            return response.data.bid;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to hire freelancer');
        }
    }
);

interface Bid {
    _id: string;
    gigId: string;
    freelancerId: {
        _id: string;
        name: string;
        email: string;
    };
    price: number;
    message: string;
    status: 'pending' | 'hired' | 'rejected';
    createdAt: string;
}

interface BidsState {
    bids: Bid[];
    myBids: Bid[];
    gigBids: Bid[];
    isLoading: boolean;
    error: any;
}

const initialState: BidsState = {
    bids: [],
    myBids: [],
    gigBids: [],
    isLoading: false,
    error: null,
};

const bidsSlice = createSlice({
    name: 'bids',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearGigBids: (state) => {
            state.gigBids = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Create bid
            .addCase(createBid.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBid.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myBids.unshift(action.payload);
            })
            .addCase(createBid.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get bids for gig
            .addCase(getBidsForGig.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBidsForGig.fulfilled, (state, action) => {
                state.isLoading = false;
                state.gigBids = action.payload;
            })
            .addCase(getBidsForGig.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get my bids
            .addCase(getMyBids.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMyBids.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myBids = action.payload;
            })
            .addCase(getMyBids.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Hire bid
            .addCase(hireBid.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(hireBid.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the bid in gigBids
                const index = state.gigBids.findIndex(bid => bid._id === action.payload._id);
                if (index !== -1) {
                    state.gigBids[index] = action.payload;
                }
            })
            .addCase(hireBid.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearGigBids } = bidsSlice.actions;
export default bidsSlice.reducer;
