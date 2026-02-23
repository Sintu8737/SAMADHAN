import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { login } = useAuth();

  const handleLogin = (user: any) => {
    login(user);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            Sign in to access maintenance actions.
          </DialogDescription>
        </DialogHeader>
        <Login onLogin={handleLogin} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
