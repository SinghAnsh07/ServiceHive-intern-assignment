import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },
    status: {
        type: String,
        enum: ['pending', 'hired', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate bids from same freelancer on same gig
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
