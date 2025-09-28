// components/Toolbar.js -
import React, { useState } from 'react';

const Toolbar = ({ onFormat }) => {
  const [activeFormats, setActiveFormats] = useState(new Set());

  // Handle format button clicks
  const handleFormat = (formatType, formatValue = null) => {
    // Execute the command
    document.execCommand(formatType, false, formatValue);

    // Notify parent component
    onFormat(formatType, formatValue);

    // Update active formats
    updateActiveFormats();
  };

  // Update active format states
  const updateActiveFormats = () => {
    const newActiveFormats = new Set();

    if (document.queryCommandState('bold')) newActiveFormats.add('bold');
    if (document.queryCommandState('italic')) newActiveFormats.add('italic');
    if (document.queryCommandState('underline')) newActiveFormats.add('underline');

    setActiveFormats(newActiveFormats);
  };

  // Handle font size change
  const handleFontSize = (e) => {
    const size = e.target.value;
    handleFormat('fontSize', size);
  };

  // Handle font color change
  const handleFontColor = (e) => {
    const color = e.target.value;
    handleFormat('foreColor', color);
  };

  // Handle background color change
  const handleBackgroundColor = (e) => {
    const color = e.target.value;
    handleFormat('backColor', color);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="toolbar-label">Format:</div>

        {/* Basic formatting buttons */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${activeFormats.has('bold') ? 'active' : ''}`}
            onClick={() => handleFormat('bold')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>

          <button
            className={`toolbar-btn ${activeFormats.has('italic') ? 'active' : ''}`}
            onClick={() => handleFormat('italic')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>

          <button
            className={`toolbar-btn ${activeFormats.has('underline') ? 'active' : ''}`}
            onClick={() => handleFormat('underline')}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
        </div>

        {/* Separator */}
        <div className="toolbar-separator"></div>

        {/* Font size selector */}
        <div className="toolbar-group">
          <select 
            className="toolbar-select"
            onChange={handleFontSize}
            title="Font Size"
            defaultValue="3"
          >
            <option value="1">Very Small</option>
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="4">Medium</option>
            <option value="5">Large</option>
            <option value="6">Very Large</option>
            <option value="7">Huge</option>
          </select>
        </div>

        {/* Separator */}
        <div className="toolbar-separator"></div>

        {/* Color controls */}
        <div className="toolbar-group">
          <label className="color-picker-label" title="Text Color">
            <span className="color-label">A</span>
            <input
              type="color"
              className="color-picker"
              onChange={handleFontColor}
              defaultValue="#000000"
            />
          </label>

          <label className="color-picker-label" title="Background Color">
            <span className="color-label">🎨</span>
            <input
              type="color"
              className="color-picker"
              onChange={handleBackgroundColor}
              defaultValue="#ffffff"
            />
          </label>
        </div>

        {/* Separator */}
        <div className="toolbar-separator"></div>

        {/* List and alignment controls */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => handleFormat('insertUnorderedList')}
            title="Bullet List"
          >
            • List
          </button>

          <button
            className="toolbar-btn"
            onClick={() => handleFormat('insertOrderedList')}
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        {/* Separator */}
        <div className="toolbar-separator"></div>

        {/* Alignment controls */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => handleFormat('justifyLeft')}
            title="Align Left"
          >
            ⬅️
          </button>

          <button
            className="toolbar-btn"
            onClick={() => handleFormat('justifyCenter')}
            title="Align Center"
          >
            ↔️
          </button>

          <button
            className="toolbar-btn"
            onClick={() => handleFormat('justifyRight')}
            title="Align Right"
          >
            ➡️
          </button>
        </div>
      </div>

      <div className="toolbar-info">
        <span className="mongodb-badge">
          <span className="db-icon">🗄️</span>
          <span>MongoDB</span>
        </span>
        <span className="save-indicator">💾 Auto-save</span>
      </div>
    </div>
  );
};

export default Toolbar;