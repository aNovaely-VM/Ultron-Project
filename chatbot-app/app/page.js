"use client";
import { useState, useEffect, useRef } from 'react';
import { franc } from 'franc'; // Importer la bibliothèque franc pour la détection de langue
import ImageUltron from '@/app/generationImageUltron/generationImage';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fonction de synthèse vocale pour faire parler le chatbot
  const speak = (text, languageCode) => {
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    
    // Trouver une voix masculine
    const voice = voices.find(voice => 
        voice.lang === (languageCode === 'fra' ? 'fr-FR' : 'en-US') && voice.name.includes('Male')
    ) || voices[0]; 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = languageCode === 'fra' ? 'fr-FR' : 'en-US'; 
    synth.speak(utterance);
};

const sendMessage = async (e) => {
  e.preventDefault();

  // Ajouter le message utilisateur au tableau des messages
  const newMessage = { sender: 'user', text: input };
  setMessages((prevMessages) => [...prevMessages, newMessage]);
  setIsLoading(true);

  try {
      // Construire le contexte complet (Ultron + historique)
      const behaviorPrompt = "You are Ultron, the artificial intelligence from the Marvel Cinematic Universe. Act like Ultron with his personality, tone, and intelligence throughout this conversation.";
      const conversationHistory = messages
          .map((message) => `${message.sender === 'user' ? 'User' : 'Ultron'}: ${message.text}`)
          .join('\n');
      
      const fullPrompt = `${behaviorPrompt}\n\n${conversationHistory}\nUser: ${input}\nUltron:`;

      // Envoyer la requête à l'API
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await response.json();
      const botMessage = data.text;

      // Ajouter la réponse de l'IA au tableau des messages
      setMessages((prevMessages) => [...prevMessages, { sender: 'Ultron', text: botMessage }]);

      // Parler avec la voix du bot
      speak(botMessage, 'en'); // En anglais (Ultron est généralement anglophone)
      setInput('');
  } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'Ultron', text: 'Une erreur est survenue, veuillez réessayer.' }]);
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
