import React from 'react';
import ImageUltron from "@/components/ImageUltron";

const ChatMessages = ({ messages, messagesEndRef, isSpeaking, currentLetter }) => (
  <div className="messages">
    {messages.map((message, index) => (
      <div key={index} className={`message ${message.sender}`}>
        <div className="message-bubble">{message.text}</div>
      </div>
    ))}
    <div ref={messagesEndRef} />
    <ImageUltron isSpeaking={isSpeaking} currentLetter={currentLetter} />
  </div>
);

export default ChatMessages;
