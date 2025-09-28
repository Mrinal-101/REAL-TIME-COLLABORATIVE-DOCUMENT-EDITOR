// App.js - Main React Component for Collaborative Text Editor with MongoDB
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Components
import LoginForm from './components/LoginForm';
import Editor from './components/Editor';
import UserList from './components/UserList';
import Toolbar from './components/Toolbar';

function App() {
  // State management for the application
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // References for DOM manipulation
  const editorRef = useRef(null);

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    // Only connect when user is logged in
    if (currentUser && documentId) {
      const newSocket = io('http://localhost:5000', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 5000
      });

      // Set up socket event listeners
      setupSocketListeners(newSocket);
      setSocket(newSocket);

      // Join the document room
      newSocket.emit('join-document', {
        documentId: documentId,
        user: currentUser
      });

      // Cleanup function
      return () => {
        if (newSocket) {
          newSocket.emit('leave-document', { documentId });
          newSocket.disconnect();
        }
      };
    }
  }, [currentUser, documentId]);

  /**
   * Set up all Socket.IO event listeners
   */
  const setupSocketListeners = (socketInstance) => {
    // Connection status events
    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setIsLoading(false);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      setConnectionError('Lost connection to server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      setConnectionError('Cannot connect to server. Make sure the backend is running.');
      setIsLoading(false);
    });

    socketInstance.on('reconnect', () => {
      console.log('Reconnected to server');
      setConnectionError(null);
    });

    // Document events
    socketInstance.on('document-loaded', (data) => {
      console.log('Document loaded:', data);
      setDocumentTitle(data.document.title);
      setDocumentContent(data.document.content);
      setOnlineUsers(data.users);
      setLastSaved(new Date(data.document.lastModified));
    });

    socketInstance.on('text-updated', (data) => {
      console.log('Text updated by:', data.user.username);
      setDocumentContent(data.content);
      setLastSaved(new Date());
    });

    socketInstance.on('title-updated', (data) => {
      console.log('Title updated by:', data.user.username);
      setDocumentTitle(data.title);
      setLastSaved(new Date());
    });

    // User presence events
    socketInstance.on('user-joined', (data) => {
      console.log('User joined:', data.user.username);
      setOnlineUsers(data.users);
      showNotification(`${data.user.username} joined the document`);
    });

    socketInstance.on('user-left', (data) => {
      console.log('User left:', data.user.username);
      setOnlineUsers(data.users);
      showNotification(`${data.user.username} left the document`);
    });

    // Typing indicators
    socketInstance.on('typing-indicator', (data) => {
      // Update typing status in user list
      setOnlineUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === data.user.id 
            ? { ...user, isTyping: data.isTyping }
            : user
        )
      );
    });

    // Error handling
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError('Error: ' + error.message);
    });
  };

  /**
   * Handle user login and document joining
   */
  const handleLogin = (username, docId) => {
    setIsLoading(true);
    setConnectionError(null);

    // Create user object
    const user = {
      id: generateUserId(),
      username: username,
      color: getUserColor(),
      joinedAt: new Date().toISOString()
    };

    setCurrentUser(user);
    setDocumentId(docId || generateDocumentId());
  };

  /**
   * Handle text content changes in the editor
   */
  const handleContentChange = (content) => {
    setDocumentContent(content);

    if (socket && currentUser && documentId) {
      // Emit text change to other users
      socket.emit('text-change', {
        documentId: documentId,
        content: content,
        user: currentUser
      });

      // Update last saved time (optimistic update)
      setLastSaved(new Date());
    }
  };

  /**
   * Handle document title changes
   */
  const handleTitleChange = (title) => {
    setDocumentTitle(title);

    if (socket && currentUser && documentId) {
      socket.emit('title-change', {
        documentId: documentId,
        title: title,
        user: currentUser
      });

      // Update last saved time (optimistic update)
      setLastSaved(new Date());
    }
  };

  /**
   * Handle text formatting changes
   */
  const handleFormatText = (formatType, formatValue) => {
    if (socket && currentUser && documentId) {
      socket.emit('format-text', {
        documentId: documentId,
        formatType: formatType,
        formatValue: formatValue,
        user: currentUser
      });
    }
  };

  /**
   * Handle typing indicators
   */
  const handleTyping = (isTyping) => {
    if (socket && currentUser && documentId) {
      socket.emit('user-typing', {
        documentId: documentId,
        isTyping: isTyping,
        user: currentUser
      });
    }
  };

  /**
   * Handle sharing document
   */
  const handleShare = () => {
    if (documentId) {
      const shareUrl = `${window.location.origin}?doc=${documentId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert(`Document link copied to clipboard!\n\nShare this link: ${shareUrl}\n\nOr share the Document ID: ${documentId}`);
      }).catch(() => {
        alert(`Share this Document ID with others: ${documentId}`);
      });
    }
  };

  /**
   * Utility functions
   */
  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  };

  const generateDocumentId = () => {
    return 'doc_' + Math.random().toString(36).substr(2, 9);
  };

  const getUserColor = () => {
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F', '#DB4545', '#D2BA4C'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const showNotification = (message) => {
    // Simple notification - you can replace with a toast library
    console.log('Notification:', message);
  };

  const formatLastSaved = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // Less than 1 minute
      return 'Saved just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `Saved ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `Saved at ${date.toLocaleTimeString()}`;
    }
  };

  // Check URL parameters for document ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlDocId = urlParams.get('doc');
    if (urlDocId && !currentUser) {
      // Store document ID to use after login
      window.urlDocumentId = urlDocId;
    }
  }, []);

  // Render the application
  if (!currentUser) {
    return (
      <div className="app">
        <LoginForm 
          onLogin={handleLogin} 
          isLoading={isLoading} 
          error={connectionError}
          initialDocId={window.urlDocumentId}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="document-title-input"
            placeholder="Document title..."
          />
          <div className="document-info">
            <div className="connection-status">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span>{isConnected ? 'Connected' : connectionError || 'Disconnected'}</span>
            </div>
            <div className="last-saved">
              <span className="save-icon">💾</span>
              <span>{formatLastSaved(lastSaved)}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button onClick={handleShare} className="share-button" title="Share document">
            📤 Share
          </button>
          <span className="current-user">
            {currentUser.username} 
            <span className="user-color" style={{backgroundColor: currentUser.color}}></span>
          </span>
          <div className="document-id-display">
            ID: {documentId}
          </div>
        </div>
      </header>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="error-banner">
          ⚠️ {connectionError}
        </div>
      )}

      {/* Main Content */}
      <div className="app-content">
        {/* Sidebar with users */}
        <UserList users={onlineUsers} currentUser={currentUser} />

        {/* Main editing area */}
        <div className="editor-container">
          <Toolbar onFormat={handleFormatText} />
          <Editor
            ref={editorRef}
            content={documentContent}
            onChange={handleContentChange}
            onTyping={handleTyping}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}

export default App;