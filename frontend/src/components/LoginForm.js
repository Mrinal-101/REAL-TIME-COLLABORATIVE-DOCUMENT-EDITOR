// components/LoginForm.js - 
import React, { useState } from 'react';

const LoginForm = ({ onLogin, isLoading, error, initialDocId }) => {
  const [username, setUsername] = useState('');
  const [documentId, setDocumentId] = useState(initialDocId || '');
  const [validationError, setValidationError] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim()) {
      setValidationError('Please enter a username');
      return;
    }

    if (username.trim().length < 2) {
      setValidationError('Username must be at least 2 characters');
      return;
    }

    if (username.trim().length > 20) {
      setValidationError('Username must be less than 20 characters');
      return;
    }

    // Clear error and call login function
    setValidationError('');
    onLogin(username.trim(), documentId.trim() || null);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>📝 Collaborative Text Editor</h1>
          <h2>🗄️ with MongoDB Storage</h2>
          <p>Join a document and start collaborating in real-time!</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Your Name</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className={`form-input ${validationError ? 'error' : ''}`}
              maxLength={20}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="documentId">Document ID (Optional)</label>
            <input
              id="documentId"
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder="Leave empty to create new document"
              className="form-input"
              disabled={isLoading}
            />
            <small className="form-hint">
              Enter an existing document ID to join, or leave empty to create a new one.
              Documents are stored in MongoDB and persist across sessions.
            </small>
          </div>

          {validationError && (
            <div className="error-message">
              {validationError}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? 'Connecting...' : 'Join Document'}
          </button>

          <div className="quick-actions">
            <button
              type="button"
              onClick={() => setDocumentId('demo-doc')}
              className="quick-action-btn"
              disabled={isLoading}
            >
              📄 Join Demo Document
            </button>

            <button
              type="button"
              onClick={() => setDocumentId('')}
              className="quick-action-btn"
              disabled={isLoading}
            >
              ✨ Create New Document
            </button>
          </div>
        </form>

        <div className="features-list">
          <h3>✨ Features</h3>
          <ul>
            <li>🔄 Real-time collaborative editing</li>
            <li>👥 See who's online and typing</li>
            <li>🎨 Rich text formatting tools</li>
            <li>🗄️ MongoDB persistent storage</li>
            <li>💾 Auto-save functionality</li>
            <li>📱 Works on mobile and desktop</li>
            <li>🔗 Share documents with URLs</li>
          </ul>
        </div>

        <div className="tech-info">
          <h3>🛠️ Technology Stack</h3>
          <div className="tech-badges">
            <span className="tech-badge">React.js</span>
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">Socket.IO</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">Express</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;