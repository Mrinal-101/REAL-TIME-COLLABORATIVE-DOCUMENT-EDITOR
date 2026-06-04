const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-editor';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    console.log('Make sure MongoDB is running, or set MONGODB_URI in .env for a cloud instance');
});

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB error:', err));
db.on('disconnected', () => console.log('MongoDB disconnected'));
db.on('reconnected', () => console.log('MongoDB reconnected'));

// Schema
const documentSchema = new mongoose.Schema({
    documentId: { type: String, unique: true, required: true, index: true },
    title: { type: String, default: 'Untitled Document', maxlength: 200 },
    content: { type: String, default: '<p>Start typing your document here...</p>' },
    lastModified: { type: Date, default: Date.now },
    collaborators: [{ username: String, color: String, joinedAt: Date }],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

// active session tracking
const documentUsers = new Map();
const userSockets = new Map();

const generateDocumentId = () =>
    'doc_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);

async function getOrCreateDocument(docId, title = 'Untitled Document') {
    let doc = await Document.findOne({ documentId: docId });

    if (!doc) {
        doc = await Document.create({
            documentId: docId,
            title,
            content: '<p>Start typing your document here...</p>',
            lastModified: new Date(),
            collaborators: []
        });
        console.log(`📝 Created new document: ${docId}`);
    }

    return doc;
}

async function updateDocumentContent(docId, content) {
    return Document.findOneAndUpdate(
        { documentId: docId },
        { content, lastModified: new Date() },
        { new: true }
    );
}

async function updateDocumentTitle(docId, title) {
    return Document.findOneAndUpdate(
        { documentId: docId },
        { title, lastModified: new Date() },
        { new: true }
    );
}

// seed a demo doc on startup so new users have something to try
async function initializeDemoDocument() {
    const demoId = 'demo-doc';
    const exists = await Document.findOne({ documentId: demoId });
    if (exists) return;

    await Document.create({
        documentId: demoId,
        title: 'Welcome Document',
        content: `<p><strong>Welcome to the collaborative editor!</strong></p>
<p>This document demonstrates real-time collaboration features:</p>
<ul>
<li><strong>Real-time editing</strong> - See changes as others type</li>
<li><strong>User presence</strong> - Know who's online</li>
<li><strong>Rich formatting</strong> - Bold, italic, colors, and more</li>
<li><strong>MongoDB storage</strong> - Documents persist across restarts</li>
</ul>
<p>Try opening this in multiple tabs to see it in action!</p>`,
        lastModified: new Date(),
        collaborators: []
    });

    console.log('📝 Demo document created');
}

// helper to shape doc responses consistently
const formatDoc = (doc) => ({
    id: doc.documentId,
    title: doc.title,
    content: doc.content,
    lastModified: doc.lastModified,
    collaborators: doc.collaborators
});

// REST API
app.get('/api/documents', async (req, res) => {
    try {
        const docs = await Document.find({})
            .select('documentId title lastModified createdAt')
            .sort({ lastModified: -1 })
            .limit(50);

        res.json({
            success: true,
            documents: docs.map(d => ({
                id: d.documentId,
                title: d.title,
                lastModified: d.lastModified,
                createdAt: d.createdAt
            }))
        });
    } catch (err) {
        console.error('Error fetching documents:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch documents' });
    }
});

app.get('/api/documents/:id', async (req, res) => {
    try {
        const doc = await getOrCreateDocument(req.params.id);
        res.json({ success: true, document: formatDoc(doc) });
    } catch (err) {
        console.error('Error fetching document:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch document' });
    }
});

app.post('/api/documents', async (req, res) => {
    try {
        const doc = await getOrCreateDocument(generateDocumentId(), req.body.title);
        res.json({ success: true, document: formatDoc(doc) });
    } catch (err) {
        console.error('Error creating document:', err);
        res.status(500).json({ success: false, error: 'Failed to create document' });
    }
});

app.put('/api/documents/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        const docId = req.params.id;
        let doc;

        if (title && content) {
            doc = await Document.findOneAndUpdate(
                { documentId: docId },
                { title, content, lastModified: new Date() },
                { new: true }
            );
        } else if (title) {
            doc = await updateDocumentTitle(docId, title);
        } else if (content) {
            doc = await updateDocumentContent(docId, content);
        }

        if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });

        res.json({ success: true, document: formatDoc(doc) });
    } catch (err) {
        console.error('Error updating document:', err);
        res.status(500).json({ success: false, error: 'Failed to update document' });
    }
});

// Socket.IO
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    socket.on('join-document', async ({ documentId, user }) => {
        try {
            userSockets.set(socket.id, { ...user, socketId: socket.id, documentId });
            socket.join(documentId);

            if (!documentUsers.has(documentId)) documentUsers.set(documentId, new Map());
            documentUsers.get(documentId).set(socket.id, user);

            const doc = await getOrCreateDocument(documentId);
            const users = Array.from(documentUsers.get(documentId).values());

            socket.emit('document-loaded', {
                document: {
                    id: doc.documentId,
                    title: doc.title,
                    content: doc.content,
                    lastModified: doc.lastModified
                },
                users
            });

            socket.to(documentId).emit('user-joined', { user, users });
            console.log(`👤 ${user.username} joined ${documentId} (${documentUsers.get(documentId).size} online)`);
        } catch (err) {
            console.error('Error in join-document:', err);
            socket.emit('error', { message: 'Failed to join document' });
        }
    });

    socket.on('text-change', async ({ documentId, content, user }) => {
        try {
            const userInfo = userSockets.get(socket.id);
            if (!userInfo || userInfo.documentId !== documentId) return;

            await updateDocumentContent(documentId, content);
            socket.to(documentId).emit('text-updated', {
                content,
                user,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error in text-change:', err);
        }
    });

    socket.on('title-change', async ({ documentId, title, user }) => {
        try {
            const userInfo = userSockets.get(socket.id);
            if (!userInfo || userInfo.documentId !== documentId) return;

            await updateDocumentTitle(documentId, title);
            socket.to(documentId).emit('title-updated', { title, user });
            console.log(`📝 Title updated in ${documentId} by ${user.username}: "${title}"`);
        } catch (err) {
            console.error('Error in title-change:', err);
        }
    });

    socket.on('cursor-position', ({ documentId, position, user }) => {
        try {
            const userInfo = userSockets.get(socket.id);
            if (!userInfo || userInfo.documentId !== documentId) return;
            socket.to(documentId).emit('cursor-moved', { user, position });
        } catch (err) {
            console.error('Error in cursor-position:', err);
        }
    });

    socket.on('user-typing', ({ documentId, isTyping, user }) => {
        try {
            const userInfo = userSockets.get(socket.id);
            if (!userInfo || userInfo.documentId !== documentId) return;
            socket.to(documentId).emit('typing-indicator', { user, isTyping });
        } catch (err) {
            console.error('Error in user-typing:', err);
        }
    });

    socket.on('format-text', ({ documentId, formatType, formatValue, user }) => {
        try {
            const userInfo = userSockets.get(socket.id);
            if (!userInfo || userInfo.documentId !== documentId) return;
            socket.to(documentId).emit('format-applied', { formatType, formatValue, user });
        } catch (err) {
            console.error('Error in format-text:', err);
        }
    });

    const handleLeave = (docId) => {
        const userInfo = userSockets.get(socket.id);
        if (!userInfo || userInfo.documentId !== docId) return;

        if (documentUsers.has(docId)) {
            documentUsers.get(docId).delete(socket.id);
            const users = Array.from(documentUsers.get(docId).values());
            socket.to(docId).emit('user-left', { user: userInfo, users });
        }

        console.log(`👋 ${userInfo.username} left ${docId}`);
    };

    socket.on('leave-document', ({ documentId }) => {
        try {
            handleLeave(documentId);
            socket.leave(documentId);
        } catch (err) {
            console.error('Error in leave-document:', err);
        }
    });

    socket.on('disconnect', () => {
        try {
            const userInfo = userSockets.get(socket.id);
            if (userInfo) {
                handleLeave(userInfo.documentId);
                userSockets.delete(socket.id);
            }
            console.log('🔌 Client disconnected:', socket.id);
        } catch (err) {
            console.error('Error in disconnect:', err);
        }
    });
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
}

initializeDemoDocument();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`MongoDB: ${MONGODB_URI}`);
    console.log(`Demo doc ID: "demo-doc"`);
});

// graceful shutdown for both SIGTERM (container stop) and SIGINT (ctrl+c)
const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    mongoose.connection.close(() => {
        server.close(() => process.exit(0));
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
