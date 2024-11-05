"use client";
import { useState } from 'react';
import ImageUltron from '@/app/generationImageUltron/generationImage'; // Assurez-vous que ce composant existe
import Image from 'next/image';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [botMessage, setBotMessage] = useState(''); // Message temporaire pour afficher progressivement
  const [isTyping, setIsTyping] = useState(false); // Pour gérer l'animation du texte

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
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'Ultron', text: data.text },
      ]);
      typeMessage(data.text);
      // setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

    // Fonction pour afficher le texte progressivement
    const typeMessage = (text) => {
      let index = 0;
      setIsTyping(true);
      setBotMessage(''); // Reset message avant de commencer à taper
      const typingInterval = setInterval(() => {
        setBotMessage((prev) => prev + text[index]);
        index++;
        if (index === text.length) {
          clearInterval(typingInterval); // Arrêter l'intervalle lorsque tout le texte est affiché
          setIsTyping(false);
        }
      }, 50); // Vous pouvez ajuster le délai ici (50ms par caractère)
    };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Chatbot avec Cohere</h1>
      
      <div
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          maxHeight: '300px',
          overflowY: 'scroll',
          marginBottom: '20px', // Ajoute un peu de marge sous le chat avant l'image
        }}
      >
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            {/* Si le message vient d'Ultron, afficher l'image et le texte dans des div séparées */}
            {message.sender === 'Ultron' && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Conteneur d'image séparé */}
                <div style={{ marginRight: '15px', flexShrink: 0 }}>
                  {/* ImageUltron est affiché uniquement si le message provient d'Ultron */}
                  {/* <ImageUltron style={{ width: '50px', height: '50px' }} /> */}
                </div>
                {/* Conteneur du texte */}
                <div style={{ maxWidth: '70%' }}>
                  <strong>Ultron:</strong> {botMessage}
                </div>
              </div>
            )}

            {/* Si le message vient de l'utilisateur, afficher sans image */}
            {message.sender === 'user' && (
              <div style={{ textAlign: 'right' }}>
                <strong>You:</strong> {message.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image entre le carré texte et le formulaire */}
      {messages.some((msg) => msg.sender === 'Ultron') && isTyping && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <ImageUltron style={{ width: '100px', height: '100px' }} />
        </div>
      )}
      {!isTyping && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Image
                    src={'/ImageBlablaUltron2d/Ultron_vide.png'}
                    alt="Image vide"
                    width={180}
                    height={140}
                    onError={() => setImageIndex((prevIndex) => (prevIndex + 1) % images.length)}// Passer à l'image suivante si erreur
                />
          {/* <Image style={{ width: '100px', height: '100px' }} /> */}
        </div>
      )}

      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          style={{ width: '50%' }}
          disabled={isLoading}
        />
        <button
          type="submit"
          style={{ width: '20%' }}
          disabled={isLoading}
        >
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}