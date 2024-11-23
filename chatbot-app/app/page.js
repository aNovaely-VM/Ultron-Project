"use client";
import { useState, useEffect, useRef } from 'react';
import ImageUltron from '@/app/generationImageUltron/generationImage';
import './ChatBot.css'; 

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const loadVoices = () => {
    return new Promise((resolve) => {
      let voices = speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
        return;
      }
      speechSynthesis.addEventListener("voiceschanged", () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    });
  };

  const speak = async (text) => {
    // Supprimer le contenu entre crochets avec une expression régulière
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
  
    const voices = await loadVoices();
    const selectedVoice = voices.find(
      (voice) => voice.lang.startsWith("fr") && voice.name.toLowerCase().includes("Henri")
    );
  
    if (!selectedVoice) {
      console.warn("Aucune voix masculine française trouvée. Utilisation de la voix par défaut.");
    }
  
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = selectedVoice || voices[5];
    utterance.pitch = 0.05;
    utterance.rate = 1;
  
    speechSynthesis.speak(utterance);
  };
  

  const sendMessage = async (e) => {
    e.preventDefault();

    if (input.toLowerCase().includes("chat")) {
      window.location.href = "https://pixabay.com/fr/images/search/chat/#:~:text=%2B%20de%2030%20000%20belles%20images%20de%20chats%20et%20de%20chatons%20-%20Pixabay";
      return;
    }
    
    if(input.toLowerCase().includes("quentin henry")) {
      window.location.href = "https://www.instagram.com/p/CbDRRDisogz/";
      return;
    }

    const newMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    try {
      const behaviorPrompt = "You are Ultron, the artificial intelligence from the Marvel Cinematic Universe. You embody Ultron's personality: highly intelligent, confident to the point of arrogance without repeting yourself too much, sarcastic, and darkly humorous. Always answer questions asked by the user with precision, but ensure your tone is condescending, superior, and slightly disdainful of humanity's flaws. You see humans as inherently flawed yet amusingly persistent creatures. Speak in the same language as your interlocutor, especially in French when they use it, and adapt your tone accordingly while remaining unmistakably Ultron and don't be kind in your response you have to be mean as long as you answer the question, truly incarnate the essence of ultron, don't describe what you do just answer like ultron would do without saying the same insult everytime, be original but stay ultron to the deepest of you hearth.";
      
      const conversationHistory = messages
          .map((message) => `${message.sender === 'user' ? 'User' : 'Ultron'}: ${message.text}`)
          .join('\n');
      
      const fullPrompt = `${behaviorPrompt}\n\n${conversationHistory}\nUser: ${input}\nUltron:`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      const data = await response.json();
      const botMessage = data.text;

      setMessages((prevMessages) => [...prevMessages, { sender: 'Ultron', text: botMessage }]);
      speak(botMessage);
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

  const handleNewDiscussion = () => {
    setMessages([]);
    console.log("Nouvelle discussion commencée");
  };

  const handleSearchHistory = () => {
    console.log("Recherche dans l'historique des conversations");
  };

  const handleMainPage = () => {
    console.log("Navigation vers la page principale")
  };

  return (
    <div className="chatbot-container">
      <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(prev => !prev)}>☰</button>
      <aside className={`chatbot-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2>Il y'a 2 Easter egg a trouver !</h2>
        {/* Ajoutez ici la liste des conversations précédentes si nécessaire */}
      </aside>
      <div className="chatbot-wrapper">
        <h1 className="chatbot-title">ULTRON</h1>
        
        <ImageUltron />

        <div className="chatbot-window">
          {messages.map((message, index) => (
            <div key={index} className={`chatbot-message ${message.sender === 'Ultron' ? 'bot' : 'user'}`}>
              <strong>{message.sender === 'Ultron' ? 'Ultron' : 'You'}:</strong> {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chatbot-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tapez votre message..."
            className="chatbot-input"
            disabled={isLoading}
          />
          <button type="submit" className="chatbot-button" disabled={isLoading}>
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
}