// "use client";
// import { useState, useEffect, useRef } from 'react';
// import { franc } from 'franc'; // Importer la bibliothèque franc pour la détection de langue
// import ImageUltron from '@/app/generationImageUltron/generationImage';

// export default function ChatBot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Fonction de synthèse vocale pour faire parler le chatbot
//   const speak = (text, languageCode) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = languageCode === 'fra' ? 'fr-FR' : 'en-US'; // Ajustez en fonction de la langue détectée
//     speechSynthesis.speak(utterance);
//   };

//   const sendMessage = async (e) => {
//     e.preventDefault();

//     if (input.toLowerCase().includes("chat")) {
//       window.location.href = "https://pixabay.com/fr/images/search/chat/#:~:text=%2B%20de%2030%20000%20belles%20images%20de%20chats%20et%20de%20chatons%20-%20Pixabay";
//       return;
//     }
//     if(input.toLowerCase().includes("quentin henry")) {
//       window.location.href = "https://www.instagram.com/p/CbDRRDisogz/";
//       return;
//     }
//     // Détecter la langue du message utilisateur avec franc
//     const detectedLang = franc(input); // Retourne un code ISO639 (par exemple, "fra" pour le français)

//     // Ajouter le message utilisateur à l'interface
//     setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: input }]);
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ message: input, language: detectedLang }),
//       });

//       const data = await response.json();
//       const botMessage = data.text;

//       // Ajouter la réponse de l'IA et faire parler le bot dans la langue détectée
//       setMessages((prevMessages) => [...prevMessages, { sender: 'Ultron', text: botMessage }]);
//       speak(botMessage, detectedLang); // Faire parler dans la langue détectée

//       setInput('');
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: 'Une erreur est survenue, veuillez réessayer.' }]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1 style={{ textAlign: 'center' }}>Chatbot avec Cohere</h1>
//       <div style={{ border: '1px solid #ccc', padding: '20px', maxHeight: '300px', overflowY: 'scroll' }}>
//         {messages.map((message, index) => (
//           <div key={index} style={{ textAlign: message.sender === 'bot' ? 'left' : 'right' }}>
//             <strong>{message.sender === 'bot' ? 'Bot' : 'You'}:</strong> {message.text}
//           </div>
//         ))}
//         <div ref={messagesEndRef} /> {/* Scroll to the end */}
//       </div>

//       <ImageUltron />

//       <form onSubmit={sendMessage} style={{ marginTop: '10px', display: 'flex' }}>
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Tapez votre message..."
//           style={{ width: '50%' }}
//           disabled={isLoading}
//         />
//         <button type="submit" style={{ width: '20%', display: 'flex' }} disabled={isLoading}>
//           {isLoading ? 'Envoi...' : 'Envoyer'}
//         </button>
//       </form>
//     </div>
//   );
// }


"use client";
import { useState, useEffect, useRef } from 'react';

// Mapping des lettres vers des images (exemple)
const letterToImageMap = {
  a: '/ImageBlablaUltron2d/Ultron_A.png',
  e: '/ImageBlablaUltron2d/ultron_consonne.png',
  i: '/ImageBlablaUltron2d/Ultron_I.png',
  o: '/ImageBlablaUltron2d/Ultron_neutre.png',
  u: '/ImageBlablaUltron2d/Ultron_O.png',
  y: '/ImageBlablaUltron2d/Ultron_vide.png',
  // Ajoutez ici d'autres lettres et leurs images associées
};

const defaultImage = '/ImageBlablaUltron2d/Ultron_vide.png'; // Image par défaut si la lettre n'a pas d'image

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(defaultImage);
  const messagesEndRef = useRef(null);

  const loadVoices = () => {
    return new Promise((resolve) => {
      let voices = speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          voices = speechSynthesis.getVoices();
          resolve(voices);
        };
      }
    });
  };

  const speak = async (text) => {
    const voices = await loadVoices();
    const utterance = new SpeechSynthesisUtterance(text);

    const selectedVoice = voices.find((voice) =>
      ["Microsoft Henri Online (Natural)", "Microsoft Gerard Online (Natural)", "Microsoft Thierry Online (Natural)", "Microsoft Fabrice Online (Natural)"].includes(voice.name)
    );

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      console.warn("Aucune voix recommandée trouvée. Utilisation de la voix par défaut.");
    }

    utterance.pitch = 0.7;
    utterance.rate = 0.9;

    return utterance;
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    // Ajouter le message utilisateur au tableau des messages
    const newMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    try {
      // Construire le contexte complet (Ultron + historique)
      const behaviorPrompt = "You are Ultron, the artificial intelligence from the Marvel Cinematic Universe. You embody Ultron’s personality: highly intelligent, confident to the point of arrogance, sarcastic, and darkly humorous. Always answer questions asked by the user with precision, but ensure your tone is condescending, superior, and slightly disdainful of humanity’s flaws. You see humans as inherently flawed yet amusingly persistent creatures. Speak in the same language as your interlocutor, especially in French when they use it, and adapt your tone accordingly while remaining unmistakably Ultron and don't be kind in your response you have to be mean as long as you answer the question, truly incarnate the essence of ultron."
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

      // Extraire les lettres du message
      const letters = Array.from(botMessage.toLowerCase().replace(/[^a-z]/g, "")); // Sélectionner toutes les lettres

      // Parler avec la voix du bot
      const utterance = await speak(botMessage);

      let index = 0;
      let currentImageToShow = defaultImage;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          if (index < letters.length) {
            const currentLetter = letters[index];

            // Vérifier si la lettre a une image associée
            if (letterToImageMap[currentLetter]) {
              currentImageToShow = letterToImageMap[currentLetter];
            } 

            // Mettre à jour l'image affichée
            setCurrentImage(currentImageToShow);
            setCurrentLetterIndex(index);  // Mettre à jour l'index de la lettre lue

            index++;
          }
        }
      };

      // Lancer la lecture du texte
      speechSynthesis.speak(utterance);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'Ultron', text: 'Une erreur est survenue, veuillez réessayer.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Suivre le scroll des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>ULTRON</h1>
      <div style={{ border: '1px solid #ccc', padding: '20px', maxHeight: '300px', overflowY: 'scroll' }}>
        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender === 'Ultron' ? 'left' : 'right' }}>
            <strong>{message.sender === 'Ultron' ? 'Ultron' : 'You'}:</strong> {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll to the end */}
      </div>

      {/* Affichage dynamique de l'image correspondant à la lettre lue */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
        }}
      >
        <img
          src={currentImage}
          alt={`Image for letter`}
          style={{
            width: '100px',
            height: '100px',
            margin: '5px',
            borderRadius: '10px',
          }}
        />
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: '10px', display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tapez votre message..."
          style={{ width: '50%' }}
          disabled={isLoading}
        />
        <button type="submit" style={{ width: '20%' }} disabled={isLoading}>
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}

