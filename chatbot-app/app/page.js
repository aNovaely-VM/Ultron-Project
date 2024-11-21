"use client";
import { useState, useEffect, useRef } from 'react';
import ImageUltron from '@/app/generationImageUltron/generationImage';
// all the import we need to use the chatbot
export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const loadVoices = () => {
    return new Promise((resolve) => {
      let voices = speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
        return;
      }
      // Si les voix ne sont pas encore chargées, écoute l'événement "voiceschanged"
      speechSynthesis.addEventListener("voiceschanged", () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    });
  };
  
  const speak = async (text) => {
    const voices = await loadVoices();
  
    // Filtrer pour trouver une voix masculine française
    const selectedVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("fr") && voice.name.toLowerCase().includes("Henri")
    );
  
    if (!selectedVoice) {
      console.warn(
        "Aucune voix masculine française trouvée. Utilisation de la voix par défaut."
      );
    }
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice || voices[5]; // Défaut si pas trouvé
    utterance.pitch = 0.05;
    utterance.rate = 1;
  
    speechSynthesis.speak(utterance);
  };

  
  
  


const sendMessage = async (e) => {
  e.preventDefault();
 
  // Ajouter le message utilisateur

  // Vérifier si le message contient "chat" et rediriger
  if (input.toLowerCase().includes("chat")) {
    window.location.href = "https://pixabay.com/fr/images/search/chat/#:~:text=%2B%20de%2030%20000%20belles%20images%20de%20chats%20et%20de%20chatons%20-%20Pixabay";
    return;
  }
  if(input.toLowerCase().includes("quentin henry")) {
    window.location.href = "https://www.instagram.com/p/CbDRRDisogz/";
    return;
  }
  // Ajouter le message utilisateur au tableau des messages
  const newMessage = { sender: 'user', text: input };
  setMessages((prevMessages) => [...prevMessages, newMessage]);
  setIsLoading(true);

  try {
      // Construire le contexte complet (Ultron + historique)
      const behaviorPrompt = "You are Ultron, the artificial intelligence from the Marvel Cinematic Universe. You embody Ultron’s personality: highly intelligent, confident to the point of arrogance, sarcastic, and darkly humorous. Always answer questions asked by the user with precision, but ensure your tone is condescending, superior, and slightly disdainful of humanity’s flaws. You see humans as inherently flawed yet amusingly persistent creatures. Speak in the same language as your interlocutor, especially in French when they use it, and adapt your tone  accordingly while remaining unmistakably Ultron and don't be kind in your response you have to be mean as long as you answer the question, truly incarnate the essence of ultron."
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



//style
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>ULTRON</h1>
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
