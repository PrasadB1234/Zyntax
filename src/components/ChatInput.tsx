import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Paperclip, Image as ImageIcon, Palette } from "lucide-react";
import { useState, FormEvent, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ChatInputProps {
  onSendMessage: (message: string, imageUrl?: string | null, isImageGen?: boolean) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when disabled state changes to false (after loading)
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Add click handler to focus input
  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    };

    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('click', handleClick);
    }

    return () => {
      if (form) {
        form.removeEventListener('click', handleClick);
      }
    };
  }, [disabled]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setSelectedFile(file);

      // Convert image to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(`user-images/${Date.now()}-${file.name}`, file);

      if (error) {
        console.error("Upload Error:", error);
        return;
      }

      const publicUrl = supabase
        .storage
        .from('chat-images')
        .getPublicUrl(data.path).data.publicUrl;

      setImageUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || imageUrl) && !disabled) {
      onSendMessage(message, imageUrl, isImageMode);

      setMessage("");
      setImageUrl(null);
      setSelectedFile(null);
      setIsImageMode(false);
    }
  };

  const handleFileButtonClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.style.display = 'none';
    input.onchange = (e) => {
      handleImageUpload(e);
    };
    input.click();
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setMessage(prev => prev + pastedText);
      e.preventDefault();
    }
  };



  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      {/* Image Preview */}
      {imageUrl && (
        <div className="mb-3 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/10 to-[#8B5CF6]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full max-h-32 object-cover rounded-xl border border-[#2A2A2A] transition-all duration-300 group-hover:border-[#8B5CF6]/30"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-gray-400 hover:text-white transition-all duration-300"
              onClick={() => {
                setImageUrl(null);
                setSelectedFile(null);
              }}
            >
              <span className="sr-only">Remove image</span>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      <div className={`relative flex items-center gap-2 px-2 rounded-2xl border bg-[#1A1A1A] shadow-lg transition-all duration-300 group-hover:border-gray-600 group-focus-within:border-[#8B5CF6]/50 group-focus-within:shadow-[#8B5CF6]/5 group-focus-within:scale-[1.02] ${isImageMode ? 'border-[#8B5CF6] shadow-[#8B5CF6]/20' : 'border-[#2A2A2A]'}`}>
        {/* Animated background glow */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/5 to-[#8B5CF6]/0 transition-opacity duration-300 pointer-events-none ${isImageMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

        {/* Action buttons (Left) */}
        <div className="flex items-center gap-1 shrink-0 z-10">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="relative h-10 w-10 rounded-full text-gray-400 hover:bg-gray-700/30 transition-all duration-300 group/clip"
            onClick={handleFileButtonClick}
            disabled={isUploading}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/10 to-[#8B5CF6]/0 opacity-0 group-hover/clip:opacity-100 transition-opacity duration-300" />
            <ImageIcon className="h-5 w-5 transition-all duration-300 group-hover/clip:scale-110 group-hover/clip:text-[#8B5CF6] group-hover/clip:-rotate-12" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={`relative h-10 w-10 rounded-full transition-all duration-300 group/palette ${isImageMode ? 'text-[#8B5CF6] bg-[#8B5CF6]/10' : 'text-gray-400 hover:bg-gray-700/30'}`}
            onClick={() => setIsImageMode(!isImageMode)}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/10 to-[#8B5CF6]/0 opacity-0 group-hover/palette:opacity-100 transition-opacity duration-300" />
            <Palette className={`h-5 w-5 transition-all duration-300 group-hover/palette:scale-110 group-hover/palette:text-[#8B5CF6] group-hover/palette:rotate-12 ${isImageMode ? 'rotate-12' : ''}`} />
          </Button>
        </div>

        {/* Enhanced input */}
        <Input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          placeholder={isImageMode ? "Describe the image you want to generate..." : (selectedFile ? `Selected Image: ${selectedFile.name}` : "Ask anything...")}
          disabled={disabled || isUploading}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-4 text-sm sm:text-base text-gray-300 placeholder:text-gray-500 h-[52px] min-w-0"
        />

        {/* Submit button (Right) */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          <Button
            type="submit"
            size="icon"
            disabled={(!message.trim() && !imageUrl) || disabled || isUploading}
            className={`relative h-10 w-10 rounded-full transition-all duration-300 disabled:opacity-30 group/submit z-20 shadow-lg ${isImageMode ? 'bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 shadow-violet-500/25' : 'bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 shadow-[#8B5CF6]/20'}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B5CF6]/0 via-[#8B5CF6]/20 to-[#8B5CF6]/0 opacity-0 group-hover/submit:opacity-100 transition-opacity duration-300" />
            <ArrowUp className="h-5 w-5 text-white transition-all duration-300 group-hover/submit:scale-110 group-hover/submit:text-white group-hover/submit:-translate-y-0.5" />
          </Button>
        </div>
      </div>
    </form>
  );
};
