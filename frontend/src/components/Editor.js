// components/Editor.js - 
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const Editor = forwardRef(({ content, onChange, onTyping, currentUser }, ref) => {
  const editorRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastContentRef = useRef('');

  // Expose editor methods to parent component
  useImperativeHandle(ref, () => ({
    focus: () => editorRef.current?.focus(),
    getSelection: () => window.getSelection(),
    insertText: (text) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertText', false, text);
      }
    }
  }));

  // Update editor content when props change (from other users)
  useEffect(() => {
    if (editorRef.current && content !== lastContentRef.current) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset;
      const endOffset = range?.endOffset;

      // Only update if content is actually different to avoid cursor jumping
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;

        // Try to restore cursor position
        if (range && startOffset !== undefined) {
          try {
            const newRange = document.createRange();
            const textNode = editorRef.current.firstChild;
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
              newRange.setStart(textNode, Math.min(startOffset, textNode.textContent.length));
              newRange.setEnd(textNode, Math.min(endOffset, textNode.textContent.length));
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } catch (error) {
            // Ignore cursor positioning errors
            console.log('Could not restore cursor position');
          }
        }
      }

      lastContentRef.current = content;
    }
  }, [content]);

  // Handle typing events
  const handleInput = (e) => {
    const newContent = e.target.innerHTML;
    lastContentRef.current = newContent;
    onChange(newContent);

    // Handle typing indicators
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  // Handle key events for shortcuts
  const handleKeyDown = (e) => {
    // Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
    }

    // Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
    }

    // Ctrl+U for underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
    }

    // Ctrl+S for save (prevent browser save dialog)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // Content is auto-saved, just show feedback
      console.log('Document auto-saved to MongoDB');
    }
  };

  // Handle paste events to clean up formatting
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="editor-wrapper">
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder="Start typing your document here..."
      />

      {/* Typing indicator for current user */}
      {isTyping && (
        <div className="typing-indicator">
          <span style={{ color: currentUser.color }}>
            ✏️ {currentUser.username} is typing...
          </span>
        </div>
      )}

      {/* Help text */}
      <div className="editor-help">
        <small>
          💡 Tip: Use <kbd>Ctrl+B</kbd> for bold, <kbd>Ctrl+I</kbd> for italic, <kbd>Ctrl+U</kbd> for underline. 
          Changes are automatically saved to MongoDB.
        </small>
      </div>
    </div>
  );
});

export default Editor;