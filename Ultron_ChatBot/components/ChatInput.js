import React, { useRef } from 'react';

const ChatInput = ({ input, setInput, sendMessage, fileInputRef, handleFileChange, isLoading, isFileAttached }) => (
    <form onSubmit={sendMessage} className="input-container">
        <button type="button" className="attach-file" onClick={() => fileInputRef.current.click()} aria-label="Joindre un fichier">
            📎
        </button>
        <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
        />
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={isLoading}
        />
        <button type="submit" className="icon-button submit" disabled={isLoading}>
            {isLoading ? '...' : '↑'}
        </button>
    </form>
);

export default ChatInput;
