import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { callAeroApi } from '../services/aeroService';

interface Message {
  id: string;
  text: string;
  isAi: boolean;
  timestamp: string;
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
  imageUrl?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
  folderId?: string;
  isFavorite?: boolean;
}

interface ChatContextType {
  messages: Message[];
  chatSessions: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  handleSendMessage: (message: string) => Promise<void>;
  createNewChat: () => void;
  deleteChat: (chatId: string) => void;
  renameChat: (chatId: string, newTitle: string) => void;
  toggleFavorite: (chatId: string) => void;
  moveToFolder: (chatId: string, folderName: string) => void;
  createFolder: (folderName: string) => void;
  favorites: string[];
  folders: { [key: string]: string[] };
  isInitialized: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  // Using a hardcoded user ID for local storage key to simulate a user
  const LOCAL_STORAGE_KEY = 'mrilo_chat_data_v1';

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [folders, setFolders] = useState<{ [key: string]: string[] }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setChatSessions(parsedData.chatSessions || []);
          setFavorites(parsedData.favorites || []);
          setFolders(parsedData.folders || {});

          if (parsedData.activeChatId) {
            setActiveChatId(parsedData.activeChatId);
            const activeSession = (parsedData.chatSessions || []).find((s: ChatSession) => s.id === parsedData.activeChatId);
            if (activeSession) {
              setMessages(activeSession.messages);
            }
          }
        }
      } catch (error) {
        console.error('Error loading chat history from local storage:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const dataToSave = {
        chatSessions,
        favorites,
        folders,
        activeChatId
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving chat history to local storage:', error);
    }
  }, [chatSessions, favorites, folders, activeChatId, isInitialized]);

  // Update messages when active chat changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    const chat = chatSessions.find(c => c.id === activeChatId);
    if (chat) {
      setMessages(chat.messages);
    }
  }, [activeChatId, chatSessions]); // Added chatSessions to dependency array

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    let currentChatId = activeChatId;

    // Create a new chat if there isn't an active one
    if (!currentChatId) {
      const newChatId = crypto.randomUUID();
      const newChat: ChatSession = {
        id: newChatId,
        title: message.slice(0, 30) + '...',
        messages: [],
        timestamp: new Date().toISOString()
      };
      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      currentChatId = newChatId;
      navigate(`/chat/${newChatId}`);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: message,
      isAi: false,
      timestamp: new Date().toISOString()
    };

    // Update messages for the UI immediately
    setMessages(prev => [...prev, userMessage]);

    // Update session state
    setChatSessions(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, userMessage], title: chat.messages.length === 0 ? message.slice(0, 30) + '...' : chat.title }
        : chat
    ));

    // Show typing indicator
    const typingMessage: Message = {
      id: crypto.randomUUID(),
      text: "...",
      isAi: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, typingMessage]);

    try {
      // Determine if it's an image request
      const isImageRequest = message.trim().toLowerCase().startsWith('/image');
      const prompt = isImageRequest ? message.substring(6).trim() : message;

      const apiResponse = await callAeroApi(prompt, isImageRequest);

      // Handle the case where the LLM suggests an image generation
      if (!isImageRequest && apiResponse.text && apiResponse.text.trim().toLowerCase().startsWith('/image')) {
        const imageDescription = apiResponse.text.substring(apiResponse.text.toLowerCase().indexOf('/image') + 6).trim();
        const imageResponse = await callAeroApi(imageDescription, true);

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          text: "",
          isAi: true,
          timestamp: new Date().toISOString(),
          imageUrl: imageResponse.imageUrl
        };

        // Update messages: remove typing, add AI message
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== typingMessage.id);
          return [...filtered, aiMessage];
        });

        // Update session state
        setChatSessions(prev => prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] } // Ensure we append correctly based on latest state if needed, but strict ordering here matches UI flow
            : chat
        ));
        return;
      }

      if (apiResponse.status === 'error') throw new Error(apiResponse.error);

      // Remove typing indicator and add AI response
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: apiResponse.text || "",
        isAi: true,
        timestamp: new Date().toISOString(),
        imageUrl: apiResponse.imageUrl
      };

      // Update messages state
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== typingMessage.id);
        return [...filtered, aiMessage];
      });

      // Update session state
      setChatSessions(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      ));

    } catch (error) {
      console.error('Error sending message:', error);

      // Remove typing indicator and show error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== typingMessage.id);
        return [...filtered, {
          id: crypto.randomUUID(),
          text: "All AI services are currently unavailable. Please check your connection.",
          isAi: true,
          timestamp: new Date().toISOString()
        }];
      });
    }
  };

  const createNewChat = () => {
    setMessages([]); // Clear messages immediately
    const newChat: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      timestamp: new Date().toISOString()
    };
    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    navigate(`/chat/${newChat.id}`);
  };

  const deleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
      navigate('/');
    }
    // Also remove from favorites and folders
    setFavorites(prev => prev.filter(id => id !== chatId));
    setFolders(prev => {
      const newFolders = { ...prev };
      Object.keys(newFolders).forEach(key => {
        newFolders[key] = newFolders[key].filter(id => id !== chatId);
      });
      return newFolders;
    });
  };

  const renameChat = (chatId: string, newTitle: string) => {
    setChatSessions(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const toggleFavorite = (chatId: string) => {
    setFavorites(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const moveToFolder = (chatId: string, folderName: string) => {
    setFolders(prev => {
      const newFolders = { ...prev };
      // Remove from old folder
      Object.keys(newFolders).forEach(folderId => {
        newFolders[folderId] = newFolders[folderId].filter(id => id !== chatId);
      });
      // Add to new folder
      if (!newFolders[folderName]) {
        newFolders[folderName] = [];
      }

      // Check if chat exists before adding
      if (chatSessions.some(c => c.id === chatId)) {
        newFolders[folderName].push(chatId);
      }
      return newFolders;
    });

    // Update local chat session state if we were tracking folderId there (optional depending on how ChatSession is used)
    setChatSessions(prev => prev.map(chat =>
      chat.id === chatId ? { ...chat, folderId: folderName } : chat
    ));
  };

  const createFolder = (folderName: string) => {
    setFolders(prev => ({
      ...prev,
      [folderName]: []
    }));
  };

  return (
    <ChatContext.Provider value={{
      messages,
      chatSessions,
      activeChatId,
      setActiveChatId,
      handleSendMessage,
      createNewChat,
      deleteChat,
      renameChat,
      toggleFavorite,
      moveToFolder,
      createFolder,
      favorites,
      folders,
      isInitialized
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 