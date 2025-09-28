# Real-Time Collaborative Text Editor with MongoDB

A full-stack collaborative text editor built with React.js, Node.js, Express, Socket.IO, and **MongoDB**. This project demonstrates real-time collaboration features similar to Google Docs, with **persistent data storage** using MongoDB, designed for computer science students learning full-stack development.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (see [MongoDB Setup Guide](#-mongodb-setup))
- **npm** (comes with Node.js)

### Installation & Setup

1. **Extract the project**
   ```bash
   cd collaborative-text-editor-mongodb
   ```

2. **Setup MongoDB**:

   **Local MongoDB**
   - Install MongoDB locally (see [MongoDB Setup](#-mongodb-setup))
   - MongoDB will run on `mongodb://localhost:27017`


3. **Start the Backend Server**
   ```bash
   cd backend
   npm install

   # Copy environment file and configure if needed
   cp .env.example .env

   # Start server
   npm start
   ```

   The backend server will start on http://localhost:5000

4. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm install
   npm start
   ```

   The React app will start on http://localhost:3000

### Testing Real-Time Collaboration

1. Open multiple browser tabs/windows to http://localhost:3000
2. Enter different usernames in each tab
3. Choose the same document ID (try "demo-doc" or leave empty for new document)
4. Start typing in one tab - see changes appear in real-time in other tabs!
5. **Data persists** - refresh the page and your document will still be there!

## 🗄️ MongoDB Setup

Local MongoDB Installation

#### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service
4. Default connection: `mongodb://localhost:27017`



## 🎯 Features

### ✅ Real-Time Collaboration
- **Multiple users** can edit the same document simultaneously
- **Live text synchronization** using WebSocket connections
- **User presence indicators** showing who's online and typing
- **Typing indicators** to see when others are actively editing

### ✅ MongoDB Persistent Storage
- **Documents saved to MongoDB** - survive server restarts
- **Auto-save functionality** - changes are automatically saved to database
- **Document versioning** - track when documents were last modified
- **Scalable storage** - handles multiple documents and users

### ✅ Rich Text Editing
- **Bold, italic, underline** formatting
- **Font size** and **color** selection
- **Bullet and numbered lists**
- **Text alignment** (left, center, right)
- **Background colors** for highlighting
- **Keyboard shortcuts** (Ctrl+B, Ctrl+I, Ctrl+U)

### ✅ Document Management
- **Create new documents** with unique IDs
- **Join existing documents** by ID
- **Share documents** via URL or document ID
- **Document titles** that sync across all users
- **Demo document** available (ID: "demo-doc")

### ✅ Enhanced User Experience
- **Connection status** indicators
- **Last saved** timestamps
- **User avatars** with unique colors
- **Responsive design** - works on desktop and mobile
- **Error handling** and reconnection
- **Clean, professional interface**

## 🏗️ Project Structure

```
collaborative-text-editor-mongodb/
├── backend/                        # Node.js + Express + Socket.IO + MongoDB server
│   ├── server.js                  # Main server file with MongoDB integration
│   ├── package.json               # Backend dependencies (includes Mongoose)
│   ├── .env.example              # Environment variables template
│   ├── MONGODB_SETUP.md          # Detailed MongoDB setup instructions
│   └── README.md                 # Backend documentation
├── frontend/                      # React.js client application
│   ├── public/
│   │   └── index.html            # HTML template
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── LoginForm.js      # User authentication with MongoDB features
│   │   │   ├── Editor.js         # Rich text editor with auto-save
│   │   │   ├── UserList.js       # Online users sidebar
│   │   │   └── Toolbar.js        # Enhanced formatting toolbar
│   │   ├── App.js               # Main React application with MongoDB integration
│   │   ├── App.css              # Enhanced styling with MongoDB theme
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Base styles
│   └── package.json             # Frontend dependencies
├── README.md                     # This file
└── .gitignore                   # Git ignore file
```

## 🔧 Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time WebSocket communication
- **MongoDB** - NoSQL database for document storage
- **Mongoose** - MongoDB object modeling for Node.js
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React.js** - User interface library
- **Socket.IO Client** - WebSocket client
- **Enhanced CSS** - Modern styling with MongoDB theme
- **HTML5 ContentEditable** - Rich text editing

## 📊 Database Schema

### Document Collection
```javascript
{
  _id: ObjectId,
  documentId: String,      // Unique document identifier
  title: String,           // Document title
  content: String,         // HTML content of the document
  lastModified: Date,      // When document was last updated
  collaborators: [{        // Array of collaborators
    username: String,
    color: String,
    joinedAt: Date
  }],
  createdAt: Date,        // When document was created
  updatedAt: Date         // Auto-managed by Mongoose
}
```

## 📚 Learning Objectives

This project teaches computer science students:

1. **Real-time Web Development**
   - WebSocket communication patterns
   - Event-driven programming
   - Client-server architecture

2. **Database Integration**
   - MongoDB setup and configuration
   - Mongoose ODM usage
   - Database schema design
   - Async/await patterns with databases

3. **React.js Advanced Concepts**
   - Component-based architecture
   - State management with hooks
   - Effect handling and lifecycle
   - Props and component communication
   - Error boundaries and error handling

4. **Backend Development**
   - REST API design
   - Socket.IO event handling
   - Express.js middleware
   - Environment configuration
   - Database connection management

5. **Full-Stack Integration**
   - Frontend-backend communication
   - Real-time data synchronization
   - Error handling across the stack
   - Production deployment considerations


## 🚀 API Endpoints

The backend provides these REST API endpoints:

- `GET /api/documents/:id` - Get a specific document by ID
- `POST /api/documents` - Create a new document
- `PUT /api/documents/:id` - Update document content or title
- `GET /api/documents` - Get list of all documents (limited to 50 most recent)

## 🔌 Socket.IO Events

### Client to Server:
- `join-document` - User joins a document room
- `leave-document` - User leaves a document
- `text-change` - Real-time text updates (saved to MongoDB)
- `title-change` - Document title updates (saved to MongoDB)
- `cursor-position` - Share cursor positions
- `user-typing` - Show typing indicators
- `format-text` - Broadcast formatting changes

### Server to Client:
- `document-loaded` - Send document data from MongoDB to new user
- `text-updated` - Broadcast text changes to all users
- `title-updated` - Broadcast title changes
- `user-joined` - Notify when user joins
- `user-left` - Notify when user leaves
- `typing-indicator` - Show typing status
- `cursor-moved` - Update cursor positions
- `format-applied` - Apply formatting changes

## 🛠️ Advanced Features to Add

1. **User Authentication**
   - User registration and login
   - Document ownership and permissions
   - Access control (private/public documents)

2. **Enhanced Collaboration**
   - Real-time cursor positions with user names
   - Comment and suggestion system
   - Document version history
   - Conflict resolution algorithms

3. **Rich Content Features**
   - Image insertion and resizing
   - Tables and advanced formatting
   - Export to PDF/Word formats
   - Import from various file formats

4. **Performance Optimizations**
   - Document caching with Redis
   - Database indexing optimization
   - Real-time conflict resolution
   - Operational transformation algorithms

5. **Deployment & Scaling**
   - Deploy backend to Heroku/Railway/DigitalOcean
   - Deploy frontend to Vercel/Netlify
   - MongoDB Atlas production setup
   - Load balancing for multiple servers

## 🐛 Troubleshooting

### Backend won't start
- Make sure MongoDB is running (local) or connection string is correct (Atlas)
- Check if port 5000 is available
- Run `npm install` in the backend directory
- Check backend console for MongoDB connection errors

### Frontend won't connect
- Ensure backend is running on port 5000
- Check browser console for WebSocket connection errors
- Verify CORS settings in backend
- Check if Socket.IO is properly connecting

### MongoDB connection issues
- **Local MongoDB**: Ensure MongoDB service is running
- **MongoDB Atlas**: Verify connection string, IP whitelist, and credentials
- Check `.env` file configuration
- Look for connection error messages in backend console

### Real-time features not working
- Open browser developer tools and check Network tab
- Look for WebSocket connection in Network tab
- Check backend console for Socket.IO connection logs
- Verify multiple users are using the same document ID

### Documents not persisting
- Check MongoDB connection status in backend console
- Verify database permissions
- Check for error messages when saving documents
- Use MongoDB Compass or similar tool to verify data in database

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/collaborative-editor

# Server Configuration  
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 📱 MongoDB GUI Tools

For visualizing and managing your MongoDB data:

- **MongoDB Compass** (Official): https://www.mongodb.com/products/compass
- **Studio 3T**: https://studio3t.com/
- **Robo 3T**: https://robomongo.org/

## 👨‍💻 Contributing

This is an educational project perfect for:
- Computer science students learning full-stack development
- JavaScript developers exploring real-time features
- Database enthusiasts learning MongoDB integration
- Anyone interested in collaborative editing systems

Feel free to:
- Add new features (user authentication, document versioning, etc.)
- Improve the user interface and user experience  
- Add more comprehensive error handling
- Optimize database queries and performance
- Contribute documentation improvements

## 📝 License

This project is open source and available under the MIT License.

---

**Happy Coding!** 🎉

Built with ❤️ for computer science students learning full-stack development with MongoDB.

### 🎯 What's Different from In-Memory Version?

- ✅ **Persistent Storage**: Documents survive server restarts
- ✅ **Scalable Database**: Handle thousands of documents and users
- ✅ **Real Database Operations**: Learn actual database integration
- ✅ **Production Ready**: Uses industry-standard MongoDB
- ✅ **Enhanced Features**: Better error handling, connection management
- ✅ **Professional UI**: MongoDB-themed interface with database indicators
