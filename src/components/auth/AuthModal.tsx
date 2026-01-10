import { SignIn } from "./SignIn";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  if (!isOpen) return null;
  return <SignIn onClose={onClose} />;
};