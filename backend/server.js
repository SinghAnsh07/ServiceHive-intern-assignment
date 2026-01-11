import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import bidRoutes from './routes/bidRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'GigFlow API is running' });
});

// Socket.io connection handling
const userSockets = new Map(); // Map userId to socketId

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        // Remove user from map
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

// Export function to emit notifications
export const emitNotification = (userId, notification) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        io.to(socketId).emit('notification', notification);
        console.log(`Notification sent to user ${userId}:`, notification);
    }
};

// Make emitNotification available globally
global.emitNotification = emitNotification;

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
