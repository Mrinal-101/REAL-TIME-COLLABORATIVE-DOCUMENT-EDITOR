/**
 * Real-Time Collaborative Document Editor - Backend Server with MongoDB
 * Using Node.js, Express, Socket.IO and MongoDB with Mongoose
 * 
 * This is beginner-friendly code designed for CS students learning full-stack development
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Express app and create HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // React app URL
        methods: ["GET", "POST"]
    }
});

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Make sure MongoDB is running on your system');
    console.log('💡 Or update MONGODB_URI in .env file for cloud MongoDB');
});

// Handle MongoDB connection events
const db = mongoose.connection;
db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
db.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// Document Schema Definition
const { Schema } = mongoose;

const documentSchema = new Schema({
    documentId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'Untitled Document',
        maxlength: 200
    },
    content: {
        type: String,
        default: '<p>Start typing your document here...</p>'
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    collaborators: [{
        username: String,
        color: String,
        joinedAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Create Document model
const Document = mongoose.model('Document', documentSchema);

// In-memory user tracking (for active sessions)
let documentUsers = new Map(); // Track users currently in each document
let userSockets = new Map(); // Track socket connections

/**
 * Helper function to generate unique document IDs
 */
function generateDocumentId() {
    return 'doc_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Helper function to get or create a document in MongoDB
 */
async function getOrCreateDocument(docId, title = 'Untitled Document') {
    try {
        // Try to find existing document
        let document = await Document.findOne({ documentId: docId });

        if (!document) {
            // Create new document if it doesn't exist
            document = new Document({
                documentId: docId,
                title: title,
                content: '<p>Start typing your document here...</p>',
                lastModified: new Date(),
                collaborators: []
            });

            await document.save();
            console.log(`📝 Created new document: ${docId}`);
        } else {
            console.log(`📄 Found existing document: ${docId}`);
        }

        return document;
    } catch (error) {
        console.error('Error getting/creating document:', error);
        throw error;
    }
}

/**
 * Helper function to update document content in MongoDB
 */
async function updateDocumentContent(docId, content) {
    try {
        const result = await Document.findOneAndUpdate(
            { documentId: docId },
            { 
                content: content, 
                lastModified: new Date() 
            },
            { new: true } // Return updated document
        );

        if (result) {
            console.log(`💾 Saved document: ${docId}`);
        }

        return result;
    } catch (error) {
        console.error('Error updating document content:', error);
        throw error;
    }
}

/**
 * Helper function to update document title in MongoDB
 */
async function updateDocumentTitle(docId, title) {
    try {
        const result = await Document.findOneAndUpdate(
            { documentId: docId },
            { 
                title: title, 
                lastModified: new Date() 
            },
            { new: true }
        );

        return result;
    } catch (error) {
        console.error('Error updating document title:', error);
        throw error;
    }
}

/**
 * Initialize demo document on server start
 */
async function initializeDemoDocument() {
    try {
        const demoId = 'demo-doc';
        let demoDoc = await Document.findOne({ documentId: demoId });

        if (!demoDoc) {
            demoDoc = new Document({
                documentId: demoId,
                title: 'Welcome Document',
                content: `<p><strong>Welcome to our collaborative text editor!</strong></p>
<p>This document demonstrates real-time collaboration features:</p>
<ul>
<li><strong>Real-time editing</strong> - See changes as others type</li>
<li><strong>User presence</strong> - Know who's online</li>
<li><strong>Rich formatting</strong> - Bold, italic, colors, and more</li>
<li><strong>MongoDB storage</strong> - Your documents are saved in the database</li>
<li><strong>Auto-save</strong> - Your work is automatically saved</li>
</ul>
<p>Try opening this same document in multiple browser tabs to see the collaboration in action!</p>
<p><em>This document is stored in MongoDB and persists across server restarts.</em></p>`,
                lastModified: new Date(),
                collaborators: []
            });

            await demoDoc.save();
            console.log('📝 Created demo document in MongoDB');
        } else {
            console.log('📄 Demo document already exists in MongoDB');
        }
    } catch (error) {
        console.error('Error initializing demo document:', error);
    }
}

/**
 * API Routes for document management
 */

// Get a specific document
app.get('/api/documents/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        const document = await getOrCreateDocument(docId);

        res.json({
            success: true,
            document: {
                id: document.documentId,
                title: document.title,
                content: document.content,
                lastModified: document.lastModified,
                collaborators: document.collaborators
            }
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch document'
        });
    }
});

// Create a new document
app.post('/api/documents', async (req, res) => {
    try {
        const { title } = req.body;
        const docId = generateDocumentId();
        const document = await getOrCreateDocument(docId, title || 'Untitled Document');

        res.json({
            success: true,
            document: {
                id: document.documentId,
                title: document.title,
                content: document.content,
                lastModified: document.lastModified,
                collaborators: document.collaborators
            }
        });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create document'
        });
    }
});

// Update document content
app.put('/api/documents/:id', async (req, res) => {
    try {
        const docId = req.params.id;
        const { title, content } = req.body;

        let document;

        if (title && content) {
            // Update both title and content
            document = await Document.findOneAndUpdate(
                { documentId: docId },
                { 
                    title: title,
                    content: content, 
                    lastModified: new Date() 
                },
                { new: true }
            );
        } else if (title) {
            // Update only title
            document = await updateDocumentTitle(docId, title);
        } else if (content) {
            // Update only content
            document = await updateDocumentContent(docId, content);
        }

        if (document) {
            res.json({
                success: true,
                document: {
                    id: document.documentId,
                    title: document.title,
                    content: document.content,
                    lastModified: document.lastModified,
                    collaborators: document.collaborators
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update document'
        });
    }
});

// Get all documents (for listing)
app.get('/api/documents', async (req, res) => {
    try {
        const documents = await Document.find({})
            .select('documentId title lastModified createdAt')
            .sort({ lastModified: -1 })
            .limit(50); // Limit to 50 most recent documents

        const documentList = documents.map(doc => ({
            id: doc.documentId,
            title: doc.title,
            lastModified: doc.lastModified,
            createdAt: doc.createdAt
        }));

        res.json({
            success: true,
            documents: documentList
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch documents'
        });
    }
});

/**
 * Socket.IO event handlers for real-time collaboration
 */
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    /**
     * Handle user joining a document room
     */
    socket.on('join-document', async (data) => {
        try {
            const { documentId, user } = data;
            console.log(`👤 User ${user.username} joining document: ${documentId}`);

            // Store user information
            userSockets.set(socket.id, {
                ...user,
                socketId: socket.id,
                documentId: documentId
            });

            // Join the document room
            socket.join(documentId);

            // Add user to document's user list
            if (!documentUsers.has(documentId)) {
                documentUsers.set(documentId, new Map());
            }
            documentUsers.get(documentId).set(socket.id, user);

            // Get the document from MongoDB
            const document = await getOrCreateDocument(documentId);

            // Send current document state to the joining user
            socket.emit('document-loaded', {
                document: {
                    id: document.documentId,
                    title: document.title,
                    content: document.content,
                    lastModified: document.lastModified
                },
                users: Array.from(documentUsers.get(documentId).values())
            });

            // Notify other users in the room about the new user
            socket.to(documentId).emit('user-joined', {
                user: user,
                users: Array.from(documentUsers.get(documentId).values())
            });

            console.log(`👥 Users in document ${documentId}:`, documentUsers.get(documentId).size);

        } catch (error) {
            console.error('❌ Error in join-document:', error);
            socket.emit('error', { message: 'Failed to join document' });
        }
    });

    /**
     * Handle real-time text changes
     */
    socket.on('text-change', async (data) => {
        try {
            const { documentId, content, user } = data;
            const userInfo = userSockets.get(socket.id);

            if (userInfo && userInfo.documentId === documentId) {
                // Update document in MongoDB
                await updateDocumentContent(documentId, content);

                // Broadcast the change to all other users in the room
                socket.to(documentId).emit('text-updated', {
                    content: content,
                    user: user,
                    timestamp: new Date().toISOString()
                });

                console.log(`✏️  Text change in document ${documentId} by ${user.username}`);
            }
        } catch (error) {
            console.error('❌ Error in text-change:', error);
        }
    });

    /**
     * Handle cursor position updates
     */
    socket.on('cursor-position', (data) => {
        try {
            const { documentId, position, user } = data;
            const userInfo = userSockets.get(socket.id);

            if (userInfo && userInfo.documentId === documentId) {
                // Broadcast cursor position to other users in the room
                socket.to(documentId).emit('cursor-moved', {
                    user: user,
                    position: position
                });
            }
        } catch (error) {
            console.error('❌ Error in cursor-position:', error);
        }
    });

    /**
     * Handle typing indicators
     */
    socket.on('user-typing', (data) => {
        try {
            const { documentId, isTyping, user } = data;
            const userInfo = userSockets.get(socket.id);

            if (userInfo && userInfo.documentId === documentId) {
                // Broadcast typing status to other users in the room
                socket.to(documentId).emit('typing-indicator', {
                    user: user,
                    isTyping: isTyping
                });
            }
        } catch (error) {
            console.error('❌ Error in user-typing:', error);
        }
    });

    /**
     * Handle text formatting changes
     */
    socket.on('format-text', (data) => {
        try {
            const { documentId, formatType, formatValue, user } = data;
            const userInfo = userSockets.get(socket.id);

            if (userInfo && userInfo.documentId === documentId) {
                // Broadcast format change to other users in the room
                socket.to(documentId).emit('format-applied', {
                    formatType: formatType,
                    formatValue: formatValue,
                    user: user
                });
            }
        } catch (error) {
            console.error('❌ Error in format-text:', error);
        }
    });

    /**
     * Handle document title changes
     */
    socket.on('title-change', async (data) => {
        try {
            const { documentId, title, user } = data;
            const userInfo = userSockets.get(socket.id);

            if (userInfo && userInfo.documentId === documentId) {
                // Update document title in MongoDB
                await updateDocumentTitle(documentId, title);

                // Broadcast title change to other users in the room
                socket.to(documentId).emit('title-updated', {
                    title: title,
                    user: user
                });

                console.log(`📝 Title changed in document ${documentId} by ${user.username}: "${title}"`);
            }
        } catch (error) {
            console.error('❌ Error in title-change:', error);
        }
    });

    /**
     * Handle user disconnection
     */
    socket.on('disconnect', () => {
        try {
            console.log('🔌 Client disconnected:', socket.id);

            const userInfo = userSockets.get(socket.id);
            if (userInfo) {
                const { documentId, username } = userInfo;

                // Remove user from document's user list
                if (documentUsers.has(documentId)) {
                    documentUsers.get(documentId).delete(socket.id);

                    // Notify other users in the room about user leaving
                    socket.to(documentId).emit('user-left', {
                        user: userInfo,
                        users: Array.from(documentUsers.get(documentId).values())
                    });
                }

                // Clean up user socket reference
                userSockets.delete(socket.id);

                console.log(`👋 User ${username} left document: ${documentId}`);
            }
        } catch (error) {
            console.error('❌ Error in disconnect:', error);
        }
    });

    /**
     * Handle explicit document leave
     */
    socket.on('leave-document', (data) => {
        try {
            const { documentId } = data;
            const userInfo = userSockets.get(socket.id);

            if (userInfo && userInfo.documentId === documentId) {
                // Leave the socket room
                socket.leave(documentId);

                // Remove user from document's user list
                if (documentUsers.has(documentId)) {
                    documentUsers.get(documentId).delete(socket.id);

                    // Notify other users in the room
                    socket.to(documentId).emit('user-left', {
                        user: userInfo,
                        users: Array.from(documentUsers.get(documentId).values())
                    });
                }

                console.log(`👋 User ${userInfo.username} left document: ${documentId}`);
            }
        } catch (error) {
            console.error('❌ Error in leave-document:', error);
        }
    });
});

/**
 * Serve the React app in production
 */
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

// Initialize demo document when server starts
initializeDemoDocument();

// Start the server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Collaborative Editor Server running on port ${PORT}`);
    console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
    console.log(`📝 MongoDB Database: ${MONGODB_URI}`);
    console.log(`💡 Demo document available at ID: "demo-doc"`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');

    // Close MongoDB connection
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');

        // Close server
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');

    // Close MongoDB connection
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');

        // Close server
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});
