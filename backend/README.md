# Collaborative Text Editor Backend with MongoDB

This is the Node.js backend server for the collaborative text editor with MongoDB integration.

## Features

- **MongoDB Integration**: Persistent document storage using Mongoose ODM
- **Real-time Communication**: WebSocket support using Socket.IO
- **RESTful API**: Document management endpoints
- **User Presence**: Track online users and typing status
- **Auto-save**: Automatic document saving to MongoDB
- **Error Handling**: Comprehensive error handling and logging

## Setup Instructions

1. **Install MongoDB** (see main README.md for detailed instructions)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.example .env
   # Edit .env file if you need custom MongoDB connection
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

5. The server will run on http://localhost:5000

## Environment Configuration

Create a `.env` file with these variables:

```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/collaborative-editor

# Server port
PORT=5000

# Environment
NODE_ENV=development

# CORS origin
FRONTEND_URL=http://localhost:3000
```

## Database Schema

The application uses one main collection:

### Documents Collection
- `documentId`: Unique string identifier for the document
- `title`: Document title
- `content`: HTML content of the document  
- `lastModified`: Timestamp of last update
- `collaborators`: Array of user objects who have accessed the document
- `createdAt`/`updatedAt`: Timestamps managed by Mongoose

## API Endpoints

- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `GET /api/documents` - List recent documents

## Socket.IO Events

### Client → Server:
- `join-document` - User joins document room
- `text-change` - Document content changed
- `title-change` - Document title changed  
- `user-typing` - User typing status
- `leave-document` - User leaves document

### Server → Client:  
- `document-loaded` - Send document data
- `text-updated` - Broadcast text changes
- `title-updated` - Broadcast title changes
- `user-joined` - User joined notification
- `user-left` - User left notification
- `typing-indicator` - Typing status update

## Error Handling

The server includes comprehensive error handling:
- MongoDB connection errors
- Socket.IO connection errors  
- Document validation errors
- Network and timeout errors

## Logging

Console logs include:
- MongoDB connection status
- User join/leave events
- Document operations
- Error messages with context

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or secure MongoDB instance
3. Configure proper CORS origins
4. Set up process manager (PM2)
5. Enable SSL/HTTPS
6. Set up monitoring and logging

## Dependencies

- **express**: Web framework
- **socket.io**: Real-time communication  
- **mongoose**: MongoDB ODM
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Development Dependencies

- **nodemon**: Auto-restart during development
