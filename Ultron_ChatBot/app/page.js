"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PlusCircle, History, ChevronLeft, ChevronRight, Sun, Moon, Paperclip, Send } from 'lucide-react';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SceneInit from "../lib/SceneInit";
import "@/styles/ChatBot.css";
import "@/styles/Page.module.css";
import ChatInput from "@/components/ChatInput";
import ImageUltron from "@/components/ImageUltron";

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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('');
  const [selectedDiscussionIndex, setSelectedDiscussionIndex] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceRate, setVoiceRate] = useState(1);
  const [voicePitch, setVoicePitch] = useState(1);
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

  const loadVoices = useCallback(() => {
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      let id;

      const checkVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
          clearInterval(id);
          resolve(voices);
        }
      };

      id = setInterval(checkVoices, 100);
    });
  }, []);

  useEffect(() => {
    loadVoices().then(setVoices);
  }, [loadVoices]);

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

  const speak = useCallback(async (text) => {
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = selectedVoice || voices[0];
    utterance.pitch = voicePitch;
    utterance.rate = voiceRate;
    setIsSpeaking(true);

    let charIndex = 0;

    const simulateBoundary = setInterval(() => {
      const char = cleanText[charIndex] || '';
      if (char.match(/[a-zA-Z]/)) {
        setCurrentLetter(char.toUpperCase());
        updateMorphTargets(char.toUpperCase());
      }
      charIndex += 1;
      if (charIndex >= cleanText.length) {
        clearInterval(simulateBoundary);
        setIsSpeaking(false);
        setCurrentLetter('');
        resetMorphTargets();
      }
    }, 200);

    utterance.onend = () => {
      clearInterval(simulateBoundary);
      setIsSpeaking(false);
      setCurrentLetter('');
      resetMorphTargets();
    };

    speechSynthesis.speak(utterance);
  }, [selectedVoice, voicePitch, voiceRate, voices]);

  const updateMorphTargets = useCallback((letter) => {
    if (model && model.morphTargetDictionary) {
      Object.keys(letterToShapeKeyMap).forEach(key => {
        const shapeKey = letterToShapeKeyMap[key];
        if (model.morphTargetDictionary[shapeKey] !== undefined) {
          model.morphTargetInfluences[model.morphTargetDictionary[shapeKey]] = 0;
        }
      });

      const shapeKey = letterToShapeKeyMap[letter] || letterToShapeKeyMap.base;
      if (model.morphTargetDictionary[shapeKey] !== undefined) {
        smoothTransition(model, model.morphTargetDictionary[shapeKey]);
      }
    }
  }, [model]);

  const resetMorphTargets = useCallback(() => {
    if (model && model.morphTargetDictionary) {
      Object.values(letterToShapeKeyMap).forEach(shapeKey => {
        if (model.morphTargetDictionary[shapeKey] !== undefined) {
          model.morphTargetInfluences[model.morphTargetDictionary[shapeKey]] = 0;
        }
      });
      if (model.morphTargetDictionary["Basis"] !== undefined) {
        model.morphTargetInfluences[model.morphTargetDictionary["Basis"]] = 1;
      }
    }
  }, [model]);

  const smoothTransition = useCallback((model, targetIndex, duration = 0.5) => { 
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
  }, []);

  const findMorphTargetObject = useCallback((object) => {
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
  }, []);

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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
        if (input.toLowerCase().includes("would you lose ?")){
          window.location.href = "https://www.deviantart.com/lanaismar4/art/Nah-I-d-win-1054712475";
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
  if (discussion.theme) {
    setCurrentTheme(discussion.theme);
  }
  setMessages(discussion.messages);
  setShowHistory(false);
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 70);
    sceneInit.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 50);
    directionalLight.position.set(10, 10, 10);
    sceneInit.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 30); 
    pointLight.position.set(-10, -10, -10);
    sceneInit.scene.add(pointLight);


    const headLight = new THREE.PointLight(0xffffff, 20);
    headLight.position.set(0, 50, 50);
    sceneInit.scene.add(headLight);
  });

  const handleResize = () => {
    sceneInit.resize();
  };

  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);

useEffect(() => {
  if (model && currentLetter) {
    updateMorphTargets(currentLetter);
  } else if (model) {
    resetMorphTargets();
  }
}, [model, currentLetter]);

      return (
        <div className={`layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          <div ref={threeContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <canvas id="threeCanvas"></canvas>
          </div>
          <div className="ultron-background">
            <div className="ultron-text">ULTRON</div>
          </div>
          <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-content">
              <div className="logo">U</div>
              <nav>
                <button className="icon-button" onClick={handleNewDiscussion} aria-label="New Discussion">
                  <PlusCircle />
                  <span className="text">Nouvelle Discussion</span>
                </button>
                <button className="icon-button" onClick={handleSearchHistory} aria-label="Search History">
                  <History />
                  <span className="text">Historique</span>
                </button>
              </nav>
              <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                {isDarkMode ? <Sun /> : <Moon />}
                <span className="text">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button className="icon-button toggle-sidebar" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
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
                <div className="messages">
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
        </div>
      );
    }