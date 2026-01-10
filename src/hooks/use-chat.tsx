import { useState, useEffect, useRef } from "react";
import { ChatSession, Message, CodeBlock } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { callAeroApi } from "@/services/aeroService";

export const useChat = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [folders, setFolders] = useState<{ [key: string]: string[] }>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const [apiRequestFailed, setApiRequestFailed] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to extract code blocks from message
  const extractCodeBlocks = (message: string): CodeBlock[] => {
    const codeBlocks: CodeBlock[] = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(message)) !== null) {
      codeBlocks.push({
        language: match[1] || 'typescript',
        code: match[2].trim()
      });
    }

    return codeBlocks;
  };

  // Get storage key based on user email
  // Get storage key based on user email
  const getStorageKey = (email?: string) => `mrilo_chat_history_${email || 'guest'}`;

  // Load chat history from localStorage on mount or when user changes
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const storageKey = getStorageKey(user?.email);
        const savedHistory = localStorage.getItem(storageKey);

        if (savedHistory) {
          const {
            messages: savedMessages,
            chatSessions: savedSessions,
            favorites: savedFavorites,
            folders: savedFolders,
            activeChatId: savedActiveChatId
          } = JSON.parse(savedHistory);

          // Set all the saved data
          setChatSessions(savedSessions || []);
          setFavorites(savedFavorites || []);
          setFolders(savedFolders || {});

          // If there was an active chat, restore it
          if (savedActiveChatId) {
            setActiveChatId(savedActiveChatId);
            const activeChat = (savedSessions || []).find((chat: ChatSession) => chat.id === savedActiveChatId);
            if (activeChat) {
              setMessages(activeChat.messages);
            }
          } else if (savedSessions && savedSessions.length > 0) {
            // If no active chat but there are sessions, select the most recent one
            const mostRecentChat = savedSessions[0];
            setActiveChatId(mostRecentChat.id);
            setMessages(mostRecentChat.messages);
          } else {
            // No chats exist, start fresh
            setMessages([]);
            setActiveChatId(null);
          }
        } else {
          // No saved history service, start fresh
          setMessages([]);
          setChatSessions([]);
          setFavorites([]);
          setFolders({});
          setActiveChatId(null);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadChatHistory();
  }, [user?.email]);

  // Save chat history to localStorage whenever messages, chatSessions, favorites, or folders change
  useEffect(() => {
    const saveChatHistory = () => {
      try {
        const storageKey = getStorageKey(user?.email);
        localStorage.setItem(storageKey, JSON.stringify({
          messages,
          chatSessions,
          favorites,
          folders,
          activeChatId
        }));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    };

    if (isInitialized) {
      saveChatHistory();
    }
  }, [messages, chatSessions, favorites, folders, activeChatId, user?.email, isInitialized]);

  // Update messages when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      const activeChat = chatSessions.find(chat => chat.id === activeChatId);
      if (activeChat) {
        setMessages(activeChat.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeChatId, chatSessions]);

  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      timestamp: new Date().toISOString()
    };

    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessages([]);
    setInput("");

    if (inputRef.current) {
      inputRef.current.focus();
    }
    return newChat.id;
  };

  const handleSendMessage = async (message: string, imageUrl?: string | null, isImageGen: boolean = false) => {
    if (!message.trim() || isLoading) return;

    const currentTimestamp = new Date().toISOString();
    let currentChatId = activeChatId;

    // If no active chat, create one
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat: ChatSession = {
        id: newChatId,
        title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
        messages: [],
        timestamp: currentTimestamp
      };

      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      currentChatId = newChatId;
    }

    // Add user message to chat
    const userMessage: Message = {
      text: message,
      isAi: false,
      timestamp: currentTimestamp
    };

    // Update messages state
    setMessages(prev => [...prev, userMessage]);

    // Update chat session
    setChatSessions(prev => prev.map(chat =>
      chat.id === currentChatId
        ? {
          ...chat,
          messages: [...chat.messages, userMessage],
          title: chat.title === "New Chat" ? message.slice(0, 30) + (message.length > 30 ? "..." : "") : chat.title
        }
        : chat
    ));

    setInput("");
    setIsLoading(true);

    try {
      // Determine if it's an image request
      // We check for legacy /image command or the new explicit flag
      const isImageCommand = message.trim().toLowerCase().startsWith('/image');
      const isImageRequest = isImageGen || isImageCommand;

      // If it was a command, we strip the prefix. If it was the flag, we use the message as is.
      const prompt = isImageCommand ? message.substring(6).trim() : message;

      const apiResponse = await callAeroApi(prompt, isImageRequest);

      // Handle the case where the LLM suggests an image generation
      if (!isImageRequest && apiResponse.text && apiResponse.text.trim().toLowerCase().startsWith('/image')) {
        const imageDescription = apiResponse.text.substring(apiResponse.text.toLowerCase().indexOf('/image') + 6).trim();
        const imageResponse = await callAeroApi(imageDescription, true);

        const aiMessage: Message = {
          text: "",
          isAi: true,
          timestamp: new Date().toISOString(),
          imageUrl: imageResponse.imageUrl
        };

        setMessages(prev => [...prev, aiMessage]);

        setChatSessions(prev => prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        ));
        return;
      }

      if (apiResponse.status === 'error') throw new Error(apiResponse.error);

      // Extract code blocks from AI response
      const codeBlocks = extractCodeBlocks(apiResponse.text || "");

      // Add AI response with code blocks
      const aiMessage: Message = {
        text: apiResponse.text || "",
        isAi: true,
        timestamp: new Date().toISOString(),
        codeBlocks,
        imageUrl: apiResponse.imageUrl
      };

      // Update messages state
      setMessages(prev => [...prev, aiMessage]);

      // Update chat session
      setChatSessions(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      ));

    } catch (error) {
      console.error('Message error:', error);

      // Set API failure flag
      setApiRequestFailed(true);

      // Add error message directly to the chat
      const errorMessage: Message = {
        text: "I'm sorry, I'm having trouble connecting to my knowledge sources right now. Please try again later.",
        isAi: true,
        timestamp: new Date().toISOString()
      };

      // Update messages state
      setMessages(prev => [...prev, errorMessage]);

      // Update chat session
      setChatSessions(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ));

      // Show a toast notification
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const onDeleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    setFavorites(prev => prev.filter(id => id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  const onRenameChat = (chatId: string, newTitle: string) => {
    setChatSessions(prev => prev.map(chat =>
      chat.id === chatId
        ? { ...chat, title: newTitle }
        : chat
    ));
  };

  const onToggleFavorite = (chatId: string) => {
    setFavorites(prev =>
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const onMoveToFolder = (chatId: string, folderName: string) => {
    setFolders(prev => ({
      ...prev,
      [folderName]: [...(prev[folderName] || []), chatId]
    }));
  };

  const onCreateFolder = (folderName: string) => {
    setFolders(prev => ({
      ...prev,
      [folderName]: []
    }));
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    chatSessions,
    activeChatId,
    favorites,
    folders,
    setActiveChatId,
    messagesEndRef,
    chatContainerRef,
    inputRef,
    handleNewChat,
    handleSendMessage,
    onDeleteChat,
    onRenameChat,
    onToggleFavorite,
    onMoveToFolder,
    onCreateFolder,
    apiRequestFailed,
    isInitialized
  };
};
