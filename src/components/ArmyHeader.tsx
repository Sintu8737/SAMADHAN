import React from "react";
import { Shield } from "lucide-react";

interface ArmyHeaderProps {
  title: string;
}

const ArmyHeader: React.FC<ArmyHeaderProps> = ({ title }) => {
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
      </div>
    </header>
  );
};

export default ArmyHeader;
