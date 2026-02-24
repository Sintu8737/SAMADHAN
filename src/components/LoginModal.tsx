import React from "react";
import { User } from "../types";
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
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            Sign in to access maintenance actions.
          </DialogDescription>
        </DialogHeader>
        <Login onLogin={onLoginSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
