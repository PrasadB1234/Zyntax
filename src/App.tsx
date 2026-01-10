import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
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

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_a2V5LWJyZWFtLTc2LmNsZXJrLmFjY291bnRzLmRldiQ";

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key")
}
const App = () => {
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p>Missing Clerk Publishable Key. Please check your .env file and restart the server.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <UserProvider>
                <ChatProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
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
      </ClerkProvider>
    </ErrorBoundary>
  );
};

export default App;
