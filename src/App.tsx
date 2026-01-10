import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ChatProvider } from './contexts/ChatContext';
import { UserProvider } from "@/contexts/UserContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Explore } from "./pages/Explore";
import { CodeEditor } from "./pages/CodeEditor";

const queryClient = new QueryClient();

const App = () => {

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <UserProvider>
              <ChatProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/chat/:chatId" element={<Index />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/editor" element={<CodeEditor />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </ChatProvider>
            </UserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
