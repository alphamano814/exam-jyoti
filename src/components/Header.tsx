import { Globe, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";

interface HeaderProps {
  language: "en" | "np";
  onLanguageToggle: () => void;
  username?: string;
  userImage?: string;
}

export const Header = ({ language, onLanguageToggle, username, userImage }: HeaderProps) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  
  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/50">
      <div className="flex items-center justify-between p-4 max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-nepal flex items-center justify-center shadow-soft">
            <span className="text-white font-bold">नेपाल</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-foreground">
              {language === "en" ? "Nepal MCQ" : "नेपाल एमसीक्यू"}
            </h1>
          </div>
        </div>

        {/* Language Toggle, Admin Link and Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLanguageToggle}
            className="gap-2 transition-bounce"
          >
            <Globe size={16} />
            <span className="text-xs font-medium">
              {language === "en" ? "नेपाली" : "English"}
            </span>
          </Button>
          
          {/* Admin Link - Only visible to admin users */}
          {user && isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-nepal-primary hover:bg-nepal-primary/10 transition-bounce"
              title="Admin Panel"
              onClick={() => window.location.href = '/admin'}
            >
              <Shield size={14} />
              <span className="text-xs font-medium">Admin</span>
            </Button>
          )}
          
          <Avatar className="w-8 h-8 border-2 border-primary/20">
            <AvatarImage src={userImage} />
            <AvatarFallback className="bg-gradient-nepal text-white text-xs">
              {username ? username.charAt(0).toUpperCase() : <User size={14} />}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};