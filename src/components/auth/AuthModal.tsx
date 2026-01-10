import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SignIn } from "@clerk/clerk-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1A1A] border-[#2A2A2A] p-4 sm:p-6 flex items-center justify-center">
        <SignIn />
      </DialogContent>
    </Dialog>
  );
}; 