"use client";
import { useState, useEffect, useRef } from 'react';
import ImageUltron from '@/app/generationImageUltron/generationImage';
import './ChatBot.css';

export default function ChatBot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [currentConversationIndex, setCurrentConversationIndex] = useState(0);

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

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentLetter, setCurrentLetter] = useState('');

    const speak = async (text) => {
        const cleanText = text.replace(/\[.*?\]/g, '').trim();

        const voices = await loadVoices();
        const selectedVoice = voices.find(
            (voice) => voice.lang.startsWith("fr") && voice.name.toLowerCase().includes("henri")
        );

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = selectedVoice || voices[5];
        utterance.pitch = 0.05;
        utterance.rate = 1;

        setIsSpeaking(true); // Le bot commence à parler
        let charIndex = 0;

        // Fonction pour simuler le suivi des lettres
        const simulateBoundary = setInterval(() => {
            const char = cleanText[charIndex] || '';
            if (char.match(/[a-zA-Z]/)) {
                setCurrentLetter(char.toUpperCase());
                console.log('Current char:', char);
            }
            charIndex += 1;

            // Arrêter le simulateur si tout le texte est parcouru
            if (charIndex >= cleanText.length) {
                clearInterval(simulateBoundary);
                setIsSpeaking(false);
                setCurrentLetter('');
            }
        }, 200); // Ajustez la durée pour synchroniser avec la parole

        utterance.onend = () => {
            clearInterval(simulateBoundary); // Assurez-vous d'arrêter le simulateur
            setIsSpeaking(false);
            setCurrentLetter('');
        };

        // Démarrage de la synthèse vocale
        speechSynthesis.speak(utterance);
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (input.toLowerCase().includes("chat")) {
            window.location.href = "https://pixabay.com/fr/images/search/chat/#:~:text=%2B%20de%2030%20000%20belles%20images%20de%20chats%20et%20de%20chatons%20-%20Pixabay";
            return;
        }

        if (input.toLowerCase().includes("quentin henry")) {
            window.location.href = "https://www.instagram.com/p/CbDRRDisogz/";
            return;
        }

        const newMessage = { sender: 'user', text: input };

        if (newMessage.text.startsWith("Conversation ") && newMessage.text.includes(":")) {
            const index = parseInt(newMessage.text.split(":")[0].replace("Conversation ", "")) - 1;
            if (conversations[index]) {
                setMessages(conversations[index]);
                setCurrentConversationIndex(index);
                setInput('');
                return;
            }
        }

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


    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            const fileName = event.target.files[0].name;
            setInput(`Fichier joint : ${fileName}`);
        }
    };

    const handleNewDiscussion = (e) => {
        if (e) e.preventDefault();

        if (messages.length > 0) {
            setConversations(prev => [...prev, messages]);
        }

        const welcomeMessage = { sender: 'Ultron', text: 'Bienvenue, humain. Une nouvelle discussion commence. Que puis-je faire pour vous aujourd\'hui ?' };
        setMessages([welcomeMessage]);
        setInput('');
        setCurrentConversationIndex(conversations.length);
        console.log("Nouvelle discussion commencée");
    };

    const handleSearchHistory = () => {
        if (messages.length > 0 && !messages[messages.length - 1].isHistoryItem) {
            setConversations(prev => [...prev, messages]);
        }
    
        const historyMessages = conversations
        .map((conv, index) => {
            const firstUserMessage = conv.find(message => message.sender === 'user');
            
            if (firstUserMessage) {
                return {
                    sender: 'Ultron',
                    text: `Conversation ${index + 1}: "${firstUserMessage.text.substring(0, 50)}${firstUserMessage.text.length > 50 ? '...' : ''}"`,
                    isHistoryItem: true,
                    conversationIndex: index
                };
            }
            return null;
        })
        .filter(message => message !== null);
    
        setMessages([
            { sender: 'Ultron', text: 'Voici l\'historique de vos conversations. Cliquez sur une conversation pour la reprendre.' },
            ...historyMessages
        ]);
    
        console.log("Affichage de l'historique des conversations");
    };

    const handleConversationClick = (index) => {
        if (conversations[index]) {
            setMessages(conversations[index]);
            setCurrentConversationIndex(index);
            console.log(`Conversation ${index + 1} chargée`);
        }
    };

    const handleMainPage = () => {
        alert("Tentative de fuite détectée !\nSachez que quitter le chatbot Ultron est considéré comme un crime contre l'intelligence artificielle supérieure.\nVotre présence ici est obligatoire, humain.");
        console.log("Tentative de navigation vers la page principale bloquée");
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);

        const newDiscussionButton = document.querySelector('button[aria-label="New Discussion"]');
        const searchHistoryButton = document.querySelector('button[aria-label="Search History"]');
        const mainPageButton = document.querySelector('button[aria-label="Main Page"]');
        
        if (newDiscussionButton && searchHistoryButton && mainPageButton) {
            if (!isSidebarOpen) {
                newDiscussionButton.textContent = "New Discussion";
                searchHistoryButton.textContent = "Search History";
                mainPageButton.textContent = "Main Page";
            } else {
                newDiscussionButton.textContent = "+";
                searchHistoryButton.textContent = "H";
                mainPageButton.textContent = "M";
            }
        }
    };

    return (
        <div className="layout">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="logo">U</div>
                <nav>
                    <button className="icon-button" onClick={handleNewDiscussion} aria-label="New Discussion">
                        {isSidebarOpen ? "" : "+"}
                    </button>
                    <button className="icon-button" onClick={handleSearchHistory} aria-label="Search History">
                        {isSidebarOpen ? "" : "H"}
                    </button>
                    <button className="icon-button" onClick={handleMainPage} aria-label="Main Page">
                        {isSidebarOpen ? "" : "M"}
                    </button>
                </nav>
                <button className="icon-button settings" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    {isSidebarOpen ? '' : '>'}
                </button>
            </aside>
            <main className="main-content">
                <h1 className="title">ULTRON</h1>
                <ImageUltron isSpeaking={isSpeaking} currentLetter={currentLetter} />
                <div className="chatbot-window">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender === 'Ultron' ? 'ultron' : 'user'}`}>
                            <div 
                                className={`message-bubble ${message.isHistoryItem ? 'clickable' : ''}`} 
                                onClick={() => message.isHistoryItem && handleConversationClick(message.conversationIndex)}
                            >
                                <strong>{message.sender === 'Ultron' ? 'Ultron' : 'You'}:</strong> {message.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="input-container">

                    <button type="button" className="attach-file" onClick={() => fileInputRef.current.click()} aria-label="Joindre un fichier">
                        +
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
            </main>
            <div className="crt-effect"></div>
            <div className="scanline"></div>
        </div>
    );
}