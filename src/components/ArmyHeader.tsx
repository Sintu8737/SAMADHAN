import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface ArmyHeaderProps {
  title: string;
  onLogout?: () => void;
  showLogout?: boolean;
}

const ArmyHeader: React.FC<ArmyHeaderProps> = ({
  title,
  onLogout,
  showLogout = false,
}) => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
  };

  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide md:text-3xl">
              SAMADHAN
            </h1>
            <p className="text-xs text-muted-foreground/90 md:text-sm">
              Strategic Asset Management and Digital Handling of Assets Network
            </p>
            {title && (
              <p className="text-xs text-muted-foreground/80 md:text-sm">
                {title}
              </p>
            )}
          </div>
        </div>

        {showLogout && isAuthenticated && (
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
    </header>
  );
};

export default ArmyHeader;
