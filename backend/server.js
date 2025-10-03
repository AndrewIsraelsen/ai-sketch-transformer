const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const shareRoutes = require('./routes/share');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('../frontend'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/share', shareRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-sketch-studio', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// WebSocket for real-time collaboration
const activeRooms = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a project room
    socket.on('join-project', (projectId) => {
        socket.join(projectId);

        if (!activeRooms.has(projectId)) {
            activeRooms.set(projectId, new Set());
        }
        activeRooms.get(projectId).add(socket.id);

        // Notify others in the room
        socket.to(projectId).emit('user-joined', {
            userId: socket.id,
            userCount: activeRooms.get(projectId).size
        });

        // Send current user count
        socket.emit('room-users', {
            userCount: activeRooms.get(projectId).size
        });
    });

    // Handle drawing events
    socket.on('draw', (data) => {
        socket.to(data.projectId).emit('draw', data);
    });

    // Handle layer updates
    socket.on('layer-update', (data) => {
        socket.to(data.projectId).emit('layer-update', data);
    });

    // Handle tool changes
    socket.on('tool-change', (data) => {
        socket.to(data.projectId).emit('tool-change', data);
    });

    // Handle canvas clear
    socket.on('clear-canvas', (data) => {
        socket.to(data.projectId).emit('clear-canvas', data);
    });

    // Handle AI effect application
    socket.on('apply-effect', (data) => {
        socket.to(data.projectId).emit('apply-effect', data);
    });

    // Handle cursor position
    socket.on('cursor-move', (data) => {
        socket.to(data.projectId).emit('cursor-move', {
            userId: socket.id,
            x: data.x,
            y: data.y
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Remove from all rooms
        for (const [projectId, users] of activeRooms.entries()) {
            if (users.has(socket.id)) {
                users.delete(socket.id);
                socket.to(projectId).emit('user-left', {
                    userId: socket.id,
                    userCount: users.size
                });

                // Clean up empty rooms
                if (users.size === 0) {
                    activeRooms.delete(projectId);
                }
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
