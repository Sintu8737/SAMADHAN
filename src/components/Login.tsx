import React, { useState } from "react";
import { User, UserRole } from "../types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("unit");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Simple authentication logic (in real app, this would be API call)
    if (username === "admin" && password === "admin") {
      const user: User = {
        id: "1",
        username: username,
        role,
      };
      onLogin(user);
    } else {
      setError("Invalid credentials. Use admin/admin");
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold">SAMADHAN</h2>
        <p className="text-sm text-muted-foreground">
          Strategic Asset Management and Digital Handling of Assets Network
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">Unit</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="eme-battalion">EME Battalion</SelectItem>
              <SelectItem value="div-hq">Div HQ</SelectItem>
              <SelectItem value="engineer-regiment">
                Engineer Regiment
              </SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Demo credentials: admin / admin
      </p>
    </div>
  );
};

export default Login;
