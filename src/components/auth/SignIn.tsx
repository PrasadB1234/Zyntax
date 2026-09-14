import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { useClerk } from '@clerk/clerk-react';

interface SignInProps {
  onClose?: () => void;
}

export const SignIn = ({ onClose }: SignInProps) => {
  const { openSignIn } = useClerk();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] rounded-xl w-full max-w-[800px] p-8 relative shadow-2xl border border-[#2A2A2A]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 mb-4 relative"
          >
            <div className="absolute inset-0 bg-[#8B5CF6] rounded-full opacity-20 blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-full p-4">
              <svg viewBox="0 0 24 24" className="text-white w-full h-full">
                <path
                  fill="currentColor"
                  d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"
                />
              </svg>
            </div>
          </motion.div>
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Welcome to <span className="text-[#8B5CF6]">Zyntax</span>
          </motion.h2>
        </div>

        {/* Sign In Button */}

        {/* Sign In Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <Button
            variant="outline"
            onClick={() => {
              openSignIn();
              onClose?.();
            }}
            className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center gap-3 py-6 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] border-none"
          >
            <span className="font-medium text-lg">Sign Up / Sign In</span>
          </Button>
        </motion.div>

        {/* Terms and Privacy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-gray-500 text-center mt-6"
        >
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-[#8B5CF6] hover:text-[#7C3AED] transition-colors">Privacy Policy</a>
        </motion.p>
      </motion.div>
    </motion.div >
  );
}; 