# Real-Time Collaborative Text Editor

## Features

- Real-time collaborative editing with multiple users
- Persistent storage with MongoDB for documents
- Rich text formatting: bold, italic, underline, font colors, sizes, bullet lists, alignment
- User presence indicators (who's online and typing)
- Document creation, joining by Document ID, and sharing via URLs
- Auto-save functionality with last saved timestamps
- Responsive UI for desktop and mobile
- Complete beginner-friendly code with detailed comments
- Production-ready backend with environment config and error handling

---

## Tech Stack

- Frontend: React.js, Socket.IO client
- Backend: Node.js, Express.js, Socket.IO server, MongoDB (via Mongoose)
- Styling: CSS 

---

## Getting Started

### Prerequisites

- Node.js (v16 or above)
- MongoDB (local or MongoDB Atlas cloud instance)
- npm (comes with Node.js)

### Installation

1. Clone the repository or download the ZIP file and extract it.
2. Setup MongoDB:
   - [Local setup instructions](backend/MONGODB_SETUP.md)
   - Or use MongoDB Atlas cloud (update `backend/.env` with your connection URI)
3. Backend setup:
   ```
   cd backend
   npm install
   cp .env.example .env # update if necessary
   npm start
   ```
5. Frontend setup (in a new terminal):
   ```
   cd frontend
   npm install
   npm start
   ```
7. Open http://localhost:3000 in your browser.

---

## Usage

- On the login screen, enter your name.
- To create a new document, leave Document ID blank.
- To join an existing document, enter the Document ID and join.
- Start typing and see real-time updates across users.
- Share the Document ID or link to collaborate.

---

## Project Structure
```

collaborative-text-editor-mongodb/
├── backend/
│ ├── server.js # Backend server with MongoDB integration
│ ├── package.json # Backend dependencies
│ ├── .env.example # Env config template
│ ├── MONGODB_SETUP.md # MongoDB installation guide
│ └── README.md # Backend README
├── frontend/
│ ├── public/
│ │ └── index.html # HTML template
│ ├── src/
│ │ ├── components/ # React components
│ │ │ ├── Editor.js
│ │ │ ├── LoginForm.js
│ │ │ ├── Toolbar.js
│ │ │ └── UserList.js
│ │ ├── App.js # Main React app
│ │ ├── App.css # Styles
│ │ ├── index.css # Base styles
│ │ └── index.js # React entry point
│ └── package.json # Frontend dependencies
└── README.md # This file

```
---

## API Endpoints

- `GET /api/documents/:id` - Get document data by ID
- `POST /api/documents` - Create a new document
- `PUT /api/documents/:id` - Update document content or title
- `GET /api/documents` - List recent documents

---

## Socket.IO Events

### Client to Server

- `join-document`
- `leave-document`
- `text-change`
- `title-change`
- `user-typing`
- `cursor-position`
- `format-text`

### Server to Client

- `document-loaded`
- `text-updated`
- `title-updated`
- `user-joined`
- `user-left`
- `typing-indicator`
- `cursor-moved`
- `format-applied`

---


## Contributing

Contributions welcome!  
Feel free to open issues, submit pull requests, or suggest enhancements.

---
## Screenshots

<img width="1919" height="864" alt="Image" src="https://github.com/user-attachments/assets/1dd675e1-4b41-4da2-9fd5-d0400103be50" />
<img width="1919" height="866" alt="Image" src="https://github.com/user-attachments/assets/352baf51-797b-433b-a994-841740cd8879" />
<img width="1919" height="912" alt="Image" src="https://github.com/user-attachments/assets/716ce5f7-573b-4069-8ed5-9b54b49d897e" />

