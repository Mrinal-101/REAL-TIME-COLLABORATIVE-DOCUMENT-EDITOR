// App.js - Collaborative Text Editor
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

import LoginForm from './components/LoginForm';
import Editor from './components/Editor';
import UserList from './components/UserList';
import Toolbar from './components/Toolbar';

const COLORS = ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F', '#DB4545', '#D2BA4C'];

const randomId = (prefix) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

function App() {
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

  const editorRef = useRef(null);

  // grab doc id from url on mount, store it for after login
  useEffect(() => {
    const urlDocId = new URLSearchParams(window.location.search).get('doc');
    if (urlDocId && !currentUser) {
      window.urlDocumentId = urlDocId;
    }
  }, []);

  // connect socket once we have a user + doc
  useEffect(() => {
    if (!currentUser || !documentId) return;

    const newSocket = io('http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 5000
    });

    setupSocketListeners(newSocket);
    setSocket(newSocket);

    newSocket.emit('join-document', { documentId, user: currentUser });

    return () => {
      newSocket.emit('leave-document', { documentId });
      newSocket.disconnect();
    };
  }, [currentUser, documentId]);

  const setupSocketListeners = (sock) => {
    sock.on('connect', () => {
      setIsConnected(true);
      setIsLoading(false);
      setConnectionError(null);
    });

    sock.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionError('Lost connection to server');
    });

    sock.on('connect_error', () => {
      setIsConnected(false);
      setConnectionError('Cannot connect to server. Make sure the backend is running.');
      setIsLoading(false);
    });

    sock.on('reconnect', () => setConnectionError(null));

    sock.on('document-loaded', ({ document, users }) => {
      setDocumentTitle(document.title);
      setDocumentContent(document.content);
      setOnlineUsers(users);
      setLastSaved(new Date(document.lastModified));
    });

    sock.on('text-updated', ({ content }) => {
      setDocumentContent(content);
      setLastSaved(new Date());
    });

    sock.on('title-updated', ({ title }) => {
      setDocumentTitle(title);
      setLastSaved(new Date());
    });

    sock.on('user-joined', ({ user, users }) => {
      setOnlineUsers(users);
      console.log(`${user.username} joined`);
    });

    sock.on('user-left', ({ user, users }) => {
      setOnlineUsers(users);
      console.log(`${user.username} left`);
    });

    sock.on('typing-indicator', ({ user, isTyping }) => {
      setOnlineUsers(prev =>
        prev.map(u => u.id === user.id ? { ...u, isTyping } : u)
      );
    });

    sock.on('error', (error) => {
      setConnectionError('Error: ' + error.message);
    });
  };

  const handleLogin = (username, docId) => {
    setIsLoading(true);
    setConnectionError(null);

    setCurrentUser({
      id: randomId('user'),
      username,
      color: randomColor(),
      joinedAt: new Date().toISOString()
    });

    setDocumentId(docId || randomId('doc'));
  };

  const handleContentChange = (content) => {
    setDocumentContent(content);

    if (socket && currentUser && documentId) {
      socket.emit('text-change', { documentId, content, user: currentUser });
      setLastSaved(new Date());
    }
  };

  const handleTitleChange = (title) => {
    setDocumentTitle(title);

    if (socket && currentUser && documentId) {
      socket.emit('title-change', { documentId, title, user: currentUser });
      setLastSaved(new Date());
    }
  };

  const handleFormatText = (formatType, formatValue) => {
    if (socket && currentUser && documentId) {
      socket.emit('format-text', { documentId, formatType, formatValue, user: currentUser });
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && currentUser && documentId) {
      socket.emit('user-typing', { documentId, isTyping, user: currentUser });
    }
  };

  const handleShare = () => {
    if (!documentId) return;

    const shareUrl = `${window.location.origin}?doc=${documentId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert(`Link copied!\n\n${shareUrl}\n\nDoc ID: ${documentId}`))
      .catch(() => alert(`Share this Doc ID: ${documentId}`));
  };

  const formatLastSaved = (date) => {
    if (!date) return '';
    const diff = Date.now() - date;

    if (diff < 60000) return 'Saved just now';
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `Saved ${mins} minute${mins > 1 ? 's' : ''} ago`;
    }
    return `Saved at ${date.toLocaleTimeString()}`;
  };

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
            <span className="user-color" style={{ backgroundColor: currentUser.color }}></span>
          </span>
          <div className="document-id-display">ID: {documentId}</div>
        </div>
      </header>

      {connectionError && (
        <div className="error-banner">⚠️ {connectionError}</div>
      )}

      <div className="app-content">
        <UserList users={onlineUsers} currentUser={currentUser} />
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
