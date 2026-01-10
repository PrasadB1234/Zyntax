import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, MessageSquare, Trash2, ChevronRight } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useUser } from '@/contexts/UserContext';
// Supabase import removed

interface ChatFolder {
  id: string;
  name: string;
  chats: Chat[];
  isExpanded: boolean;
}

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  folderId: string;
}

interface DbChat {
  id: string;
  title: string | null;
  last_message: string | null;
  created_at: string;
  folder_id: string | null;
  user_id: string;
}

export const ChatHistory = () => {
  const { chatSessions, activeChatId, setActiveChatId, deleteChat, folders: contextFolders, createNewChat } = useChat(); // Added deleteChat and others
  const { user } = useUser();
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false); // No loading state needed really

  const currentChat = chatSessions.find(c => c.id === activeChatId) || null;
  const setCurrentChat = (chat: Chat | null) => setActiveChatId(chat ? chat.id : null);

  useEffect(() => {
    // Map context data to ChatHistory UI structure
    const allChats: Chat[] = chatSessions.map(session => ({
      id: session.id,
      title: session.title,
      lastMessage: session.messages[session.messages.length - 1]?.text || '',
      timestamp: session.timestamp,
      folderId: session.folderId || 'default'
    }));

    // Group by folders
    // Use contextFolders to determine which chats are in which folder

    // Default folder (All Chats - or those not in specific folders)
    // Actually, ChatContext folders structure is { folderName: [chatIds] }
    // But ChatHistory expects a list of Folder objects with chats inside.

    // For simplicity in this transition, let's just group everything into "All Chats" or map if folders exist.
    // The previous implementation inferred folderId from the chat object. 
    // My updated ChatContext supports folderId in ChatSession.

    const groupedChats: { [key: string]: Chat[] } = {};

    // Initialize with default
    groupedChats['default'] = [];

    allChats.forEach(chat => {
      const folderId = chat.folderId || 'default';
      if (!groupedChats[folderId]) {
        groupedChats[folderId] = [];
      }
      groupedChats[folderId].push(chat);
    });

    // Also consider empty folders from context if we want to show them
    Object.keys(contextFolders).forEach(folderName => {
      if (!groupedChats[folderName]) {
        groupedChats[folderName] = [];
      }
    });

    const folderStructure: ChatFolder[] = Object.entries(groupedChats).map(([folderId, chats]) => ({
      id: folderId,
      name: folderId === 'default' ? 'All Chats' : folderId, // Using folderId as name for now
      chats: chats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      isExpanded: true
    }));

    setFolders(folderStructure);

  }, [chatSessions, contextFolders]); // Re-run when context data changes

  const handleClearHistory = () => {
    // Logic to clear history -> basically delete all chats
    // We can add a clearAllChats to context or just iterate and delete
    // For now, let's just use createNewChat which effectively resets the view if we were only viewing one, 
    // but to clear all history we need a context method.
    // Since I didn't add clearAll to context, I'll skip it or implementing it would require context update.
    // I'll just clear local folders state for visual effect or loop delete.
    // Let's iterate delete for now as a quick fix, or better, add clearAll to context in next step if needed.
    // Actually, user wants "wipe out", so maybe manually deleting is fine.
    chatSessions.forEach(c => deleteChat(c.id));
  };

  const handleChatClick = (chat: Chat) => {
    setCurrentChat(chat);
  };

  const toggleFolder = (folderId: string) => {
    setFolders(folders.map(folder =>
      folder.id === folderId
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
        <h2 className="text-lg font-semibold text-white">Chat History</h2>
        <button
          onClick={handleClearHistory}
          className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors duration-200"
          title="Clear all chats"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {folders.map(folder => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <button
                onClick={() => toggleFolder(folder.id)}
                className="flex items-center w-full p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors duration-200"
              >
                <Folder className="w-5 h-5 text-[#8B5CF6] mr-2" />
                <span className="flex-1 text-left text-white">{folder.name}</span>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${folder.isExpanded ? 'rotate-90' : ''
                    }`}
                />
              </button>

              <AnimatePresence>
                {folder.isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-4 mt-2 space-y-2"
                  >
                    {folder.chats.map(chat => (
                      <motion.button
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => handleChatClick(chat)}
                        className={`flex items-center w-full p-2 rounded-lg transition-colors duration-200 ${currentChat?.id === chat.id
                          ? 'bg-[#8B5CF6]/20 text-white'
                          : 'hover:bg-[#2A2A2A] text-gray-400 hover:text-white'
                          }`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <span className="flex-1 text-left truncate">{chat.title}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}; 