import Gig from '../models/Gig.js';

// @desc    Get all open gigs (with optional search)
// @route   GET /api/gigs
// @access  Public
export const getGigs = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { status: 'open' };

        // Add text search if search query provided
        if (search) {
            query.$text = { $search: search };
        }

        const gigs = await Gig.find(query)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            gigs
        });
    } catch (error) {
        console.error('Get gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching gigs'
        });
    }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
export const getGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id)
            .populate('ownerId', 'name email');

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        res.json({
            success: true,
            gig
        });
    } catch (error) {
        console.error('Get gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching gig'
        });
    }
};

// @desc    Create new gig
// @route   POST /api/gigs
// @access  Private
export const createGig = async (req, res) => {
    try {
        const { title, description, budget } = req.body;

        // Validation
        if (!title || !description || !budget) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields'
            });
        }

        const gig = await Gig.create({
            title,
            description,
            budget,
            ownerId: req.user._id
        });

        const populatedGig = await Gig.findById(gig._id)
            .populate('ownerId', 'name email');

        res.status(201).json({
            success: true,
            gig: populatedGig
        });
    } catch (error) {
        console.error('Create gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating gig'
        });
    }
};

// @desc    Get user's posted gigs
// @route   GET /api/gigs/my-gigs
// @access  Private
export const getMyGigs = async (req, res) => {
    try {
        const gigs = await Gig.find({ ownerId: req.user._id })
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            gigs
        });
    } catch (error) {
        console.error('Get my gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching your gigs'
        });
    }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private
export const updateGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

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
                message: 'Not authorized to update this gig'
            });
        }

        const { title, description, budget } = req.body;

        gig.title = title || gig.title;
        gig.description = description || gig.description;
        gig.budget = budget || gig.budget;

        const updatedGig = await gig.save();
        const populatedGig = await Gig.findById(updatedGig._id)
            .populate('ownerId', 'name email');

        res.json({
            success: true,
            gig: populatedGig
        });
    } catch (error) {
        console.error('Update gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating gig'
        });
    }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private
export const deleteGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

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
                message: 'Not authorized to delete this gig'
            });
        }

        await gig.deleteOne();

        res.json({
            success: true,
            message: 'Gig deleted successfully'
        });
    } catch (error) {
        console.error('Delete gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting gig'
        });
    }
};
