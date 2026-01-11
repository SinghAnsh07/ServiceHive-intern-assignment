import express from 'express';
import {
    getGigs,
    getGig,
    createGig,
    getMyGigs,
    updateGig,
    deleteGig
} from '../controllers/gigController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGigs);
router.get('/my-gigs', protect, getMyGigs);
router.get('/:id', getGig);
router.post('/', protect, createGig);
router.put('/:id', protect, updateGig);
router.delete('/:id', protect, deleteGig);

export default router;
