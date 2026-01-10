import React, { useState } from "react";
import { motion } from "framer-motion";
import { Source } from "@/types/chat";
import { SourceList } from "./SourceList";
import { Sparkles, X, Download } from "lucide-react";

interface AiMessageContentProps {
  message: string;
  sources?: Source[];
  imageUrl?: string;
}

export const AiMessageContent = ({ message, sources = [], imageUrl }: AiMessageContentProps) => {
  const [showLargeImage, setShowLargeImage] = useState(false);
  // Format message to improve readability with better formatting and highlighting
  const formattedMessage = message
    // Detect and highlight headings with bolder formatting
    .replace(/^(#+)\s+(.*?)$/gm, (_, hashes, text) => {
      const headingLevel = hashes.length;
      const fontSize = 5 - headingLevel > 0 ? 5 - headingLevel : 0;
      return `<h${headingLevel} class="font-bold text-${fontSize + 12}px mt-4 mb-2">${text}</h${headingLevel}>`;
    })
    // Enhance bold text formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    // Convert bullet points to enhanced styled list items
    .replace(/\n\s*\*\s+(.*?)(?=\n|$)/g, '\n<li class="ml-4 pl-2 py-1 border-l-2 border-gray-600 mb-2">$1</li>')
    // Handle numbered lists with better styling
    .replace(/\n\s*(\d+)\.\s+(.*?)(?=\n|$)/g, '\n<li class="ml-4 pl-2 py-1 flex gap-2 mb-2"><span class="text-gray-400">$1.</span><span>$2</span></li>')
    // Group list items and add spacing
    .replace(/(<li.*?>.*?<\/li>)(\n<li.*?>)/g, '$1$2')
    // Wrap adjacent list items in ul tags for better styling
    .replace(/(<li.*?>.*?<\/li>)+/g, '<ul class="my-3 space-y-1">$&</ul>')
    // Add extra space between paragraphs for readability
    .replace(/\n\n/g, '\n\n<div class="my-3"></div>\n\n')
    // Highlight important phrases with subtle highlight
    .replace(/\*([^*\n]+)\*/g, '<em class="text-blue-300 not-italic">$1</em>')
    // Ensure proper spacing between sections
    .replace(/\n{3,}/g, '\n\n');

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* TejasGPT Header with animation */}
      <motion.div
        className="flex items-center gap-2 mb-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="h-6 w-6 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#8B5CF6]/50 flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/20 to-[#8B5CF6]/0"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <Sparkles className="h-4 w-4 text-white relative z-10" />
        </motion.div>
        <motion.div
          className="flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-sm font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Tejas
          </span>
          <span className="text-sm font-medium text-[#8B5CF6]">
            GPT
          </span>
        </motion.div>
      </motion.div>

      {/* Answer Content with enhanced formatting and animations */}
      {message && (
        <motion.div
          className="space-y-4 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="leading-relaxed break-words text-sm sm:text-base prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300"
            dangerouslySetInnerHTML={{ __html: formattedMessage }}
          />
        </motion.div>
      )}

      {/* Image Content */}
      {imageUrl && (
        <motion.div
          className="mb-5 relative w-full max-w-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] overflow-hidden group hover:border-[#8B5CF6]/50 transition-all duration-300 shadow-lg hover:shadow-[#8B5CF6]/10">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#2A2A2A] bg-[#1A1A1A]/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
                <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Generative Image</span>
              </div>
            </div>

            {/* Image Container */}
            <div
              className="relative aspect-square sm:aspect-video w-full overflow-hidden bg-black/50 cursor-zoom-in"
              onClick={() => setShowLargeImage(true)}
            >
              <img
                src={imageUrl}
                alt="Generated Art"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Action Bar */}
            <div className="px-4 py-3 flex items-center justify-between bg-[#1A1A1A] border-t border-[#2A2A2A]">
              <button
                onClick={() => setShowLargeImage(true)}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span className="bg-[#2A2A2A] p-1.5 rounded-md group-hover:bg-[#333] transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </span>
                Full Size
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const a = document.createElement('a');
                  a.href = imageUrl;
                  a.download = `generated-${Date.now()}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white text-xs font-medium rounded-lg transition-all shadow-lg shadow-[#8B5CF6]/20 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Large Image Modal */}
      {showLargeImage && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowLargeImage(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLargeImage(false);
              }}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={imageUrl}
              alt="Generated Full"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}


      {/* Sources Section with animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SourceList sources={sources} />
      </motion.div>
    </motion.div>
  );
};
