import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';

// @desc    Submit a bid for a gig
// @route   POST /api/bids
// @access  Private
export const createBid = async (req, res) => {
    try {
        const { gigId, message, price } = req.body;

        // Validation
        if (!gigId || !message || !price) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields'
            });
        }

        // Check if gig exists and is open
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        if (gig.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This gig is no longer accepting bids'
            });
        }

        // Check if user is trying to bid on their own gig
        if (gig.ownerId.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot bid on your own gig'
            });
        }

        // Create bid
        const bid = await Bid.create({
            gigId,
            freelancerId: req.user._id,
            message,
            price
        });

        const populatedBid = await Bid.findById(bid._id)
            .populate('freelancerId', 'name email')
            .populate('gigId', 'title budget');

        res.status(201).json({
            success: true,
            bid: populatedBid
        });
    } catch (error) {
        console.error('Create bid error:', error);

        // Handle duplicate bid error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a bid for this gig'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating bid'
        });
    }
};

// @desc    Get all bids for a specific gig (Owner only)
// @route   GET /api/bids/:gigId
// @access  Private
export const getBidsForGig = async (req, res) => {
    try {
        const { gigId } = req.params;

        // Check if gig exists
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        // Check if user is the owner
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view bids for this gig'
            });
        }

        const bids = await Bid.find({ gigId })
            .populate('freelancerId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bids
        });
    } catch (error) {
        console.error('Get bids error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching bids'
        });
    }
};

// @desc    Get user's submitted bids
// @route   GET /api/bids/my-bids
// @access  Private
export const getMyBids = async (req, res) => {
    try {
        const bids = await Bid.find({ freelancerId: req.user._id })
            .populate('gigId', 'title budget status')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bids
        });
    } catch (error) {
        console.error('Get my bids error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching your bids'
        });
    }
};

// @desc    Hire a freelancer (The critical hiring logic with transaction)
// @route   PATCH /api/bids/:bidId/hire
// @access  Private
export const hireBid = async (req, res) => {
    try {
        const { bidId } = req.params;

        // Find the bid
        const bid = await Bid.findById(bidId).populate('gigId');

        if (!bid) {
            return res.status(404).json({
                success: false,
                message: 'Bid not found'
            });
        }

        const gig = bid.gigId;

        // Check if user is the gig owner
        if (gig.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to hire for this gig'
            });
        }

        // Check if gig is still open (prevent race condition)
        if (gig.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This gig has already been assigned'
            });
        }

        // OPERATIONS (Sequential instead of transactional for standalone DB support):

        // 1. Update the gig status to 'assigned'
        await Gig.findByIdAndUpdate(gig._id, { status: 'assigned' });

        // 2. Update the selected bid to 'hired'
        await Bid.findByIdAndUpdate(bidId, { status: 'hired' });

        // 3. Update all other bids for this gig to 'rejected'
        await Bid.updateMany(
            {
                gigId: gig._id,
                _id: { $ne: bidId },
                status: 'pending'
            },
            { status: 'rejected' }
        );

        // Get the updated bid with populated data
        const updatedBid = await Bid.findById(bidId)
            .populate('freelancerId', 'name email')
            .populate('gigId', 'title budget status');

        // Send real-time notification to the hired freelancer
        if (global.emitNotification) {
            global.emitNotification(updatedBid.freelancerId._id.toString(), {
                type: 'hired',
                message: `You have been hired for "${updatedBid.gigId.title}"!`,
                gigId: updatedBid.gigId._id,
                gigTitle: updatedBid.gigId.title,
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            message: 'Freelancer hired successfully',
            bid: updatedBid
        });
    } catch (error) {
        console.error('Hire bid error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during hiring process'
        });
    }
};

// @desc    Update a bid
// @route   PUT /api/bids/:bidId
// @access  Private
export const updateBid = async (req, res) => {
    try {
        const { bidId } = req.params;
        const { message, price } = req.body;

        const bid = await Bid.findById(bidId);

        if (!bid) {
            return res.status(404).json({
                success: false,
                message: 'Bid not found'
            });
        }

        // Check if user is the bid owner
        if (bid.freelancerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this bid'
            });
        }

        // Can only update pending bids
        if (bid.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update a bid that has been processed'
            });
        }

        bid.message = message || bid.message;
        bid.price = price || bid.price;

        const updatedBid = await bid.save();
        const populatedBid = await Bid.findById(updatedBid._id)
            .populate('freelancerId', 'name email')
            .populate('gigId', 'title budget');

        res.json({
            success: true,
            bid: populatedBid
        });
    } catch (error) {
        console.error('Update bid error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating bid'
        });
    }
};

// @desc    Delete a bid
// @route   DELETE /api/bids/:bidId
// @access  Private
export const deleteBid = async (req, res) => {
    try {
        const { bidId } = req.params;

        const bid = await Bid.findById(bidId);

        if (!bid) {
            return res.status(404).json({
                success: false,
                message: 'Bid not found'
            });
        }

        // Check if user is the bid owner
        if (bid.freelancerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this bid'
            });
        }

        // Can only delete pending bids
        if (bid.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a bid that has been processed'
            });
        }

        await bid.deleteOne();

        res.json({
            success: true,
            message: 'Bid deleted successfully'
        });
    } catch (error) {
        console.error('Delete bid error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting bid'
        });
    }
};
