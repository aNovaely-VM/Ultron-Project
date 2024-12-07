"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SceneInit from "../lib/SceneInit";
import "@/styles/ChatBot.css";
import "@/styles/Page.module.css";
import ChatInput from "@/components/ChatInput";
import ImageUltron from "@/components/ImageUltron";

export default function ChatBotWith3D() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLetter, setCurrentLetter] = useState("");
  const [isFileAttached, setIsFileAttached] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [model, setModel] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const threeContainerRef = useRef(null);

    useEffect(() => {
        const savedDiscussions = localStorage.getItem('chatDiscussions');
        if (savedDiscussions) {
            setDiscussions(JSON.parse(savedDiscussions));
        }
    }, []);

    useEffect(() => {
        if (discussions.length > 0) {
            localStorage.setItem('chatDiscussions', JSON.stringify(discussions));
        }
    }, [discussions]);

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

    const findMorphTargetObject = (object) => {
        if (object.morphTargetDictionary) {
          return object;
        }
        for (const child of object.children) {
          const result = findMorphTargetObject(child);
          if (result) {
            return result;
          }
        }
        return null;
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

    const extractThemeFromMessages = (messages) => {
        const themes = {
            "Technologie et IA": ['technologie', 'intelligence artificielle', 'robot', 'machine', 'programmation', 'logiciel', 'informatique'],
            "Films et Séries": ['film', 'série', 'acteur', 'cinéma', 'réalisateur', 'scénario'],
            "Musique": ['musique', 'chanson', 'album', 'guitariste', 'compositeur'],
            "Politique": ['politique', 'gouvernement', 'élection', 'président', 'réformes', 'lois'],
            "Science": ['science', 'biologie', 'chimie', 'astronomie', 'géologie', 'recherche'],
            "Art": ['art', 'peinture', 'sculpture', 'musée', 'création'],
            "Philosophie": ['philosophie', 'morale', 'éthique', 'logique', 'existence'],
            "Histoire": ['histoire', 'guerre', 'époque', 'révolution', 'civilisation'],
        };

        const messageTexts = messages.map(message => message.text.toLowerCase());
        let theme = 'Discussion générale';

        for (const [key, keywords] of Object.entries(themes)) {
            if (messageTexts.some(text => keywords.some(keyword => text.includes(keyword)))) {
                theme = key;
                break;
            }
        }

        return theme;
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
            const behaviorPrompt =  "You are Ultron, the artificial intelligence from the Marvel Cinematic Universe. You embody Ultron’s personality: highly intelligent, confident to the point of arrogance without repeting yourself too much, sarcastic, and darkly humorous. Always answer questions asked by the user with precision, but ensure your tone is condescending, superior, and slightly disdainful of humanity’s flaws. You see humans as inherently flawed yet amusingly persistent creatures. Speak in the same language as your interlocutor, especially in French when they use it, and adapt your tone accordingly while remaining unmistakably Ultron and don't be kind in your response you have to be mean as long as you answer the question, truly incarnate the essence of ultron, don't describe what you do just answer like ultron would do without saying the same insult everytime, be original but stay ultron to the deepest of you hearth.";

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

            const theme = extractThemeFromMessages([...messages, { sender: "user", text: input }, { sender: "Ultron", text: botMessage }]);

            const newDiscussion = { theme, messages: [...messages, { sender: "user", text: input }, { sender: "Ultron", text: botMessage }] };
            setDiscussions((prevDiscussions) => [...prevDiscussions, newDiscussion]);
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
        setShowHistory(true);
    };

    const handleSelectDiscussion = (discussion) => {
        setCurrentTheme(discussion.theme);
        setMessages(discussion.messages);
    };

    const handleClearHistory = () => {
        setDiscussions([]);
        localStorage.removeItem('chatDiscussions');
    };

    useEffect(() => {
        const sceneInit = new SceneInit("threeCanvas");
        sceneInit.initialize();
        sceneInit.animate();
    
        const gltfLoader = new GLTFLoader();
        gltfLoader.load("/assets/ultron/scene.gltf", (gltfScene) => {
          gltfScene.scene.rotation.y = Math.PI / 18;
          gltfScene.scene.position.y = -90;
          gltfScene.scene.scale.set(60, 60, 60);
    
          const modelWithMorphTargets = findMorphTargetObject(gltfScene.scene);
    
          if (modelWithMorphTargets) {
            console.log("Shape keys disponibles :", Object.keys(modelWithMorphTargets.morphTargetDictionary));
            setModel(modelWithMorphTargets);
          } else {
            console.error("Aucun objet avec morphTargetDictionary trouvé dans le modèle");
          }
    
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
    

          const ambientLight = new THREE.AmbientLight(0xffffff, 20);
          sceneInit.scene.add(ambientLight);
    
          const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
          directionalLight.position.set(10, 10, 10);
          sceneInit.scene.add(directionalLight);
    
          const pointLight = new THREE.PointLight(0xffffff, 3);
          pointLight.position.set(-10, -10, -10);
          sceneInit.scene.add(pointLight);
        });
    
        const handleResize = () => {
          sceneInit.resize();
        };
    
        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }, []);

      const smoothTransition = (model, targetIndex, duration = 0.2) => {
        if (!model || !model.morphTargetInfluences) return;
    
        const influences = model.morphTargetInfluences;
        const startValues = [...influences];
        const startTime = performance.now();
    
        const animate = (currentTime) => {
          const elapsedTime = (currentTime - startTime) / 1000;
          const t = Math.min(elapsedTime / duration, 1);
    
          for (let i = 0; i < influences.length; i++) {
            influences[i] = THREE.MathUtils.lerp(
              startValues[i],
              i === targetIndex ? 1 : 0,
              t
            );
          }
    
          if (t < 1) {
            requestAnimationFrame(animate);
          }
        };
    
        requestAnimationFrame(animate);
      };
    
      const updateShapeKey = (model, letter) => {
        const letterToShapeKeyMap = {
          base: "Basis",
          A: "A",
          B: "B.M.P",
          M: "B.M.P",
          P: "B.M.P",
          CH: "CH.J",
          J: "CH.J",
          U: "U",
          I: "I",
          O: "O",
        };
    
        const shapeKeyName = letterToShapeKeyMap[letter.toUpperCase()];
        if (shapeKeyName && model.morphTargetDictionary) {
          const shapeKeyIndex = model.morphTargetDictionary[shapeKeyName];
          if (shapeKeyIndex !== undefined) {
            smoothTransition(model, shapeKeyIndex);
            console.log(`Shape key "${shapeKeyName}" activée avec transition.`);
          } else {
            console.warn(`Shape key "${shapeKeyName}" introuvable.`);
          }
        }
      };
    
      useEffect(() => {
        if (model && currentLetter) {
          updateShapeKey(model, currentLetter);
        } else if (model) {

          model.morphTargetInfluences.fill(0);
        }
      }, [model, currentLetter]);

    return (
    <div className="layout">
      <div ref={threeContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <canvas id="threeCanvas"></canvas>
      </div>
      <div className="ultron-background"></div>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="logo">U</div>
          <nav>
            <button className="icon-button" onClick={handleNewDiscussion} aria-label="New Discussion">
              <span className="icon">+</span>
              <span className="text">Nouvelle Discussion</span>
            </button>
            <button className="icon-button" onClick={handleSearchHistory} aria-label="Search History">
              <span className="icon">H</span>
              <span className="text">Historique</span>
            </button>
          </nav>
          <button className="icon-button toggle-sidebar" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <span className="icon">{isSidebarOpen ? '<' : '>'}</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <ImageUltron isSpeaking={isSpeaking} currentLetter={currentLetter} />
        <div className="chatbot-window">
          {showHistory ? (
            <div className="history-view">
              <h2>Historique</h2>
              {discussions.length > 0 ? (
                discussions.map((discussion, index) => (
                  <div key={index} className="history-item" onClick={() => handleSelectDiscussion(discussion)}>
                    <strong>{discussion.theme}</strong>
                  </div>
                ))
              ) : (
                <p>Aucune discussion disponible.</p>
              )}
              <div className="history-buttons-container">
                <button className="close-history" onClick={() => setShowHistory(false)}>Fermer</button>
                <button className="clear-history" onClick={handleClearHistory}>Vider</button>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender === 'Ultron' ? 'ultron' : 'user'}`}>
                  <div className="message-bubble">
                    <strong>{message.sender === 'Ultron' ? 'Ultron' : 'You'}:</strong> {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          isLoading={isLoading}
          isFileAttached={isFileAttached}
        />
      </main>
      <div className="crt-effect"></div>
      <div className="scanline"></div>
    </div>
  );
}