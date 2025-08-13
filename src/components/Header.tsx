import { Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  language: "en" | "np";
  onLanguageToggle: () => void;
  username?: string;
  userImage?: string;
}

export const Header = ({ language, onLanguageToggle, username, userImage }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/50">
      <div className="flex items-center justify-between p-4 max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-nepal flex items-center justify-center">
            <span className="text-white font-bold text-sm">नेपाल</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">
              {language === "en" ? "Nepal MCQ" : "नेपाल एमसीक्यू"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "en" ? "Exam Preparation" : "परीक्षा तयारी"}
            </p>
          </div>
        </div>

        {/* Language Toggle and Profile */}
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