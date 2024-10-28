"use client";
import { useState } from 'react';
import ImageUltron from '@/app/generationImageUltron/generationImage';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();

    // Ajouter le message utilisateur
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: input }]);

    setIsLoading(true);

    try {
      // Appel à l'API locale pour envoyer le message à Cohere
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      // Ajouter la réponse de l'IA à la liste des messages
      setMessages((prevMessages) => [...prevMessages, { sender: 'Ultron', text: data.text }]);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{textAlign: 'center'}}>Chatbot avec Cohere</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', maxHeight: '300px', overflowY: 'scroll' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender === 'bot' ? 'left' : 'right' }}>
            <strong>{message.sender === 'bot' ? 'Bot' : 'You'}:</strong> {message.text}
          </div>
        ))}
      </div>

      <ImageUltron/>

      <form onSubmit={sendMessage} style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          style={{width: '50%' }}
          disabled={isLoading}
        />
        <button type="submit" style={{ width: '20%' }} disabled={isLoading}>
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}
