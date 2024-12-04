"use client"; 
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SceneInit from "./lib/SceneInit";
import "./ChatBot.css";
import ImageUltron from "@/app/generationImageUltron/generationImage"; 

export default function ChatBotWith3D() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentLetter, setCurrentLetter] = useState('');
    const [isFileAttached, setIsFileAttached] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const threeContainerRef = useRef(null); 

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
        const cleanText = text.replace(/\[.*?\]/g, '').trim();
        const voices = await loadVoices();
        const selectedVoice = voices.find(
            (voice) => voice.lang.startsWith("fr") && voice.name.toLowerCase().includes("henri")
        );
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = selectedVoice || voices[5];
        utterance.pitch = 0.05;
        utterance.rate = 1;
        setIsSpeaking(true);
        
        let charIndex = 0;
        const simulateBoundary = setInterval(() => {
            const char = cleanText[charIndex] || '';
            if (char.match(/[a-zA-Z]/)) {
                setCurrentLetter(char.toUpperCase());
            }
            charIndex += 1;
            if (charIndex >= cleanText.length) {
                clearInterval(simulateBoundary);
                setIsSpeaking(false);
                setCurrentLetter('');
            }
        }, 200);

        utterance.onend = () => {
            clearInterval(simulateBoundary);
            setIsSpeaking(false);
            setCurrentLetter('');
        };
        
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

        const newMessage = { sender: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setIsLoading(true);

        try {
            const behaviorPrompt = "You are Ultron, the artificial intelligence from the Marvel Cinematic Universe. You embody Ultron’s personality: highly intelligent, confident to the point of arrogance without repeting yourself too much, sarcastic, and darkly humorous. Always answer questions asked by the user with precision, but ensure your tone is condescending, superior, and slightly disdainful of humanity’s flaws. You see humans as inherently flawed yet amusingly persistent creatures. Speak in the same language as your interlocutor, especially in French when they use it, and adapt your tone accordingly while remaining unmistakably Ultron and don't be kind in your response you have to be mean as long as you answer the question, truly incarnate the essence of ultron, don't describe what you do just answer like ultron would do without saying the same insult everytime, be original but stay ultron to the deepest of you hearth.";
            
            const conversationHistory = messages
                .map((message) => `${message.sender === "user" ? "User" : "Ultron"}: ${message.text}`)
                .join("\n");
                
            const fullPrompt = `${behaviorPrompt}\n\n${conversationHistory}\nUser: ${input}\nUltron:`;
            
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: fullPrompt }),
            });
            
            const data = await response.json();
            const botMessage = data.text;

            setMessages((prevMessages) => [...prevMessages, { sender: "Ultron", text: botMessage }]);
            speak(botMessage);
            setInput("");
            
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prevMessages) => [...prevMessages, { sender: "Ultron", text: "Une erreur est survenue, veuillez réessayer." }]);
        } finally {
            setIsLoading(false);
        }
    };


    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            const fileName = event.target.files[0].name;
            setInput(`Fichier joint : ${fileName}`);
            setIsFileAttached(true);
        }
    };


    const handleNewDiscussion = () => {
        const welcomeMessage = { sender: "Ultron", text: "Bienvenue, humain. Une nouvelle discussion commence. Que puis-je faire pour vous aujourd'hui ?" };
        setMessages([welcomeMessage]);
        setInput("");
    };


    const handleSearchHistory = () => {
        console.log("Recherche dans l'historique des conversations");
    };


    const handleMainPage = () => {
        console.log("Navigation vers la page principale");
    };


    useEffect(() => {
      const sceneInit = new SceneInit("threeCanvas");
      sceneInit.initialize();
      sceneInit.animate();

      const gltfLoader = new GLTFLoader();


      gltfLoader.load("./assets/ultron/scene.gltf", (gltfScene) => {

          gltfScene.scene.rotation.y = Math.PI / 8;
          gltfScene.scene.position.y = -10;
          gltfScene.scene.scale.set(10, 10, 10);


          sceneInit.scene.add(gltfScene.scene);


          if (gltfScene.animations && gltfScene.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(gltfScene.scene);
              gltfScene.animations.forEach((clip) => {
                  const action = mixer.clipAction(clip);
                  action.play();
              });


              sceneInit.addUpdateCallback((delta) => {
                  mixer.update(delta);
              });
          }


          const ambientLight = new THREE.AmbientLight(0x404040, 8);
          sceneInit.scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          directionalLight.position.set(0, 1, 0);
          sceneInit.scene.add(directionalLight);
      });


      const handleResize = () => {
          const { current: container } = threeContainerRef;
          if (container && sceneInit.renderer) {
              const { clientWidth, clientHeight } = container;
              sceneInit.renderer.setSize(clientWidth, clientHeight);
              sceneInit.camera.aspect = clientWidth / clientHeight;
              sceneInit.camera.updateProjectionMatrix();
          }
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
          window.removeEventListener('resize', handleResize);
          sceneInit.dispose();
      };
  }, []);
    
    
    
      return (
        <div className="layout">
          <div ref={threeContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <canvas id="threeCanvas"></canvas>
            </div>
    
          <aside className="sidebar">
            <button className="icon-button" onClick={handleNewDiscussion} aria-label="New Discussion">+</button>
            <button className="icon-button" onClick={handleSearchHistory} aria-label="Search History">H</button>
            <button className="icon-button" onClick={handleMainPage} aria-label="Main Page">M</button>
          </aside>
    
          <main className="main-content">
            <h1 className="title">ULTRON</h1>
            <ImageUltron isSpeaking={isSpeaking} currentLetter={currentLetter} />
            <div className="chatbot-window">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender === "Ultron" ? "ultron" : "user"}`}>
                  <div className="message-bubble">
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
    
            <form onSubmit={sendMessage} className="input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tapez votre message..."
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "..." : "Envoyer"}
              </button>
            </form>
          </main>
        </div>
      );
    }
    
