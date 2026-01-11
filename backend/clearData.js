import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Gig from './models/Gig.js';
import Bid from './models/Bid.js';

dotenv.config();

const clearData = async () => {
    try {
        await connectDB();

        console.log('Clearing all data...');

        await User.deleteMany({});
        console.log('Users cleared.');

        await Gig.deleteMany({});
        console.log('Gigs cleared.');

        await Bid.deleteMany({});
        console.log('Bids cleared.');

        console.log('Data cleared successfully!');
        process.exit();
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
