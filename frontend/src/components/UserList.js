// components/UserList.js - 
import React from 'react';

const UserList = ({ users, currentUser }) => {
  return (
    <div className="user-list-sidebar">
      <div className="user-list-header">
        <h3>👥 Online Users ({users.length})</h3>
        <div className="mongodb-indicator">
          <span className="db-icon">🗄️</span>
          <span>MongoDB Connected</span>
        </div>
      </div>

      <div className="user-list-content">
        {users.map(user => (
          <UserItem 
            key={user.id} 
            user={user} 
            isCurrentUser={user.id === currentUser.id}
          />
        ))}

        {users.length === 0 && (
          <div className="no-users-message">
            <div className="empty-state">
              <span className="empty-icon">👤</span>
              <p>No other users online</p>
              <small>Share your document ID to invite collaborators!</small>
            </div>
          </div>
        )}
      </div>

      <div className="user-list-footer">
        <div className="collaboration-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span>{users.length} {users.length === 1 ? 'user' : 'users'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💾</span>
            <span>Auto-saved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual user item component
const UserItem = ({ user, isCurrentUser }) => {
  return (
    <div className={`user-item ${isCurrentUser ? 'current-user' : ''}`}>
      <div 
        className="user-avatar"
        style={{ backgroundColor: user.color }}
        title={`${user.username}${isCurrentUser ? ' (You)' : ''}`}
      >
        {user.username.charAt(0).toUpperCase()}
      </div>

      <div className="user-info">
        <div className="user-name">
          {user.username} {isCurrentUser && <span className="you-badge">(You)</span>}
        </div>

        {user.isTyping && (
          <div className="user-status typing">
            <span className="typing-animation">✏️</span>
            Typing...
          </div>
        )}
      </div>

      <div className={`user-status-dot ${user.isTyping ? 'typing' : 'online'}`}></div>
    </div>
  );
};

export default UserList;