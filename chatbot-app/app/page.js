"use client";
import { useState, useEffect, useRef } from 'react';
import ImageUltron from '@/app/generationImageUltron/generationImage';
import "./globals.css";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fonction de synthèse vocale pour faire parler le chatbot
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-EN'; // Définit la langue française (modifiez selon les besoins)
    speechSynthesis.speak(utterance);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
  
    // Vérifier si le message contient "chat" et rediriger
    if (input.toLowerCase().includes("chat")) {
      window.location.href = "https://pixabay.com/fr/images/search/chat/#:~:text=%2B%20de%2030%20000%20belles%20images%20de%20chats%20et%20de%20chatons%20-%20Pixabay";
      return;
    }
    if(input.toLowerCase().includes("quentin henry")) {
      window.location.href = "https://www.instagram.com/p/CbDRRDisogz/";
      return;
    }
  
    // Ajout du message utilisateur
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: input }]);
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
  
      const data = await response.json();
      const botMessage = data.text;
  
      // Ajouter la réponse de l'IA et faire parler le bot
      setMessages((prevMessages) => [...prevMessages, { sender: 'Ultron', text: botMessage }]);
      speak(botMessage);
  
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Une erreur est survenue, veuillez réessayer.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Chatbot avec Cohere</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', maxHeight: '300px', overflowY: 'scroll' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender === 'bot' ? 'left' : 'right' }}>
            <strong>{message.sender === 'bot' ? 'Bot' : 'You'}:</strong> {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll to the end */}
      </div>

      <ImageUltron />

      <form onSubmit={sendMessage} style={{ marginTop: '10px', display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          style={{ width: '50%' }}
          disabled={isLoading}
        />
        <button type="submit" style={{ width: '20%', display: 'flex' }} disabled={isLoading}>
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}
