const socketIo = require('socket.io');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // Allow all for now, or match frontend URL
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        // Basic auth middleware for socket
        if (socket.handshake.query && socket.handshake.query.token) {
            // Support token in query for cleaner client side connection sometimes, but header/auth is better.
            // Let's stick to auth object as planned or allow both.
        }

        if (socket.handshake.auth && socket.handshake.auth.token) {
            try {
                const token = socket.handshake.auth.token;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = await User.findById(decoded.id).select('-password');
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('joinProject', (projectId) => {
            socket.join(projectId);
            console.log(`User ${socket.user.name} joined project ${projectId}`);
        });

        socket.on('sendMessage', async ({ projectId, content }) => {
            try {
                const message = await Message.create({
                    content,
                    sender: socket.user._id,
                    project: projectId
                });

                // Populate sender info for the client
                await message.populate('sender', 'name avatar email');

                io.to(projectId).emit('newMessage', message);
            } catch (error) {
                console.error('Message error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = initSocket;
